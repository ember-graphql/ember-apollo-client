import { module } from 'qunit';
import Ember from 'ember';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import startPretender from '../helpers/start-pretender';
import fetch from 'ember-network/fetch';

const { RSVP: { Promise } } = Ember;

export default function(name, options = {}) {
  module(name, {
    beforeEach() {
      this.application = startApp();
      this.pretender = startPretender();

      // overriding fetch is required in order to make apollo-client work w/ pretender:
      // https://github.com/pretenderjs/pretender/issues/60
      // https://github.com/apollostack/apollo-client/issues/269
      this.ogFetch = window.fetch;
      window.fetch = fetch;

      if (options.beforeEach) {
        return options.beforeEach.apply(this, arguments);
      }
    },

    afterEach() {
      window.fetch = this.ogFetch;
      let afterEach = options.afterEach && options.afterEach.apply(this, arguments);
      if (this.pretender) {
        this.pretender.shutdown();
      }
      return Promise.resolve(afterEach).then(() => destroyApp(this.application));
    }
  });
}
