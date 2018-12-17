import Route from '@ember/routing/route';
import { RouteQueryManager } from 'ember-apollo-client';
import query from 'dummy/gql/queries/characters.graphql';

export default Route.extend(RouteQueryManager, {
  queryParams: {
    kind: {
      refreshModel: true,
    },
  },

  model(variables) {
    return this.get('apollo').watchQuery({ query, variables }, 'characters');
  },
});
