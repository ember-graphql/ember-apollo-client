import RouteQueryManager from 'ember-apollo-client/-private/mixins/route-query-manager';
import { deprecate } from '@ember/application/deprecations';

deprecate(
  'ember-apollo-client/mixins/route-query-manager is deprecated, use `import { RouteQueryManager } from "ember-apollo-client";`',
  false,
  {
    id: 'ember-apollo-client.deprecate-long-form-mixins',
    until: '2.0.0',
  }
);

export default RouteQueryManager;
