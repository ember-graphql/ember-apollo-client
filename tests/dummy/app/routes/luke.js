import Ember from 'ember';
import RouteQueryManager from 'ember-apollo-client/mixins/route-query-manager';
import query from 'dummy/gql/queries/human';

const { inject: { service } } = Ember;

const variables = { id: '1000' };

export default Ember.Route.extend(RouteQueryManager, {
  apollo: service(),
  model() {
    return this.apollo.query({ query, variables }, 'human');
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
