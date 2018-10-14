import ApolloService from 'ember-apollo-client/services/apollo';
import { computed } from '@ember-decorators/object';
import {
  InMemoryCache,
  IntrospectionFragmentMatcher,
} from 'apollo-cache-inmemory';
import TypeIntrospectionQuery from 'dummy/utils/graphql-type-query';

export default class extends ApolloService {
  @computed
  get cache() {
    return new InMemoryCache({
      fragmentMatcher: new IntrospectionFragmentMatcher({
        introspectionQueryResultData: TypeIntrospectionQuery,
      }),
    });
  }
}
