import { setupApplicationTest as defaultSetup } from 'ember-qunit';
import startPretender from '../helpers/start-pretender';

function setupPretender(hooks) {
  hooks.beforeEach(function () {
    this.pretender = startPretender();
  });

  hooks.afterEach(function () {
    this.pretender.shutdown();
  });
}

export function setupApplicationTest(hooks) {
  defaultSetup(hooks);
  setupPretender(hooks);
}
