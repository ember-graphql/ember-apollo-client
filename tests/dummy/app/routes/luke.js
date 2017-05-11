import Ember from 'ember';
import UnsubscribeRoute from 'ember-apollo-client/mixins/unsubscribe-route';
import query from 'dummy/gql/queries/human';

const { inject: { service } } = Ember;

const variables = { id: '1000' };

export default Ember.Route.extend(UnsubscribeRoute, {
  apollo: service(),
  model() {
    return this.get('apollo').query({ query, variables }, 'human');
  },

  actions: {
    refetchModel() {
      this.get('apollo').queryOnce({
        query,
        variables,
        fetchPolicy: 'network-only',
      });
    },
  },
});
