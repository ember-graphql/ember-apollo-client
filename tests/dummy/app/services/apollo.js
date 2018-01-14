import ApolloService from "ember-apollo-client/services/apollo";
import { computed } from "@ember/object";
import { merge } from "@ember/polyfills";
import { IntrospectionFragmentMatcher } from "apollo-client";
import TypeIntrospectionQuery from "dummy/utils/graphql-type-query";

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
