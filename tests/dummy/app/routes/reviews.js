import Route from '@ember/routing/route';
import query from 'dummy/gql/queries/reviews';
import { queryManager, getObservable } from 'ember-apollo-client';

export default Route.extend({
  apollo: queryManager(),

  model() {
    return this.apollo.watchQuery({ query }, 'reviews');
  },

  actions: {
    refetchData(model) {
      const observable = getObservable(model);
      observable.refetch();
    },
  },
});
