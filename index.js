'use strict';

module.exports = {
  name: 'ember-apollo-client',

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

  setupPreprocessorRegistry(type, registry) {
    if (type === 'parent') {
      registry.add('js', {
        name: 'ember-apollo-client',
        ext: 'graphql',
        toTree(tree) {
          const GraphQLFilter = require('broccoli-graphql-filter');

          return new GraphQLFilter(tree);
        },
      });
    }
  },
};
