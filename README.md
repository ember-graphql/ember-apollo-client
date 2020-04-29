# ember-apollo-client

_Use [apollo-client][apollo-client] and GraphQL from your Ember app._

![Download count all time](https://img.shields.io/npm/dt/ember-apollo-client.svg)
[![npm version](https://badge.fury.io/js/ember-apollo-client.svg)](https://badge.fury.io/js/ember-apollo-client)
[![Build Status](https://github.com/ember-graphql/ember-apollo-client/workflows/CI/badge.svg)](https://github.com/ember-graphql/ember-apollo-client/actions)
[![Ember Observer Score](https://emberobserver.com/badges/ember-apollo-client.svg)](https://emberobserver.com/addons/ember-apollo-client)

This addon is battle tested: it has been used to build several large apps. As such, we've solved real-world problems such as reliable testing and preventing resource leaks by unsubscribing from watch queries.

## Installation

```
ember install ember-apollo-client
```

This should also automatically install `ember-fetch` and `graphql`.

Install the [Apollo Client Developer tools for Chrome](https://chrome.google.com/webstore/detail/apollo-client-developer-t/jdkknkkbebbapilgoeccciglkfbmbnfm) for a great GraphQL developer experience!

## Compatibility

* Ember.js v3.12 or above
* Ember CLI v2.13 or above
* Node.js v10 or above
* FastBoot 1.0+

For compatibility with Ember versions below 3.4, use version 1.x.

## Configuration

### Runtime configuration

In your app's `config/environment.js`, configure the URL for the GraphQL API.

```js
let ENV = {
  ...
  apollo: {
    apiURL: 'https://test.example/graphql',
    // Optionally, set the credentials property of the Fetch Request interface
    // to control when a cookie is sent:
    // requestCredentials: 'same-origin', // other choices: 'include', 'omit'
  },
  ...
}
```

Additional configuration of the ApolloClient can be done by extending the Apollo
service and overriding the `clientOptions` property. See the
[Apollo Service API][apollo-service-api] for more info.

### Build time configuration

In your app's `ember-cli-build.js`, you can set build time options for [broccoli-graphql-filter](https://github.com/csantero/broccoli-graphql-filter) to keep file extensions in `.graphql` files.

```js
module.exports = function(defaults) {
  let app = new EmberApp(defaults, {
    emberApolloClient: {
      keepGraphqlFileExtension: true
    }
  });

  return app.toTree();
};

```

`keepGraphqlFileExtension = false`, optional – If `true`, creates files called `my-query.graphql.js` instead of `my-query.js`, so that you can import them as `./my-query.graphql` instead of `./my-query`.

Example:

```js
import myQuery from 'my-app/queries/my-query.graphql';
```

### Dependencies

This addon uses [ember-auto-import](https://github.com/ef4/ember-auto-import) to import dependencies.

This addon does not exposes any dependencies directly to your application, so
if you desire any additional graphql or apollo dependencies, install them with
npm/yarn and import as desired.

Here are some useful packages:

* [apollo-client][apollo-client]
* [apollo-cache][apollo-cache]
* [apollo-cache-inmemory][apollo-cache-inmemory]
* [apollo-link][apollo-link]
* [apollo-link-context][apollo-link-context]
* [apollo-link-http][apollo-link-http]
* [graphql-tag][graphql-tag-repo]
* [graphql-tools][graphql-tools-repo]

[graphql-repo]: https://github.com/graphql/graphql-js "GraphQL"
[apollo-cache]: https://www.npmjs.com/package/apollo-cache
[apollo-cache-inmemory]: https://www.npmjs.com/package/apollo-cache-inmemory
[apollo-link]: https://github.com/apollographql/apollo-link
[apollo-link-context]: https://www.npmjs.com/package/apollo-link-context
[apollo-link-http]: https://www.npmjs.com/package/apollo-link-http
[graphql-tag-repo]: https://github.com/apollographql/graphql-tag "graphql-tag"
[graphql-tools-repo]: https://github.com/apollographql/graphql-tools "graphql-tools"

Make sure to use ember-auto-import in your application to import these
additional packages.

#### Peer Dependencies

This addon has a peer dependency of:

* [graphql][graphql-repo]

## Usage

### Fetching data

GraphQL queries should be placed in external files, which are automatically
made available for import:

`app/gql/queries/human.graphql`

```graphql
query human($id: String!) {
  human(id: $id) {
    name
  }
}
```

You can also use the `graphql-tag` package to write your queries within your
JS file:

```js
import gql from "graphql-tag";

const query = gql`
  query human($id: String!) {
    human(id: $id) {
      name
    }
  }
`;
```

> **Note:** Inline queries like the one above are compiled at *runtime*. This is
> both slower than external files (which are precompiled) and involves shipping
> extra dependencies in your vendor.js. For the time being, we recommend using
> external files for your queries.
>
> If you are looking for an opportunity to contribute, enabling precompilation
> of inline queries would be a fantastic feature to work on.

Within your routes, you can query for data using the `queryManager`
computed macro and `watchQuery`:

`app/routes/some-route.js`

```js
import Route from "@ember/routing/route";
import { queryManager } from "ember-apollo-client";
import query from "my-app/gql/queries/human";

export default Route.extend({
  apollo: queryManager(),

  model(params) {
    let variables = { id: params.id };
    return this.apollo.watchQuery({ query, variables }, "human");
  }
});
```

This performs a [`watchQuery` on the ApolloClient][watch-query]. The resulting object is a POJO.

If a subsequent query (such as a mutation) happens to fetch the same data while
this query's subscription is still active, the object will immediately receive
the latest attributes (just like ember-data).

Please note that when using `watchQuery`, you must
[unsubscribe][unsubscribing] when you're done with the query data. You should
only have to worry about this if you're using the [Apollo
service][apollo-service-api] directly. If you use the `queryManager` computed macro in your routes, or in your data-loading
components or class that extend `Ember.Object`, all active watch queries are tracked and unsubscribed when the route is exited or the component and Ember.Object is destroyed.

You can instead use `query` if you just want a single query with a POJO
response and no watch updates.

If you need to access the Apollo Client [ObservableQuery][observable-query],
such as for pagination, you can retrieve it from a `watchQuery` result using
`getObservable`:

```js
import Route from "@ember/routing/route";
import { getObservable, queryManager} from "ember-apollo-client";

export default Route.extend({
  apollo: queryManager(),

  model() {
    let result = this.apollo.watchQuery(...);
    let observable = getObservable(result);
    observable.fetchMore(...) // utilize the ObservableQuery
    ...
  }
});
```

See the [detailed query manager docs][query-manager-api] for more details on
usage, or the [Apollo service API][apollo-service-api] if you need to use
the service directly.

### GraphQL Subscriptions

GQL Subscriptions allow a client to subscribe to specific queries they are interested in tracking. The syntax for doing this is similar to `query` / `watchQuery`, but there are a few main differences:

- you must define a `subscription` (versus a `query` or `mutation`)
- because subscriptions are async by nature, you have to listen for these events and act accordingly.
- subscriptions require websockets, so must configure your `link` accordingly

#### Creating your subscription

`app/gql/subscriptions/new-human.graphql`

```graphql
subscription {
  newHuman() {
    name
  }
}
```

#### Subscribing from inside a route

`app/routes/some-route.js`

```js
import Route from '@ember/routing/route';
import { queryManager } from 'ember-apollo-client';
import query from 'app/gql/subscriptions/new-human';
import { addListener, removeListener } from '@ember/object/events';

const handleEvent = event => alert(`${event.name} was just born!`);

export default Route.extend({
  apollo: queryManager(),

  model() {
    return this.get('apollo').subscribe({ query }, 'human');
  },

  setupController(controller, model) {
    addListener(model, 'event', handleEvent);
  },

  resetController(controller, isExiting, transition) {
    if (isExiting) {
      removeListener(controller.model, 'event', handleEvent);
    }
  }
});
```

The big advantage of using the `queryManager` is that when you navigate away from this route, all subscriptions created will be terminated. That said, if you want to manually unsubscribe (or are not using the `queryManager`) `subscription.unsubscribe()` will do the trick.

**Enabling Websockets**

While this library should work w/ any back-end implementation, here's an example with Authenticated [Phoenix](https://github.com/phoenixframework/phoenix) + [Absinthe](https://github.com/absinthe-graphql/absinthe):

`my-app/services/apollo.js`
```js
import ApolloService from 'ember-apollo-client/services/apollo';
import { inject as service } from '@ember/service';
import { Socket } from 'phoenix';
import { createAbsintheSocketLink } from '@absinthe/socket-apollo-link';
import AbsintheSocket from '@absinthe/socket';

class OverriddenApollo extends ApolloService {
  @service
  session;

  link() {
    const socket = new Socket("ws://socket-url", {
      params: { token: this.get('session.token') },
    });
    const absintheSocket = AbsintheSocket.create(socket);

    return createAbsintheSocketLink(absintheSocket);
  }
}

```

Note: This will switch **all** gql communication to use websockets versus `http`.
If you want to conditionally use websockets for only subscriptions (a common pattern)
this is where [Apollo Link Composition](https://www.apollographql.com/docs/link/composition.html) comes in.
Specifically, the `split` function is what we're after (note we are using
[apollo-utilities](https://www.npmjs.com/package/apollo-utilities), a helpful `npm` package):

`my-app/services/apollo.js`
```js
import ApolloService from 'ember-apollo-client/services/apollo';
import { inject as service } from '@ember/service';
import { Socket } from 'phoenix';
import { split } from 'apollo-link';
import { getMainDefinition } from 'apollo-utilities';
import { createAbsintheSocketLink } from '@absinthe/socket-apollo-link';
import AbsintheSocket from '@absinthe/socket';

class OverriddenApollo extends ApolloService {
  @service
  session;

  link() {
    let httpLink = super.link();

    const socket = new Socket("ws://socket-url", {
      params: { token: this.get('session.token') },
    });
    const socketLink = createAbsintheSocketLink(AbsintheSocket.create(socket));

    return split(
      ({ query }) => {
        const { kind, operation } = getMainDefinition(query);

        return kind === 'OperationDefinition' && operation === 'subscription';
      },
      socketLink,
      httpLink
    );
  }
}
```

Note: You will need to add the following dependencies to your project:

```sh
yarn add -D apollo-link
yarn add -D apollo-utilities
yarn add -D @absinthe/socket
yarn add -D @absinthe/socket-apollo-link
```

### Mutations and Fragments

You can perform a mutation using the `mutate` method. You can also use GraphQL
fragments in your queries. This is especially useful if you want to ensure that
you refetch the same attributes in a subsequent query or mutation involving the
same model(s).

The following example shows both mutations and fragments in action:

`app/gql/fragments/review-fragment.graphql`

```graphql
fragment ReviewFragment on Human {
  stars
  commentary
}
```

`app/gql/mutations/create-review.graphql`

```graphql
#import ReviewFragment from 'my-app/gql/fragments/review-fragment'

mutation createReview($ep: Episode!, $review: ReviewInput!) {
  createReview(episode: $ep, review: $review) {
    review {
      ...ReviewFragment
    }
  }
}
```

`app/routes/my-route.js`

```js
import Route from "@ember/routing/route";
import { inject as service } from "@ember/service";
import mutation from "my-app/gql/mutations/create-review";

export default Route.extend({
  apollo: service(),

  actions: {
    createReview(ep, review) {
      let variables = { ep, review };
      return this.get("apollo").mutate({ mutation, variables }, "review");
    }
  }
});
```

### Query manager API

* `watchQuery(options, resultKey)`: This calls the
  [`ApolloClient.watchQuery`][watch-query] method. It returns a promise that
  resolves with a POJO. That object will be updated whenever the
  `watchQuery` subscription resolves with new data. As before, the `resultKey`
  can be used to resolve beneath the root.

  The query manager will automatically unsubscribe from this object.
* `subscribe(options, resultKey)`: This calls the
  [`ApolloClient.subscribe`][subscribe] method. It returns a promise that
  resolves with an `EmberApolloSubscription`. You can use this object in a few ways to keep
  track of your subscription:
  - emberApolloSubscription.lastEvent; // return the most recently received event data

  ```js
  //import { addListener, removeListener } from '@ember/object/events';

  const result = await this.apollo.subscribe(
    {
      subscription: mySubscription,
    }
  );

  const handleEvent = event => {
    console.log('event received', event)
  };

  // Add listener to new data
  addListener(result, 'event', handleEvent);

  // Remove the listener from new data
  removeListener(result, 'event', handleEvent);
  ```

  As before, the `resultKey` can be used to resolve beneath the root.

  The query manager will automatically unsubscribe from this object. If you want to manually
  unsubscribe, you can do so with `emberApolloSubscription.apolloUnsubscribe();`
* `query(options, resultKey)`: This calls the
  [`ApolloClient.query`](https://www.apollographql.com/docs/react/api/apollo-client.html#ApolloClient.query)
  method. It returns a promise that resolves with the raw POJO data that the
  query returns. If you provide a `resultKey`, the resolved data is grabbed from
  that key in the result.
* `mutate(options, resultKey)`: This calls the
  [`ApolloClient.mutate`](https://www.apollographql.com/docs/react/api/apollo-client.html#ApolloClient.mutate)
  method. It returns a promise that resolves with the raw POJO data that the
  mutation returns. As with the query methods, the `resultKey` can be used to
  resolve beneath the root.

### Apollo service API

You should not need to use the Apollo service directly for most regular
usage, instead utilizing the `queryManager` computed macro. However, you will probably need to customize options on the `apollo` service, and might need to query it directly for some use cases (such as
loading data from a service rather than a route or component).

The `apollo` service has the following public API:

* `clientOptions`: This function should return the options hash that
  will be passed to the `ApolloClient` [constructor][ac-constructor]. You can
  override this function to configure the client this service uses:
  ```js
  class OverriddenApolloService extends ApolloService {
    clientOptions() {
      return {
        link: this.link(),
        cache: this.cache(),
      };
    }
  }
  ```
* `link`: This function provides a list of [middlewares and afterwares](https://www.apollographql.com/docs/react/advanced/network-layer.html#network-interfaces) to the [Apollo Link](https://www.apollographql.com/docs/link/) the interface for fetching and modifying control flow of GraphQL requests. To create your middlewares/afterwares:

  ```js
    link() {
      let httpLink = super.link()

      // Middleware
      let authMiddleware = setContext(async(request, context) => {
        if (!token) {
          token = await localStorage.getItem('token') || null;
        }

        Object.assign(context.headers, {
          headers: {
            authorization: token
          }
        });

        return context;
      });

      // Afterware
      const resetToken = onError(({ networkError }) => {
        if (networkError && networkError.statusCode === 401) {
          // remove cached token on 401 from the server
          token = undefined;
        }
      });

      const authFlowLink = authMiddleware.concat(resetToken);

      return authFlowLink.concat(httpLink);
    }
  ```

  Example with [ember-simple-auth](https://github.com/simplabs/ember-simple-auth):


  ```js
  import ApolloService from 'ember-apollo-client/services/apollo';
  import { inject as service } from '@ember/service';
  import { setContext } from 'apollo-link-context';
  import { Promise } from 'rsvp';

  class OverriddenApollo extends ApolloService {
    @service
    session;

    link() {
      let httpLink = super.link();

      let authLink = setContext((request, context) => {
        return this._runAuthorize(request, context);
      });
      return authLink.concat(httpLink);
    }

    _runAuthorize() {
      if (!this.get('session.isAuthenticated')) {
        return {};
      }
      return new Promise(success => {
        this.get('session').authorize(
          'authorizer:oauth2',
          (headerName, headerContent) => {
            let headers = {};
            headers[headerName] = headerContent;
            success({ headers });
          }
        );
      });
    }
  }
  ```

  Note: You will need to add the following dependencies to your project:

  ```sh
  yarn add -D apollo-link-context
  ```

* `watchQuery(options, resultKey)`: This calls the
  [`ApolloClient.watchQuery`][watch-query] method. It returns a promise that
  resolves with a POJO. That object will be updated whenever the
  `watchQuery` subscription resolves with new data. As before, the
  `resultKey` can be used to resolve beneath the root.

  When using this method, **it is important to [unsubscribe][unsubscribing]**
  from the query when you're done with it.

* `query(options, resultKey)`: This calls the
  [`ApolloClient.query`](https://www.apollographql.com/docs/react/api/apollo-client.html#ApolloClient.query)
  method. It returns a promise that resolves with the raw POJO data that the
  query returns. If you provide a `resultKey`, the resolved data is grabbed from
  that key in the result.
* `mutate(options, resultKey)`: This calls the
  [`ApolloClient.mutate`](https://www.apollographql.com/docs/react/api/apollo-client.html#ApolloClient.mutate)
  method. It returns a promise that resolves with the raw POJO data that the
  mutation returns. As with the query methods, the `resultKey` can be used to
  resolve beneath the root.

### Unsubscribing from watch queries

Apollo Client's `watchQuery` will continue to update the query with new data
whenever the store is updated with new data about the resolved objects. This
happens until you explicitly unsubscribe from it.

In `ember-apollo-client`, most unsubscriptions are handled automatically by the
`queryManager` computed macro, so long as you use it.

If you're fetching data elsewhere, such as in an Ember Service, or if you use
the Apollo service directly, you are responsible for unsubscribing from
`watchQuery` results when you're done with them, you can use `unsubscribe`:

```js
import Service from "@ember/service";
import { unsubscribe } from "ember-apollo-client";
import { inject as service } from '@ember/service';

export default Service.extend( {
  apollo: service(),
  result: null,

  init() {
    this._super(...arguments);
    this.result = this.apollo.watchQuery(...);
  },

  willDestroy() {
    unsubscribe(this.result)
  }
});
```

### queryManager as decorator

The `queryManager` computed macro can be used as a decorator when using Ember v3.10.0 or above.

```js
import Route from '@ember/routing/route';
import { queryManager } from 'ember-apollo-client'
import query from 'my-app/gql/queries/human';

export default class MyAwesomeRoute extends Route {
  @queryManager apollo;

  model({ id }) {
    let variables = { id };
    return this.apollo.watchQuery({ query, variables });
  }
}
```

### queryManager options

The `queryManager` computed macro can accept an options hash with the name of the service to use as apollo.
If your application has a custom apollo service or multiple apollo services that extends from `ember-apollo-client/services/apollo`, you can use this option to specify which apollo service to use.

```js
// imports ...

export default class MyAwesomeRoute extends Route {
  @queryManager({ service: 'my-custom-apollo-service' }) apollo;

  // ...
}
```

### Use with Fastboot

Ember Apollo Client works with FastBoot out of the box as long that SSR is enabled. In order to enable SSR, define it on apollo service:

Example:

```js
class OverriddenApolloService extends ApolloService {
  clientOptions() {
    const opts = super.clientOptions();
    return {...opts, ssrMode: true };
  }
}
```

Since you only want to fetch each query result once, pass the `ssrMode: true` option to the Apollo Client constructor to avoid repeated force-fetching.

#### Skipping queries for SSR

If you want to intentionally skip a query during SSR, you can pass `ssr: false` in the query options. Typically, this will mean the component will get rendered in its loading state on the server. For example:

```js
actions: {
  refetchModel() {
    this.get('apollo').query({
      query,
      variables,
      // Don't run this query on the server
      ssr: false
    });
  }
}
```

### Using With TypeScript

When using TypeScript (with [ember-cli-typescript](https://github.com/typed-ember/ember-cli-typescript) in your Ember app) you will quickly run into an error like:

> Cannot find module './users.graphql'.

This error happens when you import a `*.graphql` file, e.g. `import query from './users.graphql';`.
The quick solution is to use `// @ts-ignore`, but that is only a patch for the one place you've used the import.

To define basic types for those imports, you need to add the following to `types/global.d.ts`:

```ts
// Apollo GraphQL imports
declare module '*.graphql' {
  const doc: import('graphql').DocumentNode;
  export default doc;
}
```

Note: The `graphql` module above is included when you `ember install ember-cli-typescript`.

### Testing

This addon is test-ready! All promises from the apollo service are tracked with
`Ember.Test.registerWaiter`, so your tests should be completely deterministic.

The dummy app contains example routes for mutations and queries:

* [Acceptance test for a regular query](https://github.com/ember-graphql/ember-apollo-client/blob/master/tests/acceptance/query-and-unsubscribe-test.js)
* [Route integration test for a mutation with a fragment](https://github.com/ember-graphql/ember-apollo-client/blob/master/tests/unit/routes/new-review-test.js)

The tests also contain a sample Star Wars GraphQL schema with an
[pretender setup][pretender-setup] for mock data.

[pretender-setup]: https://github.com/ember-graphql/ember-apollo-client/blob/master/tests/helpers/start-pretender.js

## Development

### Installation

* `git clone https://github.com/ember-graphql/ember-apollo-client` this repository
* `cd ember-apollo-client`
* `yarn install`

### Linting

* `yarn run lint:hbs`
* `yarn run lint:js`
* `yarn run lint:js --fix`

### Running tests

* `ember test` – Runs the test suite on the current Ember version
* `ember test --server` – Runs the test suite in "watch mode"
* `ember try:each` – Runs the test suite against multiple Ember versions

### Running the dummy application

* `ember serve`
* Visit the dummy application at [http://localhost:4200](http://localhost:4200).

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).

## Contributors

A special thanks to the following contributors:

* Michael Villander ([@villander](https://github.com/villander))
* Dan Freeman ([@dfreeman](https://github.com/dfreeman))
* Vinícius Sales ([@viniciussbs](https://github.com/viniciussbs))
* Laurin Quast ([@n1ru4l](https://github.com/n1ru4l))
* Elias Balafoutis ([@balaf](https://github.com/balaf))
* Katherine Smith ([@TerminalStar](https://github.com/TerminalStar))
* Greg Coladarci ([@coladarci](https://github.com/coladarci))
* Josemar Luedke ([@josemarluedke](https://github.com/josemarluedke))

[ac-constructor]: https://www.apollographql.com/docs/react/api/apollo-client/#ApolloClientOptions
[apollo-client]: https://github.com/apollographql/apollo-client
[apollo-service-api]: #apollo-service-api
[observable-query]: https://www.apollographql.com/docs/react/api/apollo-client/#observablequery-functions
[query-manager-api]: #query-manager-api
[unsubscribing]: #unsubscribing-from-watch-queries
[watch-query]: https://www.apollographql.com/docs/react/api/apollo-client/#ApolloClient.watchQuery
[subscribe]: https://www.apollographql.com/docs/react/api/apollo-client/#ApolloClient.subscribe

## Contributing

See the [Contributing](CONTRIBUTING.md) guide for details.

## License

This project is licensed under the [MIT License](LICENSE.md).
