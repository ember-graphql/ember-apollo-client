import Ember from 'ember';

const {
  Mixin,
  inject,
  get,
  set,
  assert,
  isNone
} = Ember;

export default Mixin.create({
  apollo: inject.service(),
  mutations: {},
  init(...args) {
    this._super(...args);
    this._registerMutations();
  },
  _registerMutations() {
    const mutations = get(this, 'mutations');

    for (const key in mutations) {
      if(!mutations.hasOwnProperty(key)) {
        continue;
      }
      assert(`Method is already defined '${key}'`, isNone(this[key]));

      const mutationData = mutations[key];
      this._registerMutation(key, mutationData);
    }
  },
  _registerMutation(key, mutationData) {
    const { loadingProperty } = mutationData;
    if (loadingProperty) {
      assert(`Property already exists '${key}'`, !this.hasOwnProperty(loadingProperty));
      set(this, loadingProperty, 0);
    }

    const mutationMethod = function(variables = {}) {
      const apollo = get(this, 'apollo');

      const mergedVariables = Object.assign({}, (mutationData.variables || {}), variables);
      const data = Object.assign(mutationData, { variables: mergedVariables });
       if (loadingProperty) {
        this.incrementProperty(loadingProperty);
      }
      const mutationPromise = apollo.mutate(data);
      if (!loadingProperty) {
        return mutationPromise;
      }
      return mutationPromise.then(result => {
        this.decrementProperty(loadingProperty);
        return result;
      }).catch(err => {
        this.decrementProperty(loadingProperty);
        throw err;
      })
    };
    this[key] = mutationMethod.bind(this);
  }
});
