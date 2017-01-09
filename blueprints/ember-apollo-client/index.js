/* global module */

module.exports = {
  normalizeEntityName: function() {}, // no-op since we're just adding dependencies

  afterInstall: function() {
    return this.addAddonsToProject({
      packages: [
        { name: 'ember-browserify', target: '^1.1.11' },
        { name: 'ember-graphql-shim' },
        { name: 'ember-graphql-tag-shim' }
      ]
    })
    .then(() => {
      return this.addPackageToProject('apollo-client');
    });
  }
};
