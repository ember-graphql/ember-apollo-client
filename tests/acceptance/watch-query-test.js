import { module, test } from 'qunit';
import { setupApplicationTest } from 'dummy/tests/helpers/setup';
import { addResolveFunctionsToSchema } from 'graphql-tools';
import { click, currentURL, visit } from '@ember/test-helpers';

module('Acceptance | watch query', function (hooks) {
  setupApplicationTest(hooks);

  const mockMovie = {
    id: 680,
    title: 'Pulp Fiction',
    voteAverage: 8.4,
    posterPath: '/dM2w364MScsjFf8pfMbaWUcWrR.jpg',
    overview: 'lorem',
    releaseDate: '1994-10-14',
  };

  test('data should be updated when executing a mutation', async function (assert) {
    let movie = Object.assign({}, mockMovie);
    let resolvers = {
      Query: {
        movie(_, args) {
          assert.deepEqual(args, { id: '680' });

          return new Promise((resolve) => {
            setTimeout(() => {
              resolve(movie);
            }, 200);
          });
        },
      },
      Mutation: {
        changeMovieTitle(_, { id, title }) {
          assert.equal(id, movie.id, 'correct mutation id is passed in');
          assert.equal(
            title,
            'Rambo: Last Blood',
            'correct mutation title is passed in'
          );
          return Object.assign({}, movie, { title });
        },
      },
    };

    addResolveFunctionsToSchema({ schema: this.pretender.schema, resolvers });

    await visit('/movie/680');
    assert.equal(currentURL(), '/movie/680');

    assert.dom('.movie-title').hasText('Pulp Fiction');
    await click('.change-movie-title');

    assert.dom('.movie-title').hasText('Rambo: Last Blood');
  });

  test('refetch using observable should update data and wait for response', async function (assert) {
    let isRefetch = false;
    let resolvers = {
      Query: {
        movie(_, args) {
          assert.deepEqual(args, { id: '680' });

          if (isRefetch) {
            return new Promise((resolve) => {
              setTimeout(() => {
                resolve(
                  Object.assign({}, mockMovie, { title: 'The Godfather' })
                );
              }, 200);
            });
          }

          return Promise.resolve(mockMovie);
        },
      },
    };

    addResolveFunctionsToSchema({ schema: this.pretender.schema, resolvers });

    await visit('/movie/680');
    assert.equal(currentURL(), '/movie/680');

    assert.dom('.movie-title').hasText('Pulp Fiction');

    isRefetch = true;
    await click('.refetch-data-using-observable');

    assert.dom('.movie-title').hasText('The Godfather');
  });

  test('refetch using reoute refresh should update template', async function (assert) {
    let isRefetch = false;
    let resolvers = {
      Query: {
        movie(_, args) {
          assert.deepEqual(args, { id: '680' });

          if (isRefetch) {
            return new Promise((resolve) => {
              setTimeout(() => {
                resolve(
                  Object.assign({}, mockMovie, { title: 'The Godfather' })
                );
              }, 200);
            });
          }

          return Promise.resolve(mockMovie);
        },
      },
    };

    addResolveFunctionsToSchema({ schema: this.pretender.schema, resolvers });

    await visit('/movie/680');
    assert.equal(currentURL(), '/movie/680');

    assert.dom('.movie-title').hasText('Pulp Fiction');

    isRefetch = true;
    await click('.refresh-data');

    assert.dom('.movie-title').hasText('The Godfather');
  });
});
