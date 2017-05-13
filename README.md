# ember-apollo-client

*Use [apollo-client][apollo-client] and GraphQL from your Ember app.*

![Download count all time](https://img.shields.io/npm/dt/ember-apollo-client.svg) [![npm version](https://badge.fury.io/js/ember-apollo-client.svg)](https://badge.fury.io/js/ember-apollo-client) [![Travis CI Build Status](https://travis-ci.org/bgentry/ember-apollo-client.svg?branch=master)](https://travis-ci.org/bgentry/ember-apollo-client) [![Ember Observer Score](https://emberobserver.com/badges/ember-apollo-client.svg)](https://emberobserver.com/addons/ember-apollo-client)

This addon includes the following dependencies:

* [apollo-client][apollo-client]
* [graphql][graphql-repo]
* [graphql-tag][graphql-tag-repo]
* [graphql-tools][graphql-tools-repo]

I have been using the non-addon version of this in my own app for a few months.
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
well as the latest LTS.

## Configuration

In your app's `config/environment.js`, configure the URL for the GraphQL API:

```js
var ENV = {
  ...
  apollo: {
    apiURL: 'https://test.example/graphql'
  },
  ...
}
```

Additional configuration of the ApolloClient can be done by extending the Apollo
service and overriding the `clientOptions` property. See the
[Apollo Service API][apollo-service-api] for more info.

## Usage

### Fetching data

The addon makes available an `apollo` service. Inject it into your routes and
you can then use it:

```js
import Ember from 'ember';
import gql from 'graphql-tag';
import UnsubscribeRoute from 'ember-apollo-client/mixins/unsubscribe-route';

export default Ember.Route.extend(UnsubscribeRoute, {
  apollo: Ember.inject.service(),

  model(params) {
    let query = gql`
      query human($id: String!) {
        human(id: $id) {
          name
        }
      }
    `;
    let variables = { id: params.id };
    return this.get('apollo').query({ query, variables }, 'human');
  }
});
```

When you use the `query` method, ember-apollo is actually performing a
`watchQuery` on the ApolloClient. The resulting object is an `Ember.Object` and
therefore has full support for computed properties, observers, etc.

If a subsequent query (such as a mutation) happens to fetch the same data while
this query's subscription is still active, the object will immediately receive
the latest attributes (just like ember-data).

Please note that when using `query`, you should unsubscribe when you're done
with the query data. You can instead use `queryOnce` if you just want a single
query with a POJO response and no watch updates.

See the [API docs](#apollo-service-api)
for more details.

### Mutations and Fragments

You can perform a mutation using the `mutate` method. You can also use GraphQL
fragments in your queries. This is especially useful if you want to ensure that
you refetch the same attributes in a subsequent query or mutation involving the
same model(s).

The following example shows both mutations and fragments in action:

```js
import Ember from 'ember';
import gql from 'graphql-tag';

const ReviewFragment = gql`
  fragment ReviewFragment on Human {
    stars
    commentary
  }
`;

export default Ember.Route.extend({
  apollo: Ember.inject.service(),

  model() {
    return Ember.Object.create({});
  },

  actions: {
    createReview(ep, review) {
      let mutation = gql`
        mutation createReview($ep: Episode!, $review: ReviewInput!) {
          createReview(episode: $ep, review: $review) {
            review {
              ...ReviewFragment
            }
          }
        }

        ${ReviewFragment}
      `;
      let variables = { ep, review };
      return this.get('apollo').mutate({ mutation, variables }, 'review');
    }
  }
});
```

### Apollo service API

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
      };
    }),
  });
  ```
* `middlewares`: This computed property provides a list of [middlewares](http://dev.apollodata.com/core/network.html#networkInterfaceMiddleware) to the network interface. You can use the macro `middlewares` to create your middlewares:
  ```js
  import middlewares from 'ember-apollo-client/utils/middlewares';

  const OverriddenService = ApolloService.extend({
    middlewares: middlewares('authorize'),

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
* `query(options, resultKey)`: This calls the
  [`ApolloClient.watchQuery`](http://dev.apollodata.com/core/apollo-client-api.html#ApolloClient\.watchQuery)
  method. It returns a promise that resolves with an `Ember.Object`. That object
  will be updated whenever the `watchQuery` subscription resolves with new data.
  As before, the `resultKey` can be used to resolve beneath the root.

  When using this method, **it is important to
  [unsubscribe](#unsubscribing-from-watch-queries)** from the query when you're
  done with it.
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

Apollo client's watchQuery will continue to update the query with new data
whenever the store is updated with new data about the resolved objects. This
happens until you explicitly unsubscribe from it.

In ember-apollo-client, this is exposed on the result of `query` via a method
`_apolloUnsubscribe`. You should call this method whenever you're done with the
query. On a route, this can be done with the `resetController` hook. In a
component, this cleanup is typically done with a `willDestroyElement` hook.

To make this easier on routes, this addon also provides a mixin called
`UnsubscribeRoute`. You can use it in your route like this:

```js
import Ember from 'ember';
import UnsubscribeRoute from 'ember-apollo-client/mixins/unsubscribe-route';

export default Ember.Route.extend(UnsubscribeRoute, {
  model() {
    return this.get('apollo').query(...);
  }
});
```

The mixin will call `_apolloUnsubscribe` on the `model` (if it is set) when the
model changes or the route deactivates. For now, this only works if your model
was resolved directly from the apollo service. It does not work if your `model`
hook returns an `RSVP.hash` of multiple queries, or something of that sort.
You'd have to clean up manually in that scenario.

### Injecting the apollo service into all routes

The apollo service is not automatically injected into your routes, but you can
do so easily with an initializer like this one:

```js
export function initialize(application) {
  application.inject('route', 'apollo', 'service:apollo');
}

export default {
  name: 'apollo',
  initialize
};
```

### Testing

This addon is test-ready! All promises from the apollo service are tracked with
`Ember.Test.registerWaiter`, so your tests should be completely deterministic.

The dummy app contains example routes for mutations and queries:

* [Acceptance test for a regular query](https://github.com/bgentry/ember-apollo-client/blob/master/tests/acceptance/main-test.js)
* [Route integration test for a mutation with a fragment](https://github.com/bgentry/ember-apollo-client/blob/master/tests/unit/routes/new-review-test.js)

The tests also contain a sample Star Wars GraphQL schema with an
[ember-cli-pretender setup][pretender-setup] for mock data.

[pretender-setup]: https://github.com/bgentry/ember-apollo-client/blob/master/tests/helpers/start-pretender.js

## Development

### Installation

* `git clone https://github.com/bgentry/ember-apollo-client` this repository
* `cd ember-apollo-client`
* `npm install`
* `bower install`

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

[ac-constructor]: http://dev.apollodata.com/core/apollo-client-api.html#ApolloClient\.constructor
[apollo-client]: https://github.com/apollostack/apollo-client
[apollo-service-api]: https://github.com/bgentry/ember-apollo-client#apollo-service-api
