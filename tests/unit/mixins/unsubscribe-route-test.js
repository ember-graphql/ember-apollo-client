import Ember from 'ember';
import UnsubscribeRoute from 'ember-apollo-client/mixins/unsubscribe-route';
import { module, test } from 'qunit';

const { Route } = Ember;

module('Unit | Mixin | unsubscribe route');

let route;

test('it calls _apolloUnsubscribe on deactivate', function(assert) {
  assert.expect(1);
  let unsubscribeCalled = false;
  let model = Ember.Object.create({
    id: 'fakeID',
    name: 'foo',
    _apolloUnsubscribe: () => {
      unsubscribeCalled = true;
    }
  });
  let controller = Ember.Object.create({});
  route = Route.extend(UnsubscribeRoute, {});

  let subject = route.create({ controller });
  subject.setupController(controller, model);
  subject.resetController();
  assert.ok(unsubscribeCalled, '_apolloUnsubscribe() was called');
});
