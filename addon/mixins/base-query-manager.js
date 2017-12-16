import { inject as service } from "@ember/service";
import Mixin from "@ember/object/mixin";

export default Mixin.create({
  apollo: service(),

  init() {
    this._super(...arguments);

    let queryManager = this.get('apollo').createQueryManager();
    this.set('apollo', queryManager);
  },
});
