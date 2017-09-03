import ApolloService from "ember-apollo-client/services/apollo";
import Ember from "ember";
import { IntrospectionFragmentMatcher } from "apollo-client";
import TypeIntrospectionQuery from "dummy/utils/graphql-type-query";

const { computed, merge } = Ember;

export default ApolloService.extend({
  clientOptions: computed(function() {
    let opts = this._super(...arguments);
    return merge(opts, {
      fragmentMatcher: new IntrospectionFragmentMatcher({
        introspectionQueryResultData: TypeIntrospectionQuery,
      }),
    });
  }),
});
