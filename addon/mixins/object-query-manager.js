import Mixin from '@ember/object/mixin';
import BaseQueryManager from 'ember-apollo-client/mixins/base-query-manager';

export default Mixin.create(BaseQueryManager, {
  willDestroy() {
    this._super(...arguments);
    this.get('apollo').unsubscribeAll(false);
  },
});
