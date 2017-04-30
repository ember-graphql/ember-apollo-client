import Ember from 'ember';
import UnsubscribeRoute from 'ember-apollo-client/mixins/unsubscribe-route';
import gql from 'graphql-tag';

const { inject: { service } } = Ember;

const query = gql`
  query human($id: ID!) {
    human(id: $id) {
      name
    }
  }
`;

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
