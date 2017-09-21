import Ember from 'ember';
import ComponentQueryManagerMixin from 'ember-apollo-client/mixins/component-query-manager';
import { moduleFor, test } from 'ember-qunit';

const { getOwner, Object: EmberObject } = Ember;

moduleFor(
  'mixin:component-query-manager',
  'Unit | Mixin | component query manager', {
    needs: ['service:apollo'],
    beforeEach() {
      // needed to set up config since initializers don't run here
      const options = { apiURL: 'https://test.example/graphql' };
      this.register('config:apollo', options, { instantiate: false });
      getOwner(this).inject('service:apollo', 'options', 'config:apollo');
    },
    subject() {
      let TestObject = EmberObject.extend(ComponentQueryManagerMixin);
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

  subject.willDestroyElement();
  assert.equal(
    unsubscribeCalled,
    2,
    '_apolloUnsubscribe() was called once per watchQuery'
  );
  done();
});
