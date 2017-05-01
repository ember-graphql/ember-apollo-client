import Ember from 'ember';

const { A, inject: { service }, Object: EmberObject } = Ember;

export default EmberObject.extend({
  apollo: service(),

  activeSubscriptions: null,

  init() {
    this._super(...arguments);
    this.set('activeSubscriptions', A([]));
  },

  mutate(opts) {
    return this.get('apollo').mutate(opts);
  },

  query(opts, resultKey) {
    return this.get('apollo').queryOnce(opts, resultKey);
  },

  watchQuery(opts, resultKey) {
    return this.get('apollo').managedWatchQuery(this, opts, resultKey);
  },

   /**
   * Tracks a subscription in the list of active subscriptions, which will all be
   * cancelled when `unsubcribeAll` is called.
   *
   * @method trackSubscription
   * @param {!Object} subscription The Apollo Client Subscription to be tracked for future unsubscription.
   * @private
   */
  trackSubscription(subscription) {
    this.get('activeSubscriptions').pushObject(subscription);
  },

  unsubscribeAll() {
    let subscriptions = this.get('activeSubscriptions');
    subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
    this.set('activeSubscriptions', A([]));
  },
});
