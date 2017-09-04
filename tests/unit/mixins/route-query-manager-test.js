import Ember from 'ember';
import RouteQueryManagerMixin from 'ember-apollo-client/mixins/route-query-manager';
import { moduleFor, test } from 'ember-qunit';

const { getOwner, Object: EmberObject } = Ember;

moduleFor(
  'mixin:route-query-manager',
  'Unit | Mixin | route query manager',
  {
    needs: ['service:apollo'],
    beforeEach() {
      // needed to set up config since initializers don't run here
      const options = { apiURL: 'https://test.example/graphql' };
      this.register('config:apollo', options, { instantiate: false });
      getOwner(this).inject('service:apollo', 'options', 'config:apollo');
    },
    subject() {
      let TestObject = EmberObject.extend(RouteQueryManagerMixin);
      this.register('test-container:test-object', TestObject);
      return getOwner(this).lookup('test-container:test-object');
    },
  }
);

test('it unsubscribes from any watchQuery subscriptions with isExiting=true', function(assert) {
  let done = assert.async();
  let subject = this.subject();
  let unsubscribeCalled = 0;

  let apolloService = subject.get('apollo.apollo');
  apolloService.set('managedWatchQuery', (manager, opts) => {
    assert.deepEqual(opts, { query: 'fakeQuery' });
    manager.trackSubscription({
      unsubscribe() {
        unsubscribeCalled++;
      },
    });
    return {};
  });

  subject.apollo.watchQuery({ query: 'fakeQuery' });
  subject.apollo.watchQuery({ query: 'fakeQuery' });

  subject.beforeModel();
  subject.resetController({}, true);
  assert.equal(
    unsubscribeCalled,
    2,
    '_apolloUnsubscribe() was called once per watchQuery'
  );
  done();
});

test('it only unsubscribes from stale watchQuery subscriptions with isExiting=false', function(assert) {
  let done = assert.async();
  let subject = this.subject();
  let unsubscribeCalled = 0;

  let apolloService = subject.get('apollo.apollo');
  apolloService.set('managedWatchQuery', (manager, opts) => {
    assert.deepEqual(opts, { query: 'fakeQuery' });
    manager.trackSubscription({
      unsubscribe() {
        unsubscribeCalled++;
      },
    });
    return {};
  });

  subject.apollo.watchQuery({ query: 'fakeQuery' });

  // simulate data being re-fetched, as when query params change
  subject.beforeModel();
  subject.apollo.watchQuery({ query: 'fakeQuery' });

  subject.resetController({}, false);
  assert.equal(
    unsubscribeCalled,
    1,
    '_apolloUnsubscribe() was called only once, for the first query',
  );
  done();
});
