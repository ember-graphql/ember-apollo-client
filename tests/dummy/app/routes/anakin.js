import Route from '@ember/routing/route';
import RouteQueryManager from 'ember-apollo-client/mixins/route-query-manager';
import query from 'dummy/gql/queries/human';
import mutation from 'dummy/gql/mutations/change-character-name';

const variables = { id: '1000' };

export default Route.extend(RouteQueryManager, {
  model() {
    return this.get('apollo').watchQuery({
      query,
      variables,
      fetchPolicy: 'cache-and-network',
    }, 'human');
  },

  actions: {
    changeName(id, name) {
      return this.get('apollo').mutate({
        mutation,
        variables: { id, name }
      });
    }
  },
});
