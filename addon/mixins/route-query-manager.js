import Mixin from '@ember/object/mixin';
import BaseQueryManager from 'ember-apollo-client/mixins/base-query-manager';

export default Mixin.create(BaseQueryManager, {
  beforeModel() {
    this.get('apollo').markSubscriptionsStale();
    return this._super(...arguments);
  },

  resetController(_controller, isExiting) {
    this._super(...arguments);
    this.get('apollo').unsubscribeAll(!isExiting);
  },

  willDestroy() {
    let apollo = this.get('apollo');
    if (apollo.unsubscribeAll) {
      this.get('apollo').unsubscribeAll(false);
    }
    this._super(...arguments);
  },
});
