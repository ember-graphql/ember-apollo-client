import Ember from 'ember';

const { Mixin } = Ember;

export default Mixin.create({
  resetController() {
    this._super(...arguments);

    // If the model came from an apollo query, it will have an
    // _apolloUnsubscribe function to stop it from receiving store updates.
    let unsubscribe = this.get('controller.model._apolloUnsubscribe');
    if (unsubscribe) {
      unsubscribe();
    }
  }
});
