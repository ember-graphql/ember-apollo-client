import { module, test } from 'qunit';
import { setupApplicationTest } from 'dummy/tests/helpers/setup';
import { addResolveFunctionsToSchema } from 'graphql-tools';
import { click, currentURL, find, visit } from '@ember/test-helpers';

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

  test('visiting /anakin with delayed response', async function(assert) {
    let character = Object.assign({}, mockHuman);
    let resolvers = {
      Query: {
        human(obj, args) {
          assert.deepEqual(args, { id: '1000' });

          return new Promise(resolve => {
            setTimeout(() => {
              resolve(character);
            }, 200);
          });
        },
      },
      Mutation: {
        changeCharacterName(_, { id, name }) {
          assert.equal(id, mockHuman.id, 'correct mutation id is passed in');
          assert.equal(
            name,
            'Darth Vader',
            'correct mutation name is passed in'
          );
          return Object.assign({}, character, { name });
        },
      },
      Character: {
        __resolveType(obj) {
          // Character interface needs to resolve to a specific type
          // so it's just pulled from the object's type that was queried
          return obj.__typename;
        },
      },
    };

    addResolveFunctionsToSchema({ schema, resolvers });

    await visit('/anakin');
    assert.equal(currentURL(), '/anakin');

    assert.equal(
      find('.model-name').innerText,
      'Anakin Skywalker',
      'has correct name from initial query'
    );
    await click('.change-name');
    assert.equal(
      find('.model-name').innerText,
      'Darth Vader',
      'has updated name from mutation and watch query'
    );
  });

  test('refetching should update data and should wait', async function(assert) {
    let isRefetch = false;
    let character = Object.assign({}, mockHuman);
    let resolvers = {
      Query: {
        human(obj, args) {
          assert.deepEqual(args, { id: '1000' });

          if (isRefetch) {
            return new Promise(resolve => {
              setTimeout(() => {
                resolve(
                  Object.assign({}, character, { name: 'Anakin Skywalker 2' })
                );
              }, 200);
            });
          }

          return Promise.resolve(character);
        },
      },
      Character: {
        __resolveType(obj) {
          return obj.__typename;
        },
      },
    };

    addResolveFunctionsToSchema({ schema, resolvers });

    await visit('/anakin');
    assert.equal(currentURL(), '/anakin');

    assert.equal(
      find('.model-name').innerText,
      'Anakin Skywalker',
      'has correct name from initial query'
    );

    isRefetch = true;
    await click('.refetch-data');

    assert.equal(
      find('.model-name').innerText,
      'Anakin Skywalker 2',
      'has refetched name'
    );
  });
});
