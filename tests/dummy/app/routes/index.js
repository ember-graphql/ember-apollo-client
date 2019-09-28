import Route from '@ember/routing/route';
import { queryManager, getObservable } from 'ember-apollo-client';
import query from 'dummy/gql/queries/movies';

export default Route.extend({
  apollo: queryManager(),

  queryParams: {
    topRated: {
      refreshModel: true,
    },
  },

  model({ topRated }) {
    return this.apollo.watchQuery({
      query,
      variables: {
        topRated,
      },
    });
  },

  actions: {
    refetchData(model) {
      const observable = getObservable(model);
      observable.refetch();
    },
  },
});
