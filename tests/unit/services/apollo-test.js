import { moduleFor, test } from 'ember-qunit';
import { computed } from '@ember/object';
import ApolloService from 'ember-apollo-client/services/apollo';

moduleFor('service:apollo', 'Unit | Service | apollo', {
  needs: ['config:environment'],
});

test('it exists', function(assert) {
  let options = {
    apiURL: 'https://test.example/graphql',
  };
  let service = this.subject({ options });
  assert.ok(service);
});

test('it uses clientOptions', function(assert) {
  let customDataIdFromObject = o => o.name;
  this.register('service:overridden-apollo', ApolloService.extend({
    // Override the clientOptions.
    clientOptions: computed(function() {
      let opts = this._super(...arguments);
      opts.dataIdFromObject = customDataIdFromObject;
      return opts;
    }),
  }));
  let service = this.container.lookup('service:overridden-apollo')

  // make sure the override was used.
  assert.equal(service.get('apollo.dataIdFromObject', customDataIdFromObject));
});
