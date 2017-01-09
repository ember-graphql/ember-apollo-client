import Ember from 'ember';
import gql from 'graphql-tag';

const {
  inject: { service }
} = Ember;

export default Ember.Route.extend({
  apollo: service(),
  model() {
    let query = gql`
      query human($id: String!) {
        human(id: $id) {
          name
        }
      }
    `;
    let variables = { id: '1000' };
    return this.get('apollo').query({ query, variables }, 'human');
  }
});
