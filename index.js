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

  included({ project, env }) {
    this._super.included.apply(this, arguments);
    this.addonConfig = project.config(env)["apollo"] || {};

    this.import("vendor/-apollo-client-bundle.js");
    this.import("vendor/-apollo-client-shims.js");
  },

  treeForVendor() {
    const WebpackDependencyPlugin = require("./lib/webpack-dependency-plugin");
    const {
      addonConfig: { include: userPackages, exclude: excludedPackages }
    } = this;
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
          const GraphQLFilter = require("./lib/graphql-filter");
          return new GraphQLFilter(tree);
        }
      });
    }
  }
};
