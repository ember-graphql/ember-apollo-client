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
    let graphql = webpackDependency('graphql');
    let graphqlTag = webpackDependency('graphql-tag');

    let graphqlTools = webpackDependency('graphql-tools', {
      externals: {
        graphql: 'graphql'
      }
    });

    let apolloClient = webpackDependency('apollo-client', {
      externals: {
        'graphql-tag': 'graphql-tag'
      }
    });

    return new MergeTrees([graphql, graphqlTag, graphqlTools, apolloClient]);
  }
};

function webpackDependency(name, options) {
  return new WebPack([path.dirname(require.resolve(name))], Object.assign({
    entry: './index.js',
    output: {
      library: name,
      libraryTarget: 'amd',
      filename: name + '.amd.js'
    }
  }, options));
}
