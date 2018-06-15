import { module, test } from 'qunit';
import { setupApplicationTest } from "dummy/tests/helpers/setup";
import { addResolveFunctionsToSchema } from 'graphql-tools';
import { click, currentURL, find, visit } from "@ember/test-helpers";

const mockHuman = {
  id: '1000',
  name: 'Anakin Skywalker',
  __typename: 'Human',
};

module('Acceptance | watch query', function(hooks) {
  setupApplicationTest(hooks);

  let schema;

  hooks.beforeEach(function() {
    schema = this.pretender.schema;
  });

  test('visiting /anakin', async function(assert) {
    let done = assert.async();
    let character = Object.assign({}, mockHuman);
    let resolvers = {
      Query: {
        human(obj, args) {
          assert.deepEqual(args, { id: '1000' });
          return Object.assign({}, character);
        },
      },
      Mutation: {
        changeCharacterName(_, { id, name }) {
          assert.equal(id, mockHuman.id, 'correct mutuation id is passed in');
          assert.equal(name, 'Darth Vader', 'correct mutuation name is passed in');
          return Object.assign({}, character, { name });
        }
      },
      Character: {
        __resolveType(obj) {
          // Character interface needs to resolve to a specific type
          // so it's just pulled from the object's type that was queried
          return obj.__typename;
        }
      }
    };

    addResolveFunctionsToSchema({ schema, resolvers });

    await visit('/anakin');
    assert.equal(currentURL(), '/anakin');

    assert.equal(find('.model-name').innerText, 'Anakin Skywalker', 'has correct name from initial query');
    await click('.change-name');
    assert.equal(find('.model-name').innerText, 'Darth Vader', 'has updated name from mutation and watch query');
    done();
  });
});
