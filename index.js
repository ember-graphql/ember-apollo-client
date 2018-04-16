"use strict";

const apolloClientDefaultPackages = [
  "apollo-cache",
  "apollo-cache-inmemory",
  "apollo-client",
  "apollo-link",
  "apollo-link-context",
  "apollo-link-http",
  "graphql",
  "graphql-tools",
  "graphql-tag"
];

module.exports = {
  name: "ember-apollo-client",

  included() {
    this._super.included.apply(this, arguments);
    this.addonConfig = this.app.options["apollo"] || {};

    this.import("vendor/-apollo-client-bundle.js");
    this.import("vendor/-apollo-client-shims.js");
  },

  treeForVendor() {
    const WebpackDependencyPlugin = require("./lib/webpack-dependency-plugin");
    const {
      include: userPackages = [],
      exclude: excludedPackages = []
    } = this.addonConfig;

    const includedPackages = apolloClientDefaultPackages.filter(
      p => !excludedPackages.includes(p)
    );

    return new WebpackDependencyPlugin({
      outputName: "apollo-client",
      expose: [...includedPackages, ...userPackages]
    });
  },

  setupPreprocessorRegistry(type, registry) {
    if (type === "parent") {
      registry.add("js", {
        name: "ember-apollo-client",
        ext: "graphql",
        toTree(tree) {
          const GraphQLFilter = require("broccoli-graphql-filter");
          return new GraphQLFilter(tree);
        }
      });
    }
  }
};
