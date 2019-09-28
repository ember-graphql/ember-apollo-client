import { module, test } from 'qunit';
import { setupApplicationTest } from 'dummy/tests/helpers/setup';
import { addResolveFunctionsToSchema } from 'graphql-tools';
import { click, currentURL, findAll, visit } from '@ember/test-helpers';

const mockMovies = [
  {
    id: 680,
    title: 'Pulp Fiction',
    popularity: 30.437,
    posterUrl:
      'https://image.tmdb.org/t/p/w185_and_h278_bestv2/dM2w364MScsjFf8pfMbaWUcWrR.jpg',
    overview: 'Lorem ipsum',
    releaseDate: '1994-10-14',
    __typename: 'Movie',
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
        movies(/*obj, args*/) {
          return new Promise(resolve => {
            setTimeout(() => {
              resolve(mockMovies);
            }, 200);
          });
        },
      },
    };

    addResolveFunctionsToSchema({ schema, resolvers });

    await visit('/');
    assert.equal(currentURL(), '/');

    assert.equal(findAll('.movie-list .item').length, 1, 'has one item');
    assert.dom('.movie-overview').hasText('Lorem ipsum');

    mockMovies[0].overview = 'Updated overview';
    mockMovies.push({
      id: 13,
      title: 'Forrest Gump',
      popularity: 31.962,
      posterUrl:
        'https://image.tmdb.org/t/p/w185_and_h278_bestv2/yE5d3BUhE8hCnkMUJOo1QDoOGNz.jpg',
      overview: 'lorem',
      releaseDate: '1994-07-06',
    });

    await click('.refresh-data');
    assert.equal(
      findAll('.movie-list .item').length,
      2,
      'should have updated the list'
    );

    assert.equal(
      findAll('.movie-overview')[0].innerText,
      'Updated overview',
      'has correct updated overview'
    );

    assert.equal(
      findAll('.movie-overview')[1].innerText,
      'lorem',
      'has correct overview for new data'
    );
  });
});
