import { getOwner } from '@ember/application';
import EmberObject from '@ember/object';
import ObjectQueryManagerMixin from 'ember-apollo-client/mixins/object-query-manager';
import { moduleFor, test } from 'ember-qunit';

moduleFor(
  'mixin:object-query-manager',
  'Unit | Mixin | ember object query manager', {
    needs: ['config:environment', 'service:apollo'],
    subject() {
      let TestObject = EmberObject.extend(ObjectQueryManagerMixin);
      this.register('test-container:test-object', TestObject);
      return getOwner(this).lookup('test-container:test-object');
    },
  }
);

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

  subject.apollo.watchQuery({ query: 'fakeQuery' });
  subject.apollo.watchQuery({ query: 'fakeQuery' });

  subject.willDestroy();
  assert.equal(
    unsubscribeCalled,
    2,
    '_apolloUnsubscribe() was called once per watchQuery'
  );
  done();
});
