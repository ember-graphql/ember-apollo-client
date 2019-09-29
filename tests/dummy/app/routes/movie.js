import Route from '@ember/routing/route';
import { queryManager, getObservable } from 'ember-apollo-client';
import query from 'dummy/gql/queries/movie';
import mutation from 'dummy/gql/mutations/change-movie-title';

export default Route.extend({
  apollo: queryManager(),

  model({ id }) {
    return this.apollo.watchQuery({
      query,
      variables: {
        id,
      },
    });
  },

  actions: {
    refetchData(id) {
      this.apollo.query({
        query,
        variables: { id },
        fetchPolicy: 'network-only',
      });
    },

    refetchUsingObservable(model) {
      const observable = getObservable(model);
      observable.refetch();
    },

    changeTitle(id, title) {
      return this.apollo.mutate({
        mutation,
        variables: { id, title },
      });
    },
  },
});
