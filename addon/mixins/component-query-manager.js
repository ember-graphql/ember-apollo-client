import Ember from 'ember';
import BaseQueryManager from 'ember-apollo-client/mixins/base-query-manager';

const { Mixin } = Ember;

export default Mixin.create(BaseQueryManager, {
  willDestroyElement() {
    this._super(...arguments);
    this.get('apollo').unsubscribeAll();
  },
});
