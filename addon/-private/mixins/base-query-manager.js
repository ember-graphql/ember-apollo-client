import { inject as service } from '@ember/service';
import Mixin from '@ember/object/mixin';
import { computed } from '@ember/object';

export default Mixin.create({
  apolloService: service('apollo'),
  apollo: computed('apolloService', function() {
    return this.get('apolloService').createQueryManager();
  }),
});
