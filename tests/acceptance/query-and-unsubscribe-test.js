import { module, test } from 'qunit';
import { setupApplicationTest } from 'dummy/tests/helpers/setup';
import { addResolveFunctionsToSchema } from 'graphql-tools';
import { click, currentURL, find, settled, visit } from '@ember/test-helpers';

module('Acceptance | main', function(hooks) {
  setupApplicationTest(hooks);

  const mockMovieNotTop = {
    id: 680,
    title: 'Pulp Fiction',
    voteAverage: 8.4,
    posterUrl:
      'https://image.tmdb.org/t/p/w185_and_h278_bestv2/dM2w364MScsjFf8pfMbaWUcWrR.jpg',
    overview: 'lorem',
    releaseDate: '1994-10-14',
  };

  const mockMovieTopRated = {
    id: 238,
    title: 'The Godfather',
    voteAverage: 8.6,
    posterUrl:
      'https://image.tmdb.org/t/p/w185_and_h278_bestv2/rPdtLWNsZmAtoZl9PK7S2wE3qiS.jpg',
    overview: 'lorem',
    releaseDate: '1972-03-15',
  };

  const mockHuman = {
    id: '1000',
    name: 'Luke Skywalker',
    __typename: 'Human',
  };

  let schema;

  hooks.beforeEach(function() {
    schema = this.pretender.schema;
  });

  test('visiting /luke', async function(assert) {
    let human = Object.assign({}, mockHuman);
    let resolvers = {
      Query: {
        human(obj, args) {
          assert.deepEqual(args, { id: '1000' });
          return Object.assign({}, human);
        },
      },
    };
    addResolveFunctionsToSchema({ schema, resolvers });

    let apollo = this.owner.lookup('service:apollo');
    let getQueries = () => apollo.client.queryManager.queryStore.getStore();

    await visit('/luke');

    assert.equal(currentURL(), '/luke');
    assert.equal(find('.model-name').innerText, 'Luke Skywalker');

    // try updating the mock, refetching the result (w/ query), and ensuring
    // that there are no errors:
    human.name = 'Lucas Skywalker';
    await click('.refetch-button');
    await settled();

    assert.equal(find('.model-name').innerText, 'Lucas Skywalker');
    // Because we used watchQuery() there should be an ongoing query in the
    // apollo query manager:
    let queries = getQueries();
    assert.ok(Object.keys(queries).length, 'there is an active watchQuery');

    await visit('/new-review');

    // Now that we've gone to a route with no queries, the RouteQueryManager
    // should have unsubscribed from the watchQuery and there should be no
    // ongoing queries:
    queries = getQueries();
    assert.notOk(
      Object.keys(queries).length,
      'there are no active watchQueries'
    );
  });

  test('visiting /', async function(assert) {
    let firstQuery = true;
    let resolvers = {
      Query: {
        movies(obj, args) {
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
    addResolveFunctionsToSchema({ schema, resolvers });

    let apollo = this.owner.lookup('service:apollo');
    let getQueries = () => apollo.client.queryManager.queryStore.getStore();

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
