import ComponentQueryManager from 'ember-apollo-client/-private/mixins/component-query-manager';
import { deprecate } from '@ember/application/deprecations';

deprecate(
  'ember-apollo-client/mixins/component-query-manager is deprecated, use `import { ComponentQueryManager } from "ember-apollo-client";`',
  false,
  {
    id: 'ember-apollo-client.deprecate-long-form-mixins',
    until: '2.0.0',
  }
);

export default ComponentQueryManager;
