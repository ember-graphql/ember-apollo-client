import Ember from 'ember';
import RouteQueryManager from 'ember-apollo-client/mixins/route-query-manager';
import query from 'dummy/gql/queries/human';

const variables = { id: '1000' };

export default Ember.Route.extend(RouteQueryManager, {
  model() {
    return this.apollo.watchQuery({ query, variables }, 'human');
  },

  actions: {
    refetchModel() {
      this.apollo.query({
        query,
        variables,
        fetchPolicy: 'network-only',
      });
    },
  },
});
