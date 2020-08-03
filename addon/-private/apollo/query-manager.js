import { getOwner } from '@ember/application';
import { computed } from '@ember/object';
import setupHooks from './setup-hooks';

// https://github.com/emberjs/ember.js/blob/70bcd9facdaf37ba19f60e6a10a511a34724f0f4/packages/%40ember/-internals/metal/lib/decorator.ts#L20-L41
function isElementDescriptor(args) {
  let [maybeTarget, maybeKey, maybeDesc] = args;

  return (
    // Ensure we have the right number of args
    args.length === 3 &&
    // Make sure the target is a class or object (prototype)
    (typeof maybeTarget === 'function' ||
      (typeof maybeTarget === 'object' && maybeTarget !== null)) &&
    // Make sure the key is a string
    typeof maybeKey === 'string' &&
    // Make sure the descriptor is the right shape
    ((typeof maybeDesc === 'object' &&
      maybeDesc !== null &&
      'enumerable' in maybeDesc &&
      'configurable' in maybeDesc) ||
      // TS compatibility
      maybeDesc === undefined)
  );
}

export function queryManager(...theArgs) {
  let serviceName = 'apollo';
  let [options] = theArgs;
  if (typeof options === 'object' && options.service) {
    serviceName = options.service;
  }

  let setupQueryManager = computed(function () {
    const service = getOwner(this).lookup(`service:${serviceName}`);
    const queryManager = new QueryManager(service);
    setupHooks(queryManager, this);
    return queryManager;
  });

  if (isElementDescriptor(theArgs)) {
    // Needed to suport @queryManager apollo; (no arguments)
    return setupQueryManager(...theArgs);
  } else {
    return setupQueryManager;
  }
}

export default class QueryManager {
  apollo = undefined;
  activeSubscriptions = [];

  constructor(apolloService) {
    this.apollo = apolloService;
  }

  get apolloClient() {
    return this.apollo.client;
  }

  /**
   * Executes a mutation on the Apollo service. The resolved object will
   * never be updated and does not have to be unsubscribed.
   *
   * @method mutate
   * @param {!Object} opts The query options used in the Apollo Client mutate.
   * @param {String} resultKey The key that will be returned from the resulting response data. If null or undefined, the entire response data will be returned.
   * @return {!Promise}
   * @public
   */
  mutate(opts, resultKey) {
    return this.apollo.mutate(opts, resultKey);
  }

  /**
   * Executes a single `query` on the Apollo service. The resolved object will
   * never be updated and does not have to be unsubscribed.
   *
   * @method query
   * @param {!Object} opts The query options used in the Apollo Client query.
   * @param {String} resultKey The key that will be returned from the resulting response data. If null or undefined, the entire response data will be returned.
   * @return {!Promise}
   * @public
   */
  query(opts, resultKey) {
    return this.apollo.query(opts, resultKey);
  }

  /**
   * Executes a `watchQuery` on the Apollo service. If updated data for this
   * query is loaded into the store by another query, the resolved object will
   * be updated with the new data.
   *
   * This watch query is tracked by the QueryManager and will be unsubscribed
   * (and no longer updated with new data) when unsubscribeAll() is called.
   *
   * @method watchQuery
   * @param {!Object} opts The query options used in the Apollo Client watchQuery.
   * @param {String} resultKey The key that will be returned from the resulting response data. If null or undefined, the entire response data will be returned.
   * @return {!Promise}
   * @public
   */
  watchQuery(opts, resultKey) {
    return this.apollo.managedWatchQuery(this, opts, resultKey);
  }

  /**
   * Executes a `subscribe` on the Apollo service.
   *
   * This subscription is tracked by the QueryManager and will be unsubscribed
   * (and no longer updated with new data) when unsubscribeAll() is called.
   *
   * The Promise will contain a Subscription object which will contain events
   * as they come in. It will also trigger `event` messages which can be listened for.
   *
   * @method subscribe
   * @param {!Object} opts The query options used in the Apollo Client watchQuery.
   * @param {String} resultKey The key that will be returned from the resulting response data. If null or undefined, the entire response data will be returned.
   * @return {!Promise}
   * @public
   */
  subscribe(opts, resultKey) {
    return this.apollo.managedSubscribe(this, opts, resultKey);
  }

  /**
   * Tracks a subscription in the list of active subscriptions, which will all be
   * cancelled when `unsubcribeAll` is called.
   *
   * @method trackSubscription
   * @param {!Object} subscription The Apollo Client Subscription to be tracked for future unsubscription.
   * @private
   */
  trackSubscription(subscription) {
    this.activeSubscriptions.push({ subscription, stale: false });
  }

  /**
   * Marks all tracked subscriptions as being stale, such that they will be
   * unsubscribed in `unsubscribeAll` even if `onlyStale` is true.
   *
   * @method markSubscriptionsStale
   * @private
   */
  markSubscriptionsStale() {
    this.activeSubscriptions.forEach((subscription) => {
      subscription.stale = true;
    });
  }

  /**
   * Unsubscribes from all actively tracked subscriptions initiated by calls to
   * `watchQuery`. This is normally called automatically by the
   * queryManager decorator when a component is torn down, or qhen `resetController`
   * is called on the route.
   *
   * @method unsubscribeAll
   * @param {Boolean} onlyStale Whether to unsubscribe only from subscriptions which were previously marked as stale.
   * @public
   */
  unsubscribeAll(onlyStale = false) {
    this.activeSubscriptions.forEach((subscription) => {
      if (!onlyStale || subscription.stale) {
        subscription.subscription.unsubscribe();
      }
    });

    this.activeSubscriptions = onlyStale
      ? this.activeSubscriptions.filter((subscription) => {
          return !subscription.stale;
        })
      : [];
  }
}
