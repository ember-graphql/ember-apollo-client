import Mixin from '@ember/object/mixin';
import BaseQueryManager from 'ember-apollo-client/-private/mixins/base-query-manager';

export default Mixin.create(BaseQueryManager, {
  willDestroyElement() {
    this._super(...arguments);
    this.get('apollo').unsubscribeAll(false);
  },
});
