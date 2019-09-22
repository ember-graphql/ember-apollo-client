import Mixin from '@ember/object/mixin';
import BaseQueryManager from 'ember-apollo-client/-private/mixins/base-query-manager';

export default Mixin.create(BaseQueryManager, {
  beforeModel() {
    this.apollo.markSubscriptionsStale();
    return this._super(...arguments);
  },

  resetController(_controller, isExiting) {
    this._super(...arguments);
    this.apollo.unsubscribeAll(!isExiting);
  },

  willDestroy() {
    let apollo = this.apollo;
    if (apollo.unsubscribeAll) {
      this.apollo.unsubscribeAll(false);
    }
    this._super(...arguments);
  },
});
