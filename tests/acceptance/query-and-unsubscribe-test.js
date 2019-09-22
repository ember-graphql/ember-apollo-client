import { module, test } from 'qunit';
import { setupApplicationTest } from 'dummy/tests/helpers/setup';
import { addResolveFunctionsToSchema } from 'graphql-tools';
import { click, currentURL, find, settled, visit } from '@ember/test-helpers';

module('Acceptance | main', function(hooks) {
  setupApplicationTest(hooks);

  const mockHuman = {
    id: '1000',
    name: 'Luke Skywalker',
    __typename: 'Human',
  };

  const mockDroid = {
    id: '1001',
    name: 'BB8',
    __typename: 'Droid',
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

  test('visiting /characters', async function(assert) {
    let firstQuery = true;
    let resolvers = {
      Query: {
        characters(obj, args) {
          if (firstQuery) {
            firstQuery = false;
            assert.deepEqual(args, { kind: 'human' });
            return [mockHuman];
          }

          assert.deepEqual(args, { kind: 'droid' });
          return [mockDroid];
        },
      },
    };
    addResolveFunctionsToSchema({ schema, resolvers });

    let apollo = this.owner.lookup('service:apollo');
    let getQueries = () => apollo.client.queryManager.queryStore.getStore();

    await visit('/characters?kind=human');

    assert.equal(currentURL(), '/characters?kind=human');
    assert.equal(find('.model-name').innerText, 'Luke Skywalker');
    assert.equal(find('.model-typename').innerText, 'Human');

    // Because we used watchQuery() there should be an ongoing query in the
    // apollo query manager:
    let queries = getQueries();
    assert.equal(
      Object.keys(queries).length,
      1,
      'there is an active watchQuery'
    );

    // Change the query param to re-fetch model, which will trigger
    // resetController() when it's done:
    await visit('/characters?kind=droid');

    assert.equal(currentURL(), '/characters?kind=droid');
    assert.equal(find('.model-name').innerText, 'BB8');
    // Since we changed the query kind from 'human' to 'droid', a new
    // watchQuery should have been fetched referencing 'droid'. It should
    // still be active, while the 'human' query should not.
    queries = getQueries();
    assert.equal(
      Object.keys(queries).length,
      1,
      'there is an active watchQuery'
    );
  });
});
