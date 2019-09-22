import { inject as service } from '@ember/service';
import Mixin from '@ember/object/mixin';
import { computed } from '@ember/object';
import { deprecate } from '@ember/application/deprecations';

export default Mixin.create({
  apolloService: service('apollo'),
  apollo: computed('apolloService', function() {
    return this.apolloService.createQueryManager();
  }),
  init() {
    this._super(...arguments);

    deprecate(
      `
Mixins in ember-apollo-client are deprecated, use queryManager macro instead.

import { queryManager } from 'ember-apollo-client';

export default Route.extend({
  apollo: queryManager(),

  // ...
});`,
      false,
      {
        id: 'ember-apollo-client.deprecate-mixins',
        until: '3.0.0',
      }
    );
  },
});
