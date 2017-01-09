import Ember from 'ember';
import UnsubscribeRouteMixin from 'ember-apollo-client/mixins/unsubscribe-route';
import { module, test } from 'qunit';

const { Route } = Ember;

module('Unit | Mixin | unsubscribe route');

let route;

test('it works', function(assert) {
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
  route = Route.extend(UnsubscribeRouteMixin, {});

  let subject = route.create({ controller });
  subject.setupController(controller, model);
  subject.deactivate();
  assert.ok(unsubscribeCalled, '_apolloUnsubscribe() was called');
});
