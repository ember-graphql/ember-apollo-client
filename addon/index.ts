import { ObservableQuery } from 'apollo-client';

export {
  default as ComponentQueryManager,
} from 'ember-apollo-client/-private/mixins/component-query-manager';
export {
  default as ObjectQueryManager,
} from 'ember-apollo-client/-private/mixins/object-query-manager';
export {
  default as RouteQueryManager,
} from 'ember-apollo-client/-private/mixins/route-query-manager';

export const apolloObservableKey = '_apolloObservable';

export function getObservable(queryResult: {
  [apolloObservableKey]: ObservableQuery;
}): ObservableQuery {
  return queryResult[apolloObservableKey];
}
