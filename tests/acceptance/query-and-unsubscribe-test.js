import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';
import { addResolveFunctionsToSchema } from 'graphql-tools';
import { copy } from '@ember/object/internals';

let application;

moduleForAcceptance('Acceptance | main', {
  beforeEach() {
    application = this.application;
  },
});

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

test('visiting /luke', function(assert) {
  let done = assert.async();
  let human = copy(mockHuman);

  addResolveFunctionsToSchema(this.pretender.schema, {
    Query: {
      human(obj, args) {
        assert.deepEqual(args, { id: '1000' });
        return copy(human);
      },
    },
  });

  let apollo = application.__container__.lookup('service:apollo');
  let getQueries = () => apollo.client.queryManager.queryStore.getStore();

  visit('/luke');

  andThen(function() {
    assert.equal(currentURL(), '/luke');
    assert.equal(find('.model-name').text(), 'Luke Skywalker');

    // try updating the mock, refetching the result (w/ query), and ensuring
    // that there are no errors:
    human.name = 'Lucas Skywalker';
    click('.refetch-button');

    andThen(() => {
      assert.equal(find('.model-name').text(), 'Lucas Skywalker');
      // Because we used watchQuery() there should be an ongoing query in the
      // apollo query manager:
      let queries = getQueries();
      assert.ok(Object.keys(queries).length, 'there is an active watchQuery');

      visit('/new-review');

      andThen(function() {
        // Now that we've gone to a route with no queries, the RouteQueryManager
        // should have unsubscribed from the watchQuery and there should be no
        // ongoing queries:
        let queries = getQueries();
        assert.notOk(
          Object.keys(queries).length,
          'there are no active watchQueries'
        );
        done();
      });
    });
  });
});

test('visiting /characters', function(assert) {
  let done = assert.async();

  let firstQuery = true;

  addResolveFunctionsToSchema(this.pretender.schema, {
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
  });

  let apollo = application.__container__.lookup('service:apollo');
  let getQueries = () => apollo.client.queryManager.queryStore.getStore();

  visit('/characters?kind=human');

  andThen(function() {
    assert.equal(currentURL(), '/characters?kind=human');
    assert.equal(find('.model-name').text(), 'Luke Skywalker');
    assert.equal(find('.model-typename').text(), 'Human');

    andThen(() => {
      // Because we used watchQuery() there should be an ongoing query in the
      // apollo query manager:
      let queries = getQueries();
      assert.equal(Object.keys(queries).length, 1, 'there is an active watchQuery');

      // Change the query param to re-fetch model, which will trigger
      // resetController() when it's done:
      visit('/characters?kind=droid');

      andThen(function() {
        assert.equal(currentURL(), '/characters?kind=droid');
        assert.equal(find('.model-name').text(), 'BB8');
        // Since we changed the query kind from 'human' to 'droid', a new
        // watchQuery should have been fetched referencing 'droid'. It should
        // still be active, while the 'human' query should not.
        let queries = getQueries();
        assert.equal(Object.keys(queries).length, 1, 'there is an active watchQuery');
        done();
      });
    });
  });
});
