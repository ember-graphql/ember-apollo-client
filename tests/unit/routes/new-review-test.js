import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';
import { print } from 'graphql';
import { stripIndent } from 'common-tags';

module('Unit | Route | new-review', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:new-review');
    assert.ok(route);
  });

  test('it should perform a createReview mutation from the createReview action', function(assert) {
    assert.expect(2);

    let route = this.owner.lookup('route:new-review');

    let review = { stars: 3, commentary: "It's a trap!" };

    // expect a mutation to create a review
    let expectedMutation = stripIndent`
      mutation createReview($movieId: ID!, $review: ReviewInput!) {
        createReview(movieId: $movieId, review: $review) {
          ...ReviewFragment
        }
      }

      fragment ReviewFragment on Review {
        stars
        commentary
      }
    `;
    let apollo = {
      mutate({ mutation, variables }) {
        assert.equal(print(mutation).trim(), expectedMutation.trim());
        assert.deepEqual(
          variables,
          { movieId: '123', review },
          'it passes in the mutation variables'
        );
        return {
          createReview: {
            review: {
              movieId: '123',
              commentary: "It's a trap",
            },
          },
        };
      },
    };
    route.set('apollo', apollo);

    // actually send the createReview action
    run(() => {
      route.send('createReview', '123', review);
    });
  });
});
