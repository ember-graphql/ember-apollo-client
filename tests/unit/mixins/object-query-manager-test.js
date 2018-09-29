import EmberObject from '@ember/object';
import { ObjectQueryManager } from 'ember-apollo-client';
import { ApolloClient } from 'apollo-client';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Mixin | ember object query manager', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    this.subject = function() {
      let TestObject = EmberObject.extend(ObjectQueryManager);
      this.owner.register('test-container:test-object', TestObject);
      return this.owner.lookup('test-container:test-object');
    };
  });

  test('it unsubscribes from any watchQuery subscriptions', function(assert) {
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

    subject.willDestroy();
    assert.equal(
      unsubscribeCalled,
      2,
      '_apolloUnsubscribe() was called once per watchQuery'
    );
    done();
  });

  test('it unsubscribes from any subscribe subscriptions', function(assert) {
    let done = assert.async();
    let subject = this.subject();
    let unsubscribeCalled = 0;

    let apolloService = subject.get('apollo.apollo');
    apolloService.set('managedSubscribe', (manager, opts) => {
      assert.deepEqual(opts, { subscription: 'fakeSubscription' });
      manager.trackSubscription({
        unsubscribe() {
          unsubscribeCalled++;
        },
      });
      return {};
    });

    subject.get('apollo').subscribe({ subscription: 'fakeSubscription' });
    subject.get('apollo').subscribe({ subscription: 'fakeSubscription' });

    subject.willDestroy();
    assert.equal(
      unsubscribeCalled,
      2,
      '_apolloUnsubscribe() was called once per subscribe'
    );
    done();
  });

  test('it exposes an apollo client object', function(assert) {
    let subject = this.subject();
    let client = subject.get('apollo.apolloClient');
    assert.ok(client instanceof ApolloClient);
  });
});
