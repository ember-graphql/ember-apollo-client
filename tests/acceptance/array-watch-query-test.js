import { module, test } from 'qunit';
import { setupApplicationTest } from 'dummy/tests/helpers/setup';
import { addResolveFunctionsToSchema } from 'graphql-tools';
import { click, currentURL, find, findAll, visit } from '@ember/test-helpers';

const mockReviews = [
  {
    stars: 3,
    commentary: 'Nice!',
    __typename: 'Review',
  },
];

module('Acceptance | array watchQuery', function(hooks) {
  setupApplicationTest(hooks);

  let schema;

  hooks.beforeEach(function() {
    schema = this.pretender.schema;
  });

  test('should re-render updating an array using watchQuery', async function(assert) {
    let resolvers = {
      Query: {
        reviews(/*obj, args*/) {
          return new Promise(resolve => {
            setTimeout(() => {
              resolve(mockReviews);
            }, 200);
          });
        },
      },
    };

    addResolveFunctionsToSchema({ schema, resolvers });

    await visit('/reviews');
    assert.equal(currentURL(), '/reviews');

    assert.equal(findAll('.reviews-list li').length, 1, 'has one item');
    assert.equal(find('.model-stars').innerText, '3', 'has correct stars');

    mockReviews[0].stars = 2;
    mockReviews.push({
      stars: 5,
      commentary: 'Awesome!',
    });

    await click('.refetch-data');
    assert.equal(
      findAll('.reviews-list li').length,
      2,
      'should have updated the list'
    );

    assert.equal(
      findAll('.model-stars')[0].innerText,
      '2',
      'has correct updated stars'
    );

    assert.equal(
      findAll('.model-stars')[1].innerText,
      '5',
      'has correct stars for new data'
    );
  });
});
