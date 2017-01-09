import Ember from 'ember';
import UnsubscribeRouteMixin from 'ember-apollo-client/mixins/unsubscribe-route';
import gql from 'graphql-tag';

const {
  inject: { service }
} = Ember;

export default Ember.Route.extend(UnsubscribeRouteMixin, {
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
