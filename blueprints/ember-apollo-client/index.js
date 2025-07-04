/* eslint-env node */
module.exports = {
  description: 'Add graphql in the consumer app',

  normalizeEntityName() {},

  afterInstall() {
    return this.addPackagesToProject([{ name: 'graphql', target: '^16.0.0' }]);
  },
};
