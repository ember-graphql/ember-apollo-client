import Ember from 'ember';
import mutation from 'dummy/gql/mutations/create-review';

const {
  Object: EmberObject,
  Route
} = Ember;

export default Route.extend({
  model() {
    return EmberObject.create({});
  },

  actions: {
    createReview(ep, review) {
      let variables = { ep, review };
      return this.get('apollo').mutate({ mutation, variables }, 'review');
    }
  }
});
