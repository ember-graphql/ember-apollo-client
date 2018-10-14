import { service } from '@ember-decorators/service';
import EmberObject, { get } from '@ember/object';
import { alias } from '@ember-decorators/object/computed';
import {
  ApolloClient,
  MutationOptions,
  QueryOptions,
  WatchQueryOptions,
} from 'apollo-client';
import ApolloService, { ResultKey } from 'ember-apollo-client/services/apollo';

type Subscription = ZenObservable.Subscription;

interface ActiveSubscription {
  subscription: Subscription;
  stale: boolean;
}

export default class QueryManager extends EmberObject {
  @service apollo!: ApolloService;
  @alias('apollo.client') apolloClient!: ApolloClient<any>;

  private activeSubscriptions: ActiveSubscription[] = [];

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
  mutate(opts: MutationOptions, resultKey: ResultKey) {
    return get(this, 'apollo').mutate(opts, resultKey);
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
  query(opts: QueryOptions, resultKey: ResultKey) {
    return get(this, 'apollo').query(opts, resultKey);
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
  watchQuery(opts: WatchQueryOptions, resultKey: ResultKey) {
    return get(this, 'apollo').managedWatchQuery(this, opts, resultKey);
  }

  /**
   * Tracks a subscription in the list of active subscriptions, which will all be
   * cancelled when `unsubscribeAll` is called.
   *
   * @method trackSubscription
   * @param {!Object} subscription The Apollo Client Subscription to be tracked for future unsubscribing.
   * @private
   */
  trackSubscription(subscription: Subscription) {
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
    for (const subscription of this.activeSubscriptions) {
      subscription.stale = true;
    }
  }

  /**
   * Unsubscribes from all actively tracked subscriptions initiated by calls to
   * `watchQuery`. This is normally called automatically by the
   * ComponentQueryManagerMixin when a component is torn down, or by the
   * RouteQueryManagerMixin when `resetController` is called on the route.
   *
   * @method unsubscribeAll
   * @param {Boolean} onlyStale Whether to unsubscribe only from subscriptions which were previously marked as stale.
   * @return {!Promise}
   * @public
   */
  unsubscribeAll(onlyStale = false) {
    for (const { stale, subscription } of this.activeSubscriptions) {
      if (!onlyStale || stale) {
        subscription.unsubscribe();
      }
    }
    this.activeSubscriptions = [];
  }
}
