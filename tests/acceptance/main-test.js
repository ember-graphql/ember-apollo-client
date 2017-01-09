import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';
import graphqlTools from 'npm:graphql-tools';

const { addResolveFunctionsToSchema } = graphqlTools;

moduleForAcceptance('Acceptance | main');

test('visiting /', function(assert) {
  let done = assert.async();

  let mockHuman = {
    id: '1000',
    name: 'Luke Skywalker'
  };
  addResolveFunctionsToSchema(this.pretender.schema, {
    Query: {
      human(obj, args) {
        assert.deepEqual(args, { id: '1000' });
        return mockHuman;
      }
    }
  });

  visit('/');

  andThen(function() {
    assert.equal(currentURL(), '/');
    assert.equal(find('.model-name').text(), 'Luke Skywalker');
    done();
  });
});
