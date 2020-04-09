import EmberObject from '@ember/object';
import { RouteQueryManager } from 'ember-apollo-client';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Mixin | route query manager', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.subject = function () {
      let TestObject = EmberObject.extend(RouteQueryManager);
      this.owner.register('test-container:test-object', TestObject);
      return this.owner.lookup('test-container:test-object');
    };
  });

  test('it unsubscribes from any watchQuery subscriptions with isExiting=true', async function (assert) {
    let subject = this.subject();
    let unsubscribeCalled = 0;

    let apolloService = subject.apollo.apollo;
    apolloService.set('managedWatchQuery', (manager, opts) => {
      assert.deepEqual(opts, { query: 'fakeQuery' });
      manager.trackSubscription({
        unsubscribe() {
          unsubscribeCalled++;
        },
      });
      return {};
    });

    await subject.apollo.watchQuery({ query: 'fakeQuery' });
    await subject.apollo.watchQuery({ query: 'fakeQuery' });

    subject.beforeModel();
    subject.resetController({}, true);
    assert.equal(
      unsubscribeCalled,
      2,
      '_apolloUnsubscribe() was called once per watchQuery'
    );
  });

  test('it unsubscribes from any subscriptions', async function (assert) {
    let subject = this.subject();
    let unsubscribeCalled = 0;

    let apolloService = subject.apollo.apollo;
    apolloService.set('managedSubscribe', (manager, opts) => {
      assert.deepEqual(opts, { query: 'fakeSubscription' });
      manager.trackSubscription({
        unsubscribe() {
          unsubscribeCalled++;
        },
      });
      return {};
    });

    await subject.apollo.subscribe({ query: 'fakeSubscription' });
    await subject.apollo.subscribe({ query: 'fakeSubscription' });

    subject.beforeModel();
    subject.resetController({}, true);
    assert.equal(
      unsubscribeCalled,
      2,
      '_apolloUnsubscribe() was called once per subscribe'
    );
  });

  test('it only unsubscribes from stale watchQuery subscriptions with isExiting=false', async function (assert) {
    let subject = this.subject();
    let unsubscribeCalled = 0;

    let apolloService = subject.apollo.apollo;
    apolloService.set('managedWatchQuery', (manager, opts) => {
      assert.deepEqual(opts, { query: 'fakeQuery' });
      manager.trackSubscription({
        unsubscribe() {
          unsubscribeCalled++;
        },
      });
      return {};
    });

    await subject.apollo.watchQuery({ query: 'fakeQuery' });

    // simulate data being re-fetched, as when query params change
    subject.beforeModel();
    subject.apollo.watchQuery({ query: 'fakeQuery' });

    subject.resetController({}, false);
    assert.equal(
      unsubscribeCalled,
      1,
      '_apolloUnsubscribe() was called only once, for the first query'
    );
  });

  test('it unsubscribes from any watchQuery subscriptions on willDestroy', async function (assert) {
    let subject = this.subject();
    let unsubscribeCalled = 0;

    let apolloService = subject.apollo.apollo;
    apolloService.set('managedWatchQuery', (manager, opts) => {
      assert.deepEqual(opts, { query: 'fakeQuery' });
      manager.trackSubscription({
        unsubscribe() {
          unsubscribeCalled++;
        },
      });
      return {};
    });

    await subject.apollo.watchQuery({ query: 'fakeQuery' });
    await subject.apollo.watchQuery({ query: 'fakeQuery' });

    subject.beforeModel();
    subject.willDestroy();
    assert.equal(
      unsubscribeCalled,
      2,
      '_apolloUnsubscribe() was called once per watchQuery'
    );
  });
});
