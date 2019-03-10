import ComponentQueryManager from './-private/mixins/component-query-manager';
import ObjectQueryManager from './-private/mixins/object-query-manager';
import RouteQueryManager from './-private/mixins/route-query-manager';
import QueryManager, { queryManager } from './-private/apollo/query-manager';

export function getObservable(queryResult) {
  return queryResult._apolloObservable;
}

export let apolloObservableKey = '_apolloObservable';

export {
  queryManager,
  QueryManager,
  ComponentQueryManager,
  ObjectQueryManager,
  RouteQueryManager,
};
