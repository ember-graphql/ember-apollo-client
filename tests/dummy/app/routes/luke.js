import Route from '@ember/routing/route';
import { queryManager } from 'ember-apollo-client';
import query from 'dummy/gql/queries/human';

const variables = { id: '1000' };

export default Route.extend({
  apollo: queryManager(),

  model() {
    return this.get('apollo').watchQuery(
      {
        query,
        variables,
        fetchPolicy: 'cache-and-network',
      },
      'human'
    );
  },

  actions: {
    refetchModel() {
      this.get('apollo').query({
        query,
        variables,
        fetchPolicy: 'network-only',
      });
    },
  },
});
