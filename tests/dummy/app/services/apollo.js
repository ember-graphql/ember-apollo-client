import ApolloService from 'ember-apollo-client/services/apollo';
import {
  InMemoryCache,
  IntrospectionFragmentMatcher,
} from '@apollo/client/core';
import TypeIntrospectionQuery from 'dummy/utils/graphql-type-query';

export default class CustomApollo extends ApolloService {
  cache() {
    return new InMemoryCache({
      // freezeResults: true,
      fragmentMatcher: new IntrospectionFragmentMatcher({
        introspectionQueryResultData: TypeIntrospectionQuery,
      }),
    });
  }
}
