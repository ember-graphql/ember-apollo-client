export function getObservable(queryResult) {
  return queryResult._apolloObservable;
}

export let apolloObservableKey = '_apolloObservable';
