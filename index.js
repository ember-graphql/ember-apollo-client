/* eslint-env node */
'use strict';

module.exports = {
  name: 'ember-apollo-client',

  included() {
    this._super.included.apply(this, arguments);

    this.import('vendor/-apollo-client-bundle.js');
    this.import('vendor/-apollo-client-shims.js');
  },

  treeForVendor() {
    const WebpackDependencyPlugin = require('./lib/webpack-dependency-plugin');

    return new WebpackDependencyPlugin({
      outputName: 'apollo-client',
      expose: [
        'graphql',
        'graphql-tools',
        'graphql-tag',
        'apollo-client'
      ]
    });
  }
};
