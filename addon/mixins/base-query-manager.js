import { inject as service } from "@ember/service";
import Mixin from "@ember/object/mixin";

export default Mixin.create({
  apolloService: service('apollo'),

  init() {
    this._super(...arguments);

    let queryManager = this.get('apolloService').createQueryManager();
    this.set('apollo', queryManager);
  },
});
