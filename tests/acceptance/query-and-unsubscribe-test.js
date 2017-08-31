import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';
import { addResolveFunctionsToSchema } from 'graphql-tools';

let application;

moduleForAcceptance('Acceptance | main', {
  beforeEach() {
    application = this.application;
  },
});

test('visiting /luke', function(assert) {
  let done = assert.async();

  let mockHuman = {
    id: '1000',
    name: 'Luke Skywalker',
  };
  addResolveFunctionsToSchema(this.pretender.schema, {
    Query: {
      human(obj, args) {
        assert.deepEqual(args, { id: '1000' });
        return mockHuman;
      },
    },
  });

  let apollo = application.__container__.lookup('service:apollo');
  let getQueries = () => apollo.client.queryManager.queryStore.getStore();

  visit('/luke');

  andThen(function() {
    assert.equal(currentURL(), '/luke');
    assert.equal(find('.model-name').text(), 'Luke Skywalker');

    // try updating the mock, refetching the result (w/ queryOnce), and ensuring
    // that there are no errors:
    mockHuman.name = 'Luke Skywalker II';
    click('.refetch-button');

    andThen(() => {
      // Because we used query() (which uses apollo client's watchQuery) there
      // should be an ongoing query in the apollo query manager:
      let queries = getQueries();
      assert.ok(Object.keys(queries).length, 'there is an active watchQuery');

      visit('/');

      andThen(function() {
        // Now that we've gone to a route with no queries, the
        // UnsubscribeRouteMixin should have unsubscribed from the watcyQuery andThen
        // there should be no ongoing queries:
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
