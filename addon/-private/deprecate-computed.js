import { deprecate } from '@ember/application/deprecations';

function deprecateComputed(property) {
  deprecate(
    `Overwriting ember-apollo-client ${property} using computed property is deprecated. Please update to a regular function.`,
    false,
    { id: 'ember-apollo-client.deprecate-mixins', until: '3.0.0' }
  );
}

export default deprecateComputed;
