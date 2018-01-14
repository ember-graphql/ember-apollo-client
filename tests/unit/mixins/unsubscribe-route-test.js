import Route from '@ember/routing/route';
import EmberObject from '@ember/object';
import UnsubscribeRoute from 'ember-apollo-client/mixins/unsubscribe-route';
import { module, test } from 'qunit';

module('Unit | Mixin | unsubscribe route');

let route;

test('it calls _apolloUnsubscribe on deactivate', function(assert) {
  assert.expect(1);
  let unsubscribeCalled = false;
  let model = EmberObject.create({
    id: 'fakeID',
    name: 'foo',
    _apolloUnsubscribe: () => {
      unsubscribeCalled = true;
    }
  });
  let controller = EmberObject.create({});
  route = Route.extend(UnsubscribeRoute, {});

  let subject = route.create({ controller });
  subject.setupController(controller, model);
  subject.resetController();
  assert.ok(unsubscribeCalled, '_apolloUnsubscribe() was called');
});
