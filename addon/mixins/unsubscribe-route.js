import Ember from 'ember';

const { deprecate, Mixin } = Ember;

export default Mixin.create({
  resetController() {
    deprecate(`The \`UnsubscribeRoute\` mixin is deprecated, use \`RouteQueryManager\` instead.`, false, {
      id: 'ember-apollo-client.deprecate-unsubscribe-route',
      until: '1.0.0',
    });

    this._super(...arguments);

    // If the model came from an apollo query, it will have an
    // _apolloUnsubscribe function to stop it from receiving store updates.
    let unsubscribe = this.get('controller.model._apolloUnsubscribe');
    if (unsubscribe) {
      unsubscribe();
    }
  }
});
