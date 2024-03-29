/* eslint-env node */
module.exports = {
  description: 'Add ember-fetch in the consumer app',

  normalizeEntityName() {},

  /*
   * This is necessary until this is fixed
   * https://github.com/ember-cli/ember-fetch/issues/98
   */
  afterInstall() {
    return this.addPackagesToProject([
      { name: 'ember-fetch', target: '^8.0.4' },
      { name: 'graphql', target: '^16.0.0' },
    ]);
  },
};
