/* global module, require */
'use strict';

const path = require('path');
const WebPack = require('broccoli-webpack');
const MergeTrees = require('broccoli-merge-trees');

module.exports = {
  name: 'ember-apollo-client',

  included() {
    this._super.included.apply(this, arguments);
    this.import('vendor/graphql.amd.js');
    this.import('vendor/graphql-tag.amd.js');
    this.import('vendor/graphql-tools.amd.js');
    this.import('vendor/apollo-client.amd.js');
  },

  treeForVendor() {
    const graphql = new WebPack([path.dirname(require.resolve('graphql'))], {
      entry: './index.js',
      output: {
        library: 'graphql',
        libraryTarget: 'amd',
        filename: 'graphql.amd.js'
      }
    });

    const graphqlTag = new WebPack([path.dirname(require.resolve('graphql-tag'))], {
      entry: './index.js',
      output: {
        library: 'graphql-tag',
        libraryTarget: 'amd',
        filename: 'graphql-tag.amd.js'
      }
    });

    const graphqlTools = new WebPack([path.dirname(require.resolve('graphql-tools'))], {
      entry: './index.js',
      externals: {
        graphql: 'graphql'
      },
      output: {
        library: 'graphql-tools',
        libraryTarget: 'amd',
        filename: 'graphql-tools.amd.js'
      }
    });

    const apolloClient = new WebPack([path.dirname(require.resolve('apollo-client'))], {
      entry: './index.js',
      externals: {
        'graphql-tag': 'graphql-tag'
      },
      output: {
        library: 'apollo-client',
        libraryTarget: 'amd',
        filename: 'apollo-client.amd.js'
      }
    });

    return new MergeTrees([graphql, graphqlTag, graphqlTools, apolloClient]);
  }
};
