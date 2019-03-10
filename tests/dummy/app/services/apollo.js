import ApolloService from 'ember-apollo-client/services/apollo';
import {
  InMemoryCache,
  IntrospectionFragmentMatcher,
} from 'apollo-cache-inmemory';
import TypeIntrospectionQuery from 'dummy/utils/graphql-type-query';

export default class CustomApollo extends ApolloService {
  cache() {
    return new InMemoryCache({
      fragmentMatcher: new IntrospectionFragmentMatcher({
        introspectionQueryResultData: TypeIntrospectionQuery,
      }),
    });
  }
}
