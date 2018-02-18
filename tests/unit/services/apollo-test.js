import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { computed } from '@ember/object';
import ApolloService from 'ember-apollo-client/services/apollo';

module('Unit | Service | apollo', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let options = {
      apiURL: 'https://test.example/graphql',
    };
    let service = this.owner.factoryFor('service:apollo').create({ options });
    assert.ok(service);
  });

  test('it uses clientOptions', function(assert) {
    let customDataIdFromObject = o => o.name;
    this.owner.register('service:overridden-apollo', ApolloService.extend({
      // Override the clientOptions.
      clientOptions: computed(function() {
        let opts = this._super(...arguments);
        opts.dataIdFromObject = customDataIdFromObject;
        return opts;
      }),
    }));
    let service = this.owner.lookup('service:overridden-apollo')

    // make sure the override was used.
    assert.equal(service.get('apollo.dataIdFromObject', customDataIdFromObject));
  });
});