import ComponentQueryManager from './-private/mixins/component-query-manager';
import ObjectQueryManager from './-private/mixins/object-query-manager';
import RouteQueryManager from './-private/mixins/route-query-manager';
import QueryManager, { queryManager } from './-private/apollo/query-manager';

export let apolloObservableKey = '_apolloObservable';
export let apolloUnsubscribeKey = '_apolloUnsubscribe';

export function getObservable(queryResult) {
  return queryResult[apolloObservableKey];
}

export function unsubscribe(queryResult) {
  let fn = queryResult[apolloUnsubscribeKey];

  if (typeof fn === 'function') {
    return fn();
  }
}

export {
  queryManager,
  QueryManager,
  ComponentQueryManager,
  ObjectQueryManager,
  RouteQueryManager,
};
