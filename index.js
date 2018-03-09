'use strict'

const defaultOptions = [
  'apollo-cache',
  'apollo-cache-inmemory',
  'apollo-client',
  'apollo-link',
  'apollo-link-context',
  'apollo-link-http',
  'graphql',
  'graphql-tools',
  'graphql-tag',
]

module.exports = {
  name: 'ember-apollo-client',

  included(app) {
    this._super.included.apply(this, arguments)

    let config = app.project.config(app.env) || {}
    this.addonConfig = config[this.name] || {}

    this.import('vendor/-apollo-client-bundle.js')
    this.import('vendor/-apollo-client-shims.js')
  },

  treeForVendor() {
    const WebpackDependencyPlugin = require('./lib/webpack-dependency-plugin')
    const userOptions = this.addonConfig.include

    return new WebpackDependencyPlugin({
      outputName: 'apollo-client',
      expose: [...defaultOptions, ...userOptions],
    })
  },

  setupPreprocessorRegistry(type, registry) {
    if (type === 'parent') {
      registry.add('js', {
        name: 'ember-apollo-client',
        ext: 'graphql',
        toTree(tree) {
          const GraphQLFilter = require('./lib/graphql-filter')
          return new GraphQLFilter(tree)
        },
      })
    }
  },
}
