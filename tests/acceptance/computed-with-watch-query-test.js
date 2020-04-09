import { module, test } from 'qunit';
import { setupApplicationTest } from 'dummy/tests/helpers/setup';
import { addResolveFunctionsToSchema } from 'graphql-tools';
import { click, visit } from '@ember/test-helpers';

module('Acceptance | computed with watch query', function (hooks) {
  setupApplicationTest(hooks);

  const mockMovie = {
    id: 238,
    popularity: 26.83,
    posterPath: '/rPdtLWNsZmAtoZl9PK7S2wE3qiS.jpg',
    title: 'The Godfather',
    overview:
      'Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family. When organized crime family patriarch, Vito Corleone barely survives an attempt on his life, his youngest son, Michael steps in to take care of the would-be killers, launching a campaign of bloody revenge.',
    releaseDate: '1972-03-15',
    __typename: 'Movie',
  };

  let schema;

  hooks.beforeEach(function () {
    schema = this.pretender.schema;
  });

  test('visiting /', async function (assert) {
    let resolvers = {
      Query: {
        movies() {
          return [mockMovie];
        },
      },
    };
    addResolveFunctionsToSchema({ schema, resolvers });

    await visit('/');

    assert.dom('.movie-title').hasText('The Godfather');
    assert.dom('.movie-release-date').hasText('March 15, 1972');

    mockMovie.releaseDate = '2019-09-28';
    await click('.refresh-data');

    assert.dom('.movie-release-date').hasText('September 28, 2019');
  });
});
