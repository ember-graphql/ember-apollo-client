import RSVP from 'rsvp';
import Pretender from 'pretender';
import { graphql } from 'graphql';
import {
  addMockFunctionsToSchema,
  addResolveFunctionsToSchema,
  makeExecutableSchema,
} from 'graphql-tools';
import schemaString from 'dummy/schema';

const interfaceResolveType = {
  __resolveType(data) {
    // Explicitly resolve the type of any interface type based on the
    // special attribute __typename, which should be provided in mocks of
    // these types. Otherwise fallback to the data.typename.name, which
    // comes from built-in mocks.
    return data.__typename || data.typename.name;
  },
};

const __resolveType = ({ type }) => type;

export default function startPretender() {
  let resolvers = {
    // This is where you would declare custom resolvers. For example, assume we
    // had a custom ID type:
    //
    // IDType: {
    //   __parseValue(value) {
    //     return value;
    //   },
    //   __serialize(value) {
    //     return value;
    //   },
    //   __parseLiteral(ast) {
    //     return ast.value;
    //   }
    // },

    // We set up __resolveType for this interface type here, then it is inherited
    // when we build the schema:
    SearchResult: { __resolveType },
  };
  let typeResolvers = {
    // This is where you can declare custom type resolvers, such as those
    // necessary to infer the specific object type of a union type.

    // We use this interface type in test mocks, need to teach Apollo Client how
    // to resolve its type:
    SearchResult: interfaceResolveType,
  };
  let mocks = {
    // This is where you tell graphql-tools how to generate a mock for a custom
    // scalar type:
    //
    // Time() {
    //   return moment().utc().format('YYYY-MM-DDTHH:mm:ss.SSSZ');
    // }

    Date() {
      return '2019-09-28';
    },
  };

  let schema = makeExecutableSchema({ typeDefs: schemaString, resolvers });
  addResolveFunctionsToSchema({
    schema,
    resolvers: typeResolvers,
    inheritResolversFromInterfaces: true,
  });
  addMockFunctionsToSchema({ schema, mocks, preserveResolvers: true });

  let pretender = new Pretender(function () {
    this.unhandledRequest = function (verb, path) {
      path = decodeURI(path);
      throw `Your Ember app tried to ${verb} '${path}', but there was no route defined to handle this request.`;
    };
  });

  // overriding fetch is required in order to make apollo-client work w/ pretender:
  // https://github.com/pretenderjs/pretender/issues/60
  // https://github.com/apollostack/apollo-client/issues/269
  pretender._ogFetch = window.fetch;
  window.fetch = fetch;

  pretender.originalShutdown = pretender.shutdown;
  pretender.shutdown = function () {
    window.fetch = pretender._ogFetch;
    pretender.originalShutdown(...arguments);
  };

  pretender.schema = schema;

  pretender.post('https://test.example/graphql', function (request) {
    let body = JSON.parse(request.requestBody);
    return new RSVP.Promise((resolve) => {
      graphql(schema, body.query, {}, {}, body.variables).then((result) => {
        if (result.errors && result.errors.length > 0) {
          console.log('ERROR:', result.errors[0]); // eslint-disable-line no-console
          debugger; // eslint-disable-line no-debugger
        }
        let resultStr = JSON.stringify(result);
        resolve([200, { 'content-type': 'application/javascript' }, resultStr]);
      });
    });
  });

  return pretender;
}
