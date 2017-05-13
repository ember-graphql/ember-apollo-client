import middlewares from 'ember-apollo-client/utils/middlewares';
import { module, test } from 'qunit';
import Ember from 'ember';

const { Object: EmberObject } = Ember;

module('Unit | Utility | middlewares');

test('it should create a middleware list', function(assert) {
  let Service = EmberObject.extend({
    middlewares: middlewares('middlewareA', 'middlewareB'),

    middlewareA(req, next) { next(); },
    middlewareB(req, next) { next(); }
  });

  Service.create({}).get('middlewares').forEach((middleware) => {
    assert.ok(middleware.applyMiddleware);
  });
});
