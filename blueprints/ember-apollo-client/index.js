/* eslint-env node */
module.exports = {
  description: 'Add ember-fetch in the consumer app',

  /*
  * This is necessary until this is fixed
  * https://github.com/ember-cli/ember-fetch/issues/98
  */
  afterInstall() {
    return this.addPackagesToProject([
      {name: 'ember-fetch', target: '^3.4.4'}
    ]);
  }
};