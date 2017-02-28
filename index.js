/* global module, require, __dirname */
'use strict';

const path = require('path');
const WebPack = require('broccoli-webpack');
const DefinePlugin = require('webpack').DefinePlugin;
const EmberApp = require('ember-cli/lib/broccoli/ember-app');
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
      plugins: [
        new DefinePlugin({ 'process.env.NODE_ENV': JSON.stringify(EmberApp.env()) })
      ],
      externals: {
        'graphql-tag': 'graphql-tag'
      },
      resolveLoader: {
        root: path.join(__dirname, "node_modules")
      },
      module: {
        loaders: [
          {
            test: /\.js$/,
            loader: 'babel-loader?presets[]=es2016&presets[]=es2015'
          }, {
            test: /\.js$/,
            loader: 'babel',
            query: {
              presets: ['es2016', 'es2015']
            }
          }
        ]
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
