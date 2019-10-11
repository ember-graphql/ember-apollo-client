import Route from '@ember/routing/route';
import EmberObject from '@ember/object';
import mutation from 'dummy/gql/mutations/create-review';
import { inject as service } from '@ember/service';

export default Route.extend({
  apollo: service(),

  model() {
    return EmberObject.create({});
  },

  actions: {
    createReview(movieId, review) {
      let variables = { movieId, review };
      return this.apollo.mutate({ mutation, variables }, 'review');
    },
  },
});
