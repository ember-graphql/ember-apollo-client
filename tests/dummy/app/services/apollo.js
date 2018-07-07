import ApolloService from 'ember-apollo-client/services/apollo';
import { computed } from '@ember/object';
import {
  InMemoryCache,
  IntrospectionFragmentMatcher,
} from 'apollo-cache-inmemory';
import TypeIntrospectionQuery from 'dummy/utils/graphql-type-query';

export default ApolloService.extend({
  cache: computed(function() {
    return new InMemoryCache({
      fragmentMatcher: new IntrospectionFragmentMatcher({
        introspectionQueryResultData: TypeIntrospectionQuery,
      }),
    });
  }),
});
