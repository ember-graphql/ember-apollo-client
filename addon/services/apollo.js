import Ember from 'ember';
import ApolloClient, { createNetworkInterface } from 'apollo-client';
import QueryManager from 'ember-apollo-client/apollo/query-manager';

const {
  A,
  copy,
  computed,
  deprecate,
  isArray,
  isNone,
  isPresent,
  get,
  getOwner,
  merge,
  Object: EmberObject,
  RSVP,
  run,
  Service,
  setProperties,
  Test,
  testing,
} = Ember;

const { alias } = computed;

function newDataFunc(observable, resultKey, resolve) {
  let obj;
  let mergedProps = { _apolloObservable: observable };

  return ({ data }) => {
    let dataToSend = isNone(resultKey) ? data : get(data, resultKey);
    dataToSend = copy(dataToSend, true);
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

export default Service.extend({
  client: null,
  apiURL: alias('options.apiURL'),

  // options are injected by an initializer and configured in your environment.js.
  options: { apiURL: null },

  init() {
    this._super(...arguments);

    const owner = getOwner(this);
    if (owner) {
      owner.registerOptionsForType('apollo', { instantiate: false });
    }

    let client = new ApolloClient(this.get('clientOptions'));
    this.set('client', client);

    if (testing) {
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
    const apiURL = this.get('apiURL');
    const middlewares = this.get('middlewares');
    const networkInterface = createNetworkInterface({ uri: apiURL });

    if (isPresent(middlewares)) {
      networkInterface.use(middlewares);
    }

    return {
      networkInterface,
    };
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
              : result.data[resultKey];
            dataToSend = copy(dataToSend, true);
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
   * @method query
   * @param {!Object} opts The query options used in the Apollo Client watchQuery.
   * @param {String} resultKey The key that will be returned from the resulting response data. If null or undefined, the entire response data will be returned.
   * @deprecated Use `watchQuery` instead.
   * @return {!Promise}
   * @public
   */
  query(opts, resultKey) {
    deprecate(`Usage of \`query\` is deprecated, use \`watchQuery\` instead.`, false, {
      id: 'ember-apollo-client.deprecate-query-for-watch-query',
      until: '1.0.0',
    });
    return this.watchQuery(opts, resultKey);
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
    let obj, subscription;
    let _apolloUnsubscribe = function() {
      subscription.unsubscribe();
    };
    return this._waitFor(
      new RSVP.Promise((resolve, reject) => {
        let newData = ({ data }) => {
          let dataToSend = isNone(resultKey) ? data : get(data, resultKey);
          dataToSend = copy(dataToSend, true);
          if (isNone(obj)) {
            if (isArray(dataToSend)) {
              obj = A(dataToSend);
              obj.setProperties({ _apolloUnsubscribe });
            } else {
              obj = EmberObject.create(
                merge(dataToSend, { _apolloUnsubscribe })
              );
            }
            resolve(obj);
          } else {
            run(() => {
              isArray(obj)
                ? obj.setObjects(dataToSend)
                : setProperties(obj, dataToSend);
            });
          }
        };
        // TODO: add an error function here for handling errors
        subscription = this.client.watchQuery(opts).subscribe({
          next: newData,
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
   * @method queryOnce
   * @param {!Object} opts The query options used in the Apollo Client query.
   * @param {String} resultKey The key that will be returned from the resulting response data. If null or undefined, the entire response data will be returned.
   * @return {!Promise}
   * @public
   */
  queryOnce(opts, resultKey) {
    return this._waitFor(
      this.client.query(opts).then(result => {
        let response = result.data;
        if (!isNone(resultKey)) {
          response = response[resultKey];
        }
        return RSVP.resolve(copy(response, true));
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
    return promise
      .then(result => {
        this._decrementOngoing();
        return result;
      })
      .catch(err => {
        this._decrementOngoing();
        return RSVP.reject(err);
      });
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
    Test.registerWaiter(this._waiter);
  },
});
