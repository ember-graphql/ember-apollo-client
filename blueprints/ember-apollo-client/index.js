module.exports = {
  normalizeEntityName: function() {}, // no-op since we're just adding dependencies

  afterInstall: function() {
    return this.addAddonToProject('ember-graphql-tag-shim')
    .then(() => {
      return this.addPackagesToProject([
        { name: 'apollo-client' },
        { name: 'graphql' }
      ]);
    });
  }
};
