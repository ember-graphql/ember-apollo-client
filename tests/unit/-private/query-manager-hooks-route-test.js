import { queryManager } from 'ember-apollo-client';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import ApolloService from 'ember-apollo-client/services/apollo';
import Route from '@ember/routing/route';

let unsubscribeCalled;
let assertDeepEqual;

let TestObject = Route.extend({
  apollo: queryManager({ service: 'overridden-apollo' }),
});

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

module('Unit | queryManager | Setup Hooks in route', function(hooks) {
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

  test('it unsubscribes from any watchQuery subscriptions with isExiting=true', function(assert) {
    let subject = this.subject();

    assert.equal(unsubscribeCalled, 0, 'should have been initialized with 0');
    subject.apollo.watchQuery({ query: 'fakeQuery' });
    subject.apollo.watchQuery({ query: 'fakeQuery' });

    subject.beforeModel();
    subject.resetController({}, true);
    assert.equal(
      unsubscribeCalled,
      2,
      '_apolloUnsubscribe() was called once per watchQuery'
    );
  });

  test('it unsubscribes from any subscriptions', function(assert) {
    let subject = this.subject();

    assert.equal(unsubscribeCalled, 0, 'should have been initialized with 0');
    subject.apollo.subscribe({ query: 'fakeSubscription' });
    subject.apollo.subscribe({ query: 'fakeSubscription' });

    subject.beforeModel();
    subject.resetController({}, true);
    assert.equal(
      unsubscribeCalled,
      2,
      '_apolloUnsubscribe() was called once per subscribe'
    );
  });

  test('it only unsubscribes from stale watchQuery subscriptions with isExiting=false', function(assert) {
    let subject = this.subject();

    assert.equal(unsubscribeCalled, 0, 'should have been initialized with 0');
    subject.apollo.watchQuery({ query: 'fakeQuery' });

    // simulate data being re-fetched, as when query params change
    subject.beforeModel();
    subject.apollo.watchQuery({ query: 'fakeQuery' });

    subject.resetController({}, false);
    assert.equal(
      unsubscribeCalled,
      1,
      '_apolloUnsubscribe() was called only once, for the first query'
    );
    
    subject.beforeModel();
    subject.willDestroy();
    assert.equal(
      unsubscribeCalled,
      2,
      '_apolloUnsubscribe() was called for all quries'
    );
  });

  test('it unsubscribes from any watchQuery subscriptions on willDestroy', function(assert) {
    let subject = this.subject();

    assert.equal(unsubscribeCalled, 0, 'should have been initialized with 0');
    subject.apollo.watchQuery({ query: 'fakeQuery' });
    subject.apollo.watchQuery({ query: 'fakeQuery' });

    subject.beforeModel();
    subject.willDestroy();
    assert.equal(
      unsubscribeCalled,
      2,
      '_apolloUnsubscribe() was called once per watchQuery'
    );
  });
});
