import Component from '@ember/component';
import layout from '../templates/components/create-review';
import mutation from 'dummy/gql/mutations/create-review';
import { inject as service } from '@ember/service';

export default Component.extend({
  layout,

  init() {
    this._super(...arguments);

    this.review = {};
    this.response = null;
  },

  apollo: service(),

  actions: {
    createReview(movieId, stars, commentary) {
      let variables = {
        movieId,
        review: {
          stars: parseInt(stars),
          commentary,
        },
      };

      return this.apollo.mutate({ mutation, variables }).then((response) => {
        this.set('response', JSON.stringify(response));
      });
    },
  },
});
