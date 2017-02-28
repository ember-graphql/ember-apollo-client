import Ember from 'ember';
import gql from 'graphql-tag';

// working around browserify limitations:
import 'npm:common-tags';


const {
  inject: { service },
  Object: EmberObject,
  Route
} = Ember;

const ReviewFragment = gql`
  fragment ReviewFragment on Human {
    stars
    commentary
  }
`;

export default Route.extend({
  apollo: service(),

  model() {
    return EmberObject.create({});
  },

  actions: {
    createReview(ep, review) {
      let mutation = gql`
        mutation createReview($ep: Episode!, $review: ReviewInput!) {
          createReview(episode: $ep, review: $review) {
            review {
              ...ReviewFragment
            }
          }
        }

        ${ReviewFragment}
      `;
      let variables = { ep, review };
      return this.get('apollo').mutate({ mutation, variables }, 'review');
    }
  }
});
