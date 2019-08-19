import EmberObject from '@ember/object';
import { queryManager } from 'ember-apollo-client';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import ApolloService from 'ember-apollo-client/services/apollo';
import { gte } from 'ember-compatibility-helpers';

let TestObject;
let unsubscribeCalled;
let assertDeepEqual;

let OverriddenApollo = class extends ApolloService {
  managedWatchQuery(manager, opts) {
    assertDeepEqual(opts, { query: 'fakeQuery' });

    manager.trackSubscription({
      unsubscribe() {
        unsubscribeCalled++;
      },
    });
  }

  managedSubscribe(manager, opts) {
    assertDeepEqual(opts, { query: 'fakeSubscription' });

    manager.trackSubscription({
      unsubscribe() {
        unsubscribeCalled++;
      },
    });
  }
};

module('Unit | queryManager | Setup Hooks in EmberOject', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function(assert) {
    assertDeepEqual = assert.deepEqual.bind(assert);
    unsubscribeCalled = 0;

    this.subject = function() {
      this.owner.register('service:overridden-apollo', OverriddenApollo);
      this.owner.register('test-container:test-object', TestObject);
      return this.owner.lookup('test-container:test-object');
    };
  });

  test('it unsubscribes from any watchQuery subscriptions', function(assert) {
    assert.expect(6);

    TestObject = EmberObject.extend({
      apollo: queryManager({ service: 'overridden-apollo' }),
      willDestroy() {
        assert.ok(true, 'Should have called the original willDestroy');
      },
    });

    let subject = this.subject();
    assert.equal(unsubscribeCalled, 0, 'should have been initialized with 0');

    subject.apollo.watchQuery({ query: 'fakeQuery' });
    subject.apollo.watchQuery({ query: 'fakeQuery' });

    subject.willDestroy();

    assert.equal(
      unsubscribeCalled,
      2,
      '_apolloUnsubscribe() was called once per watchQuery'
    );
  });

  test('it unsubscribes from any subscriptions', async function(assert) {
    TestObject = EmberObject.extend({
      apollo: queryManager({ service: 'overridden-apollo' }),
    });

    let subject = this.subject();
    assert.equal(unsubscribeCalled, 0, 'should have been initialized with 0');

    subject.apollo.subscribe({ query: 'fakeSubscription' });
    subject.apollo.subscribe({ query: 'fakeSubscription' });

    subject.willDestroy();

    assert.equal(
      unsubscribeCalled,
      2,
      '_apolloUnsubscribe() was called once per subscribe'
    );
  });

  if (gte('3.10.0')) {
    test('it works using decorator syntax', function(assert) {
      assert.expect(6);
      TestObject = class MyTestClassOjbect extends EmberObject {
        @queryManager({ service: 'overridden-apollo' }) apollo;

        willDestroy() {
          assert.ok(true, 'Should have called the original willDestroy');
        }
      };

      let subject = this.subject();
      assert.equal(unsubscribeCalled, 0, 'should have been initialized with 0');

      subject.apollo.watchQuery({ query: 'fakeQuery' });
      subject.apollo.watchQuery({ query: 'fakeQuery' });

      subject.willDestroy();

      assert.equal(
        unsubscribeCalled,
        2,
        '_apolloUnsubscribe() was called once per watchQuery'
      );
    });
  }
});
