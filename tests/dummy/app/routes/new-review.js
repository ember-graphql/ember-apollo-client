import Route from '@ember/routing/route';
import EmberObject from '@ember/object';
import mutation from 'dummy/gql/mutations/create-review';

export default Route.extend({
  model() {
    return EmberObject.create({});
  },

  actions: {
    createReview(ep, review) {
      let variables = { ep, review };
      return this.get('apollo').mutate({ mutation, variables }, 'review');
    },
  },
});
