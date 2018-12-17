import Ember from 'ember';
import Service from '@ember/service';
import EmberObject, { get, setProperties } from '@ember/object';
import { computed } from '@ember-decorators/object';
import { alias } from '@ember-decorators/object/computed';
import { A } from '@ember/array';
import { isArray } from '@ember/array';
import { isNone, isPresent } from '@ember/utils';
import { getOwner } from '@ember/application';
import { assign } from '@ember/polyfills';
import RSVP from 'rsvp';
import { run } from '@ember/runloop';
import {
  ApolloClient,
  MutationOptions,
  QueryOptions,
  WatchQueryOptions,
  ObservableQuery,
} from 'apollo-client';
import { createHttpLink, FetchOptions } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { apolloObservableKey } from 'ember-apollo-client';
import QueryManager from 'ember-apollo-client/apollo/query-manager';
import copyWithExtras from 'ember-apollo-client/utils/copy-with-extras';
import { registerWaiter } from '@ember/test';
import fetch from 'fetch';
import { ApolloCache } from 'apollo-cache';
import NativeArray from '@ember/array/-private/native-array';

type Subscription = ZenObservable.Subscription;
export type ResultKey = string | null | undefined;

function newDataFunc(
  observable: ObservableQuery,
  resultKey: ResultKey,
  resolve: (value: any) => void,
  mergedProps: { [key: string]: any } = {}
) {
  let obj: any;
  mergedProps[apolloObservableKey] = observable;

  return ({ data, loading }: { data: any; loading: any }) => {
    if (loading && data === undefined) {
      // This happens when the cache has no data and the data is still loading
      // from the server. We don't want to resolve the promise with empty data
      // so we instead just bail out.
      //
      // See https://github.com/bgentry/ember-apollo-client/issues/45
      return;
    }
    let keyedData = isNone(resultKey) ? data : data && get(data, resultKey);
    let dataToSend = copyWithExtras(keyedData || {}, [], []);
    if (isNone(obj)) {
      if (isArray(dataToSend)) {
        obj = A(dataToSend as any[]);
        obj.setProperties(mergedProps);
      } else {
        obj = EmberObject.create(assign(dataToSend, mergedProps));
      }
      return resolve(obj);
    }

    run(() => {
      isArray(obj)
        ? (obj as NativeArray<any>).setObjects(dataToSend)
        : setProperties(obj, dataToSend);
    });
  };
}

// used in environments without injected `config:environment` (i.e. unit tests):
const defaultOptions = {
  apiURL: 'http://testserver.example/v1/graph',
};

export default class ApolloService extends Service {
  client: ApolloClient<any> = new ApolloClient(this.get('clientOptions'));
  @alias('options.apiURL') apiURL!: string;
  @alias('options.requestCredentials') requestCredentials!: string;

  // options are configured in your environment.js.
  @computed
  get options() {
    // config:environment not injected into tests, so try to handle that gracefully.
    let config = getOwner(this).resolveRegistration('config:environment');
    if (config && config.apollo) {
      return config.apollo;
    } else if (Ember.testing) {
      return defaultOptions;
    }
    throw new Error('no Apollo service options defined');
  }

  init(...args: any[]) {
    super.init(...args);

    const owner = getOwner(this);
    if (owner) {
      owner.registerOptionsForType('apollo', { instantiate: false });
    }

    if (Ember.testing) {
      this._registerWaiter();
    }
  }

  /**
   * This is the options hash that will be passed to the ApolloClient constructor.
   * You can override it if you wish to customize the ApolloClient.
   *
   * @method clientOptions
   * @return {!Object}
   * @public
   */
  @computed
  get clientOptions() {
    return {
      link: get(this, 'link'),
      cache: get(this, 'cache'),
    };
  }

  @computed
  get cache(): ApolloCache<any> {
    return new InMemoryCache();
  }

  @computed
  get link() {
    const uri = get(this, 'apiURL');
    const requestCredentials = get(this, 'requestCredentials');
    const linkOptions: FetchOptions = { uri, fetch };

    if (isPresent(requestCredentials)) {
      linkOptions.credentials = requestCredentials;
    }
    return createHttpLink(linkOptions);
  }

  /**
   * Executes a mutation on the Apollo client. The resolved object will
   * never be updated and does not have to be unsubscribed.
   *
   * @method mutate
   * @param {!Object} opts The query options used in the Apollo Client mutate.
   * @param {String} resultKey The key that will be returned from the resulting response data. If null or undefined, the entire response data will be returned.
   * @return {!Promise}
   * @public
   */
  mutate(opts: MutationOptions, resultKey: ResultKey) {
    return this._waitFor(
      new RSVP.Promise((resolve, reject) => {
        this.client
          .mutate(opts)
          .then(result => {
            let dataToSend = isNone(resultKey)
              ? result.data
              : get(result.data!, resultKey);
            dataToSend = copyWithExtras(dataToSend, [], []);
            return resolve(dataToSend);
          })
          .catch(error => {
            let errors;
            if (isPresent(error.networkError)) {
              error.networkError.code = 'network_error';
              errors = [error.networkError];
            } else if (isPresent(error.graphQLErrors)) {
              errors = error.graphQLErrors;
            }
            if (errors) {
              return reject({ errors });
            }
            throw error;
          });
      })
    );
  }

  /**
   * Executes a `watchQuery` on the Apollo client. If updated data for this
   * query is loaded into the store by another query, the resolved object will
   * be updated with the new data.
   *
   * When using this method, it is important to call `apolloUnsubscribe()` on
   * the resolved data when the route or component is torn down. That tells
   * Apollo to stop trying to send updated data to a non-existent listener.
   *
   * @method watchQuery
   * @param {!Object} opts The query options used in the Apollo Client watchQuery.
   * @param {String} resultKey The key that will be returned from the resulting response data. If null or undefined, the entire response data will be returned.
   * @return {!Promise}
   * @public
   */
  watchQuery(opts: WatchQueryOptions, resultKey: ResultKey) {
    let observable = this.client.watchQuery(opts);
    let subscription: Subscription;

    let mergedProps = {
      _apolloUnsubscribe() {
        subscription.unsubscribe();
      },
      [apolloObservableKey]: observable,
    };

    return this._waitFor(
      new RSVP.Promise((resolve, reject) => {
        // TODO: add an error function here for handling errors
        subscription = observable.subscribe({
          next: newDataFunc(observable, resultKey, resolve, mergedProps),
          error(e) {
            reject(e);
          },
        });
      })
    );
  }

  /**
   * Executes a single `query` on the Apollo client. The resolved object will
   * never be updated and does not have to be unsubscribed.
   *
   * @method query
   * @param {!Object} opts The query options used in the Apollo Client query.
   * @param {String} resultKey The key that will be returned from the resulting response data. If null or undefined, the entire response data will be returned.
   * @return {!Promise}
   * @public
   */
  query(opts: QueryOptions, resultKey: ResultKey) {
    return this._waitFor(
      new RSVP.Promise((resolve, reject) => {
        this.client
          .query(opts)
          .then(result => {
            let response = result.data;
            if (!isNone(resultKey)) {
              response = get(response as { [key: string]: any }, resultKey);
            }
            return resolve(copyWithExtras(response, [], []));
          })
          .catch(error => {
            return reject(error);
          });
      })
    );
  }

  /**
   * Executes a `watchQuery` on the Apollo client and tracks the resulting
   * subscription on the provided query manager.
   *
   * @method managedWatchQuery
   * @param {!Object} manager A QueryManager that should track this active watchQuery.
   * @param {!Object} opts The query options used in the Apollo Client watchQuery.
   * @param {String} resultKey The key that will be returned from the resulting response data. If null or undefined, the entire response data will be returned.
   * @return {!Promise}
   * @private
   */
  managedWatchQuery(
    manager: QueryManager,
    opts: WatchQueryOptions,
    resultKey: ResultKey
  ) {
    let observable = this.client.watchQuery(opts);

    return this._waitFor(
      new RSVP.Promise((resolve, reject) => {
        let subscription = observable.subscribe({
          next: newDataFunc(observable, resultKey, resolve),
          error(e) {
            reject(e);
          },
        });
        manager.trackSubscription(subscription);
      })
    );
  }

  createQueryManager() {
    return QueryManager.create({ apollo: this });
  }

  /**
   * Wraps a promise in test waiters.
   *
   * @param {!Promise} promise
   * @return {!Promise}
   * @private
   */
  private _waitFor(promise: RSVP.Promise<any>) {
    this._incrementOngoing();
    return promise.finally(() => this._decrementOngoing());
  }

  // unresolved / ongoing requests, used for tests:
  _ongoing = 0;

  private _incrementOngoing() {
    this._ongoing++;
  }

  private _decrementOngoing() {
    this._ongoing--;
  }

  private _isDone() {
    return this._ongoing === 0;
  }

  private _waiter?: () => boolean;

  private _registerWaiter() {
    this._waiter = () => this._isDone();
    registerWaiter(this._waiter);
  }
}
