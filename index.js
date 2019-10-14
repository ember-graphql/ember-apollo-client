'use strict';

module.exports = {
  name: require('./package').name,

  options: {
    autoImport: {
      webpack: {
        module: {
          rules: [
            /* fixes issue with graphql-js's mjs entry */
            /* see: https://github.com/graphql/graphql-js/issues/1272#issuecomment-393903706 */
            {
              test: /\.mjs$/,
              include: /node_modules\/graphql/,
              type: 'javascript/auto',
            },
          ],
        },
      },
    },
  },

  included(app) {
    this._super.included.apply(this, arguments);

    this.app = app;
  },

  getOptions() {
    if (
      this.app &&
      (typeof this.app.options.emberApolloClient === 'undefined' ||
        typeof this.app.options.emberApolloClient.keepGraphqlFileExtension ===
          'undefined')
    ) {
      this.ui.writeDeprecateLine(`[ember-apollo-client] Deprecation:
        The configuration option keepGraphqlFileExtension was not defined.
        The current default is 'false', but it will change to 'true' after the next major release.
        This option allows you to import graphql files using its extension. eg. 'import myQuery from 'my-app/queries/my-query.graphql';'
        To continue with the current behavior, explicit set it to 'false' in your 'ember-cli-build.js'.
        Please refer to 'Build time configuration' section in ember-apollo-client's README for more information.`);
    }

    return (
      (this.app && this.app.options.emberApolloClient) || {
        keepGraphqlFileExtension: false,
      }
    );
  },

  setupPreprocessorRegistry(type, registry) {
    let getOptions = this.getOptions.bind(this);
    let options = getOptions();

    if (type === 'parent') {
      registry.add('js', {
        name: require('./package').name,
        ext: 'graphql',
        toTree(tree) {
          const GraphQLFilter = require('broccoli-graphql-filter');

          return new GraphQLFilter(tree, {
            keepExtension: options.keepGraphqlFileExtension,
          });
        },
      });
    }
  },
};
