import Ember from 'ember';

const { inject: { service }, Mixin } = Ember;

export default Mixin.create({
  apollo: service(),

  init() {
    this._super(...arguments);

    let queryManager = this.get('apollo').createQueryManager();
    this.set('apollo', queryManager);
  },
});
