import { getOwner } from '@ember/application';
import EmberObject from '@ember/object';
import RouteQueryManagerMixin from 'ember-apollo-client/mixins/route-query-manager';
import { moduleFor, test } from 'ember-qunit';

moduleFor(
  'mixin:route-query-manager',
  'Unit | Mixin | route query manager',
  {
    needs: ['config:environment', 'service:apollo'],
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

  subject.get('apollo').watchQuery({ query: 'fakeQuery' });
  subject.get('apollo').watchQuery({ query: 'fakeQuery' });

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

  subject.get('apollo').watchQuery({ query: 'fakeQuery' });

  // simulate data being re-fetched, as when query params change
  subject.beforeModel();
  subject.get('apollo').watchQuery({ query: 'fakeQuery' });

  subject.resetController({}, false);
  assert.equal(
    unsubscribeCalled,
    1,
    '_apolloUnsubscribe() was called only once, for the first query',
  );
  done();
});


test('it unsubscribes from any watchQuery subscriptions on willDestroy', function(assert) {
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

  subject.get('apollo').watchQuery({ query: 'fakeQuery' });
  subject.get('apollo').watchQuery({ query: 'fakeQuery' });

  subject.beforeModel();
  subject.willDestroy();
  assert.equal(
    unsubscribeCalled,
    2,
    '_apolloUnsubscribe() was called once per watchQuery'
  );
  done();
});
