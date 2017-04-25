import { moduleFor, test } from 'ember-qunit';
import Ember from 'ember';
import ApolloService from 'ember-apollo-client/services/apollo';

const { computed } = Ember;

let options;

moduleFor('service:apollo', 'Unit | Service | apollo', {
  beforeEach() {
    options = {
      apiURL: 'https://test.example/graphql',
    };
  },
});

test('it exists', function(assert) {
  let service = this.subject({ options });
  assert.ok(service);
});

test('it uses clientOptions', function(assert) {
  let customDataIdFromObject = o => o.name;
  let OverriddenService = ApolloService.extend({
    // Need this here because apollo requires a uri, but our initializer doesn't
    // run in unit tests.
    options: {
      apiURL: 'https://this-should-be-set-from-environment.example',
    },

    // Override the clientOptions.
    clientOptions: computed(function() {
      let opts = this._super(...arguments);
      opts.dataIdFromObject = customDataIdFromObject;
      return opts;
    }),
  });
  let service = OverriddenService.create({});

  // make sure the override was used.
  assert.equal(service.get('apollo.dataIdFromObject', customDataIdFromObject));
});
