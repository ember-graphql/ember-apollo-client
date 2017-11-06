# ember-apollo-client

*Use [apollo-client][apollo-client] and GraphQL from your Ember app.*

![Download count all time](https://img.shields.io/npm/dt/ember-apollo-client.svg) [![npm version](https://badge.fury.io/js/ember-apollo-client.svg)](https://badge.fury.io/js/ember-apollo-client) [![Travis CI Build Status](https://travis-ci.org/bgentry/ember-apollo-client.svg?branch=master)](https://travis-ci.org/bgentry/ember-apollo-client) [![Ember Observer Score](https://emberobserver.com/badges/ember-apollo-client.svg)](https://emberobserver.com/addons/ember-apollo-client)

This addon exposes the following dependencies to an ember application:

* [apollo-client][apollo-client]
* [graphql][graphql-repo]
* [graphql-tag][graphql-tag-repo]
* [graphql-tools][graphql-tools-repo]

I have been using the non-addon version of this in my own app for several months.
Because I've actually used it to build a real app, I've encountered and solved
a few real-world problems such as reliable testing and preventing resource leaks
by unsubscribing from watch queries.

[graphql-repo]: https://github.com/graphql/graphql-js "GraphQL"
[graphql-tag-repo]: https://github.com/apollostack/graphql-tag "graphql-tag"
[graphql-tools-repo]: https://github.com/apollostack/graphql-tools "graphql-tools"

## Installation

* `ember install ember-apollo-client`

## Compatibility
This addon is tested against the `release`, `beta`, and `canary` channels, as
well as the latest two LTS releases.

## Configuration

In your app's `config/environment.js`, configure the URL for the GraphQL API:

```js
var ENV = {
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

Though it is not recommended, you can also use the `graphql-tag` package to
write your queries within your JS file:

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

Within your routes, you can query for data using the `RouteQueryManager`
mixin and `watchQuery`:

`app/routes/some-route.js`
```js
import Ember from "ember";
import RouteQueryManager from "ember-apollo-client/mixins/route-query-manager";
import query from "my-app/gql/queries/human";

export default Ember.Route.extend(RouteQueryManager, {
  model(params) {
    let variables = { id: params.id };
    return this.apollo.watchQuery({ query, variables }, "human");
  }
});
```

This performs a [`watchQuery` on the ApolloClient][watch-query]. The resulting object is an
`Ember.Object` and therefore has full support for computed properties,
observers, etc.

If a subsequent query (such as a mutation) happens to fetch the same data while
this query's subscription is still active, the object will immediately receive
the latest attributes (just like ember-data).

Please note that when using `watchQuery`, you must
[unsubscribe][unsubscribing] when you're done with the query data. You should
only have to worry about this if you're using the [Apollo
service][apollo-service-api] directly. If you use the `RouteQueryManager`
mixin in your routes, or the `ComponentQueryManager` in your data-loading
components, or the `ObjectQueryManager` in your data-loading on service or class that extend `Ember.Object`, all active watch queries are tracked and unsubscribed when the route is exited or the component and Ember.Object is destroyed. These mixins work by injecting a query manager named `apollo` that functions as a proxy to the `apollo`
service.

You can instead use `query` if you just want a single query with a POJO
response and no watch updates.

If you need to access the Apollo Client [ObservableQuery][observable-query],
such as for pagination, you can retrieve it from a `watchQuery` result using
`getObservable`:

```js
import { getObservable } from "ember-apollo-client";

export default Ember.Route.extend(RouteQueryManager, {
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
#import 'my-app/gql/fragments/review-fragment'

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
import Ember from "ember";
import mutation from "my-app/gql/mutations/create-review";

export default Ember.Route.extend({
  apollo: Ember.inject.service(),

  model() {
    return Ember.Object.create({});
  },

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
  resolves with an `Ember.Object`. That object will be updated whenever the
  `watchQuery` subscription resolves with new data. As before, the `resultKey`
  can be used to resolve beneath the root.

  The query manager will automatically unsubscribe from this object.
* `query(options, resultKey)`: This calls the
  [`ApolloClient.query`](http://dev.apollodata.com/core/apollo-client-api.html#ApolloClient\.query)
  method. It returns a promise that resolves with the raw POJO data that the
  query returns. If you provide a `resultKey`, the resolved data is grabbed from
  that key in the result.
* `mutate(options, resultKey)`: This calls the
  [`ApolloClient.mutate`](http://dev.apollodata.com/core/apollo-client-api.html#ApolloClient\.mutate)
  method. It returns a promise that resolves with the raw POJO data that the
  mutation returns. As with the query methods, the `resultKey` can be used to
  resolve beneath the root.

### Apollo service API

You should not need to use the Apollo service directly for most regular
usage, instead utilizing the `RouteQueryManager`, `ObjectQueryManager` and `ComponentQueryManager` mixins. However, you will probably need to customize options on the `apollo` service, and might need to query it directly for some use cases (such as
loading data from a service rather than a route or component).

The `apollo` service has the following public API:

* `clientOptions`: This computed property should return the options hash that
  will be passed to the `ApolloClient` [constructor][ac-constructor]. You can
  override this property to configure the client this service uses:
  ```js
  const OverriddenService = ApolloService.extend({
    clientOptions: computed(function() {
      let opts = this._super(...arguments);
      return merge(opts, {
        dataIdFromObject: customDataIdFromObject
      });
    }),
  });
  ```
* `middlewares`: This computed property provides a list of [middlewares](http://dev.apollodata.com/core/network.html#networkInterfaceMiddleware) to the network interface. You can use the macro `middlewares` to create your middlewares:
  ```js
  import middlewares from "ember-apollo-client/utils/middlewares";

  const OverriddenService = ApolloService.extend({
    middlewares: middlewares("authorize"),

    authorize(req, next) {
      // Authorization logic
      next();
    }
  });
  ```

  Or create them on your own:
  ```js
  const OverriddenService = ApolloService.extend({
    middlewares: computed(function() {
      return [
        { applyMiddleware: (req, next) => this.authorize(req, next) }
      ];
    }),

    authorize(req, next) {
      // Authorization logic
      next();
    }
  });
  ```
* `watchQuery(options, resultKey)`: This calls the
  [`ApolloClient.watchQuery`][watch-query] method. It returns a promise that
  resolves with an `Ember.Object`. That object will be updated whenever the
  `watchQuery` subscription resolves with new data. As before, the
  `resultKey` can be used to resolve beneath the root.

  When using this method, **it is important to [unsubscribe][unsubscribing]**
  from the query when you're done with it.
* `queryOnce(options, resultKey)`: This calls the
  [`ApolloClient.query`](http://dev.apollodata.com/core/apollo-client-api.html#ApolloClient\.query)
  method. It returns a promise that resolves with the raw POJO data that the
  query returns. If you provide a `resultKey`, the resolved data is grabbed from
  that key in the result.
* `mutate(options, resultKey)`: This calls the
  [`ApolloClient.mutate`](http://dev.apollodata.com/core/apollo-client-api.html#ApolloClient\.mutate)
  method. It returns a promise that resolves with the raw POJO data that the
  mutation returns. As with the query methods, the `resultKey` can be used to
  resolve beneath the root.

### Unsubscribing from watch queries

Apollo Client's `watchQuery` will continue to update the query with new data
whenever the store is updated with new data about the resolved objects. This
happens until you explicitly unsubscribe from it.

In ember-apollo-client, most unsubscriptions are handled automatically by the
`RouteQueryManager`, `ObjectQueryManager` and `ComponentQueryManager` mixins, so long as you use them.

If you're fetching data elsewhere, such as in an Ember Service, or if you use
the Apollo service directly, you are responsible for unsubscribing from
`watchQuery` results when you're done with them. This is exposed on the
result of `query` via a method `_apolloUnsubscribe`.

### Injecting the `RouteQueryManager` mixin into all routes

ember-apollo-client does not automatically inject any dependencies into your
routes. If you want to inject this mixin into all routes, you should utilize
a base route class:

`app/routes/base.js`
```js
import Ember from "ember";
import RouteQueryManager from "ember-apollo-client/mixins/route-query-manager";

export default Ember.Route.extend(RouteQueryManager);
```

Then extend from that in your other routes:

`app/routes/a-real-route.js`
```js
import Base from "my-app/routes/base";

export default Base.extend(
  ...
)
```

### Testing

This addon is test-ready! All promises from the apollo service are tracked with
`Ember.Test.registerWaiter`, so your tests should be completely deterministic.

The dummy app contains example routes for mutations and queries:

* [Acceptance test for a regular query](https://github.com/bgentry/ember-apollo-client/blob/master/tests/acceptance/query-and-unsubscribe-test.js)
* [Route integration test for a mutation with a fragment](https://github.com/bgentry/ember-apollo-client/blob/master/tests/unit/routes/new-review-test.js)

The tests also contain a sample Star Wars GraphQL schema with an
[ember-cli-pretender setup][pretender-setup] for mock data.

[pretender-setup]: https://github.com/bgentry/ember-apollo-client/blob/master/tests/helpers/start-pretender.js

## Development

### Installation

* `git clone https://github.com/bgentry/ember-apollo-client` this repository
* `cd ember-apollo-client`
* `npm install`

### Running

* `ember serve`
* Visit your app at [http://localhost:4200](http://localhost:4200).

### Running Tests

* `npm test` (Runs `ember try:each` to test your addon against multiple Ember versions)
* `ember test`
* `ember test --server`

### Building

* `ember build`

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).

## Contributors

A special thanks to the following contributors:

* Dan Freeman ([@dfreeman](https://github.com/dfreeman))
* Vinícius Sales ([@viniciussbs](https://github.com/viniciussbs))
* Laurin Quast ([@n1ru4l](https://github.com/n1ru4l))
* Elias Balafoutis ([@balaf](https://github.com/balaf))

[ac-constructor]: http://dev.apollodata.com/core/apollo-client-api.html#ApolloClient\.constructor
[apollo-client]: https://github.com/apollostack/apollo-client
[apollo-service-api]: #apollo-service-api
[observable-query]: http://dev.apollodata.com/core/apollo-client-api.html#ObservableQuery
[query-manager-api]: #query-manager-api
[unsubscribing]: #unsubscribing-from-watch-queries
[watch-query]: http://dev.apollodata.com/core/apollo-client-api.html#ApolloClient\.watchQuery
