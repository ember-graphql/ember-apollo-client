import ObjectQueryManager from 'ember-apollo-client/-private/mixins/object-query-manager';
import { deprecate } from '@ember/application/deprecations';

deprecate(
  'ember-apollo-client/mixins/object-query-manager is deprecated, use `import { ObjectQueryManager } from "ember-apollo-client";`',
  false,
  {
    id: 'ember-apollo-client.deprecate-long-form-mixins',
    until: '2.0.0',
  }
);

export default ObjectQueryManager;
