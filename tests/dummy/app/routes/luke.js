import Ember from 'ember';
import UnsubscribeRoute from 'ember-apollo-client/mixins/unsubscribe-route';
import gql from 'graphql-tag';

const {
  inject: { service }
} = Ember;

export default Ember.Route.extend(UnsubscribeRoute, {
  apollo: service(),
  model() {
    let query = gql`
      query human($id: ID!) {
        human(id: $id) {
          name
        }
      }
    `;
    let variables = { id: '1000' };
    return this.get('apollo').query({ query, variables }, 'human');
  }
});
