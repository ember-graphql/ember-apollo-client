import { moduleFor, test } from 'ember-qunit';
import Ember from 'ember';
import { print } from 'graphql';

import commonTags from 'npm:common-tags';

const { stripIndent } = commonTags;

const { run } = Ember;

moduleFor('route:new-review', 'Unit | Route | new-review');

test('it exists', function(assert) {
  let route = this.subject();
  assert.ok(route);
});

test('it should perform a createReview mutation from the createReview action', function(assert) {
  assert.expect(2);

  let route = this.subject();

  let review = { stars: 3, commentary: "It's a trap!" };

  // expect a mutation to create a review
  let expectedMutation = stripIndent`
    mutation createReview($ep: Episode!, $review: ReviewInput!) {
      createReview(episode: $ep, review: $review) {
        review {
          ...ReviewFragment
        }
      }
    }

    fragment ReviewFragment on Human {
      stars
      commentary
    }
  `;
  let apollo = {
    mutate({ mutation, variables }) {
      assert.equal(print(mutation).trim(), expectedMutation.trim());
      assert.deepEqual(
        variables,
        { ep: 'JEDI', review },
        'it passes in the mutation variables'
      );
      return {
        createReview: {
          review: {
            ep: 'JEDI',
            commentary: "It's a trap"
          }
        }
      };
    }
  };
  route.set('apollo', apollo);

  // actually send the createReview action
  run(() => {
    route.send('createReview', 'JEDI', review);
  });
});
