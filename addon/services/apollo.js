import Ember from 'ember';
import Service from '@ember/service';
import EmberObject, { get, setProperties, computed } from '@ember/object';
import { A } from '@ember/array';
import { deprecate } from '@ember/application/deprecations';
import { isArray } from '@ember/array';
import { isNone, isPresent } from '@ember/utils';
import { getOwner } from '@ember/application';
import { merge } from '@ember/polyfills';
import RSVP from 'rsvp';
import { run } from '@ember/runloop';
import { alias } from '@ember/object/computed';
import { ApolloClient } from 'apollo-client';
import { createHttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { apolloObservableKey } from 'ember-apollo-client';
import QueryManager from 'ember-apollo-client/apollo/query-manager';
import copyWithExtras from 'ember-apollo-client/utils/copy-with-extras';
import { registerWaiter } from '@ember/test';
import fetch from 'fetch';

function newDataFunc(observable, resultKey, resolve, mergedProps = {}) {
  let obj;
  mergedProps[apolloObservableKey] = observable;

  return ({ data, loading }) => {
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
        obj = A(dataToSend);
        obj.setProperties(mergedProps);
      } else {
        obj = EmberObject.create(merge(dataToSend, mergedProps));
      }
      return resolve(obj);
    }

    run(() => {
      isArray(obj)
        ? obj.setObjects(dataToSend)
        : setProperties(obj, dataToSend);
    });
  };
}

// used in environments without injected `config:environment` (i.e. unit tests):
const defaultOptions = {
  apiURL: 'http://testserver.example/v1/graph',
};

export default Service.extend({
  client: null,
  apiURL: alias('options.apiURL'),
  requestCredentials: alias('options.requestCredentials'),

  // options are configured in your environment.js.
  options: computed(function() {
    // config:environment not injected into tests, so try to handle that gracefully.
    let config = getOwner(this).resolveRegistration('config:environment');
    if (config && config.apollo) {
      return config.apollo;
    } else if (Ember.testing) {
      return defaultOptions;
    }
    throw new Error('no Apollo service options defined');
  }),

  init() {
    this._super(...arguments);

    const owner = getOwner(this);
    if (owner) {
      owner.registerOptionsForType('apollo', { instantiate: false });
    }

    let client = new ApolloClient(this.get('clientOptions'));
    this.set('client', client);

    if (Ember.testing) {
      this._registerWaiter();
    }
  },

  /**
   * This is the options hash that will be passed to the ApolloClient constructor.
   * You can override it if you wish to customize the ApolloClient.
   *
   * @method clientOptions
   * @return {!Object}
   * @public
   */
  clientOptions: computed(function() {
    return {
      link: this.get('link'),
      cache: this.get('cache'),
    };
  }),

  cache: computed(function() {
    return new InMemoryCache();
  }),

  link: computed(function() {
    let uri = this.get('apiURL');
    let requestCredentials = this.get('requestCredentials');
    const linkOptions = { uri, fetch };

    if (isPresent(requestCredentials)) {
      linkOptions.credentials = requestCredentials;
    }
    let link = createHttpLink(linkOptions);

    let middlewares = this.get('middlewares');
    if (isPresent(middlewares)) {
      deprecate(
        `The \`middlewares\` option is deprecated, override \`link\` instead.`,
        false,
        {
          id: 'ember-apollo-client.deprecate-middlewares-for-link',
          until: '1.0.0',
          url:
            'https://github.com/apollographql/apollo-client/blob/master/docs/source/2.0-migration.md#network-middleware-and-afterware',
        }
      );
    }

    return link;
  }),

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
  mutate(opts, resultKey) {
    return this._waitFor(
      new RSVP.Promise((resolve, reject) => {
        this.client
          .mutate(opts)
          .then(result => {
            let dataToSend = isNone(resultKey)
              ? result.data
              : get(result.data, resultKey);
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
  },

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
  watchQuery(opts, resultKey) {
    let observable = this.client.watchQuery(opts);
    let subscription;

    let mergedProps = {
      _apolloUnsubscribe() {
        subscription.unsubscribe();
      },
    };
    mergedProps[apolloObservableKey] = observable;

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
  },

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
  query(opts, resultKey) {
    return this._waitFor(
      new RSVP.Promise((resolve, reject) => {
        this.client
          .query(opts)
          .then(result => {
            let response = result.data;
            if (!isNone(resultKey)) {
              response = get(response, resultKey);
            }
            return resolve(copyWithExtras(response, [], []));
          })
          .catch(error => {
            return reject(error);
          });
      })
    );
  },

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
  managedWatchQuery(manager, opts, resultKey) {
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
  },

  createQueryManager() {
    return QueryManager.create({ apollo: this });
  },

  /**
   * Wraps a promise in test waiters.
   *
   * @param {!Promise} promise
   * @return {!Promise}
   * @private
   */
  _waitFor(promise) {
    this._incrementOngoing();
    return promise.finally(() => this._decrementOngoing());
  },

  // unresolved / ongoing requests, used for tests:
  _ongoing: 0,

  _incrementOngoing() {
    this._ongoing++;
  },

  _decrementOngoing() {
    this._ongoing--;
  },

  _shouldWait() {
    return this._ongoing === 0;
  },

  _registerWaiter() {
    this._waiter = () => {
      return this._shouldWait();
    };
    registerWaiter(this._waiter);
  },
});
