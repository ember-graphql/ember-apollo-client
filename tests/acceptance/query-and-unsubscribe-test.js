import { module, test } from 'qunit';
import { setupApplicationTest } from 'dummy/tests/helpers/setup';
import { addResolveFunctionsToSchema } from 'graphql-tools';
import { click, currentURL, visit } from '@ember/test-helpers';
import { run } from '@ember/runloop';

module('Acceptance | main', function (hooks) {
  setupApplicationTest(hooks);

  const mockMovieNotTop = {
    id: 680,
    title: 'Pulp Fiction',
    voteAverage: 8.4,
    posterPath: '/dM2w364MScsjFf8pfMbaWUcWrR.jpg',
    overview: 'lorem',
    releaseDate: '1994-10-14',
  };

  const mockMovieTopRated = {
    id: 238,
    title: 'The Godfather',
    voteAverage: 8.6,
    posterPath: '/rPdtLWNsZmAtoZl9PK7S2wE3qiS.jpg',
    overview: 'lorem',
    releaseDate: '1972-03-15',
  };

  test('visiting /movie/id', async function (assert) {
    let movie = Object.assign({}, mockMovieNotTop);
    let resolvers = {
      Query: {
        movie(obj, args) {
          assert.deepEqual(args, { id: '680' });
          return Object.assign({}, movie);
        },
      },
    };
    addResolveFunctionsToSchema({ schema: this.pretender.schema, resolvers });

    let apollo = this.owner.lookup('service:apollo');
    let getQueries = () => apollo.client.queryManager.getQueryStore();

    await visit('/movie/680');

    assert.equal(currentURL(), '/movie/680');
    assert.dom('.movie-title').hasText('Pulp Fiction');

    // try updating the mock, refetching the result (w/ query), and ensuring
    // that there are no errors:
    movie.title = 'Rambo: Last Blood';
    await click('.refresh-data');

    assert.dom('.movie-title').hasText('Rambo: Last Blood');
    // Because we used watchQuery() there should be an ongoing query in the
    // apollo query manager:
    let queries = getQueries();
    assert.ok(Object.keys(queries).length, 'there is an active watchQuery');

    run(async function () {
      await click('.add-review');
    });

    // Now that we've gone to a route with no queries, the RouteQueryManager
    // should have unsubscribed from the watchQuery and there should be no
    // ongoing queries:
    queries = getQueries();
    assert.notOk(
      Object.keys(queries).length,
      'there are no active watchQueries'
    );
  });

  test('visiting /', async function (assert) {
    let firstQuery = true;
    let resolvers = {
      Query: {
        movies(_, args) {
          if (firstQuery) {
            firstQuery = false;
            assert.deepEqual(args, { topRated: false });
            return [mockMovieNotTop];
          }

          assert.deepEqual(args, { topRated: true });
          return [mockMovieTopRated];
        },
      },
    };
    addResolveFunctionsToSchema({ schema: this.pretender.schema, resolvers });

    let apollo = this.owner.lookup('service:apollo');
    let getQueries = () => apollo.client.queryManager.getQueryStore();

    await visit('/');

    assert.dom('.movie-title').hasText(mockMovieNotTop.title);

    // Because we used watchQuery() there should be an ongoing query in the
    // apollo query manager:
    let queries = getQueries();
    assert.equal(
      Object.keys(queries).length,
      1,
      'there is an active watchQuery'
    );
    assert.deepEqual(queries[Object.keys(queries)[0]].variables, {
      topRated: false,
    });

    await click('.toggle-top-rated');
    assert.equal(currentURL(), '/?topRated=true');
    assert.dom('.movie-title').hasText(mockMovieTopRated.title);

    // Since we changed the query topRated from 'false' to 'true', a new
    // watchQuery should have been fetched referencing 'topRated'. It should
    // still be active, while the 'topRated false' query should not.
    queries = getQueries();
    assert.equal(
      Object.keys(queries).length,
      1,
      'there is an active watchQuery'
    );
    assert.deepEqual(queries[Object.keys(queries)[0]].variables, {
      topRated: true,
    });
  });
});
