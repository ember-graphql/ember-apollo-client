import Ember from 'ember';
import Pretender from 'pretender';
import graphqlPackage from 'npm:graphql';
import graphqlTools from 'npm:graphql-tools';
import schemaString from '../fixtures/test-schema.graphql';

const { graphql } = graphqlPackage;
const { addMockFunctionsToSchema, makeExecutableSchema } = graphqlTools;
const { RSVP } = Ember;

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
  };
  let mocks = {
    // This is where you tell graphql-tools how to generate a mock for a custom
    // scalar type:
    //
    // Time() {
    //   return moment().utc().format('YYYY-MM-DDTHH:mm:ss.SSSZ');
    // }
  };

  let schema = makeExecutableSchema({ typeDefs: schemaString, resolvers });
  addMockFunctionsToSchema({ schema, mocks });

  let pretender = new Pretender(function() {
    this.unhandledRequest = function(verb, path) {
      path = decodeURI(path);
      throw `Your Ember app tried to ${verb} '${path}', but there was no route defined to handle this request.`;
    };
  });

  pretender.schema = schema;

  pretender.post('https://test.example/graphql', function(request) {
    let body = JSON.parse(request.requestBody);
    return new RSVP.Promise((resolve) => {
      graphql(schema, body.query, {}, {}, body.variables).then((result) => {
        let resultStr = JSON.stringify(result);
        resolve([200, { 'content-type': 'application/javascript' }, resultStr]);
      });
    });
  });

  return pretender;
}
