import EmberComponent from '@ember/component';
import { queryManager } from 'ember-apollo-client';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import ApolloService from 'ember-apollo-client/services/apollo';

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

module('Unit | queryManager | Setup Hooks in Ember Components', function(
  hooks
) {
  setupTest(hooks);

  hooks.beforeEach(function(assert) {
    assertDeepEqual = assert.deepEqual.bind(assert);
    unsubscribeCalled = 0;

    this.subject = function() {
      this.owner.register('service:overridden-apollo', OverriddenApollo);
      this.owner.register('component:test-component', TestObject);
      return this.owner.lookup('component:test-component');
    };
  });

  test('it unsubscribes from any watchQuery subscriptions', function(assert) {
    assert.expect(5);

    TestObject = EmberComponent.extend({
      apollo: queryManager({ service: 'overridden-apollo' }),
      willDestroyElement() {
        assert.ok(true, 'Should have called the original willDestroyElement');
      },
    });

    let subject = this.subject();
    assert.equal(unsubscribeCalled, 0, 'should have been initialized with 0');

    subject.apollo.watchQuery({ query: 'fakeQuery' });
    subject.apollo.watchQuery({ query: 'fakeQuery' });

    subject.willDestroyElement();

    assert.equal(
      unsubscribeCalled,
      2,
      '_apolloUnsubscribe() was called once per watchQuery'
    );
  });

  test('it unsubscribes from any subscriptions', async function(assert) {
    TestObject = EmberComponent.extend({
      apollo: queryManager({ service: 'overridden-apollo' }),
    });

    let subject = this.subject();
    assert.equal(unsubscribeCalled, 0, 'should have been initialized with 0');

    subject.apollo.subscribe({ query: 'fakeSubscription' });
    subject.apollo.subscribe({ query: 'fakeSubscription' });

    subject.willDestroyElement();

    assert.equal(
      unsubscribeCalled,
      2,
      '_apolloUnsubscribe() was called once per subscribe'
    );
  });

  test('it works using decorator syntax', function(assert) {
    assert.expect(5);
    TestObject = class MyTestClassOjbect extends EmberComponent {
      @queryManager({ service: 'overridden-apollo' }) apollo;

      willDestroyElement() {
        assert.ok(true, 'Should have called the original willDestroyElement');
      }
    };

    let subject = this.subject();
    assert.equal(unsubscribeCalled, 0, 'should have been initialized with 0');

    subject.apollo.watchQuery({ query: 'fakeQuery' });
    subject.apollo.watchQuery({ query: 'fakeQuery' });

    subject.willDestroyElement();

    assert.equal(
      unsubscribeCalled,
      2,
      '_apolloUnsubscribe() was called once per watchQuery'
    );
  });
});
