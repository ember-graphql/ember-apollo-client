import { module, test } from 'qunit';
import { setupApplicationTest } from 'dummy/tests/helpers/setup';
import { addResolveFunctionsToSchema } from 'graphql-tools';
import { click, visit, fillIn } from '@ember/test-helpers';

module('Acceptance | mutations', function (hooks) {
  setupApplicationTest(hooks);

  let schema;

  hooks.beforeEach(function () {
    schema = this.pretender.schema;
  });

  test('creates a review and return data from the mutation', async function (assert) {
    assert.expect(2);

    let resolvers = {
      Mutation: {
        createReview(_, variables) {
          assert.deepEqual(
            variables,
            {
              movieId: '123',
              review: {
                stars: 3,
                commentary: "It's a trap!",
              },
            },
            'it passes in the mutation variables'
          );
          return {
            movieId: '123',
            stars: 3,
            commentary: "It's a trap",
          };
        },
      },
    };
    addResolveFunctionsToSchema({ schema, resolvers });

    await visit('/new-review');

    await fillIn('.movie-id', '123');
    await fillIn('.review-stars', '3');
    await fillIn('.review-commentary', "It's a trap!");

    await click('.create-review-button');

    assert
      .dom('.create-review-response')
      .hasText(
        '{"createReview":{"stars":3,"commentary":"It\'s a trap","__typename":"Review"}}'
      );
  });
});
