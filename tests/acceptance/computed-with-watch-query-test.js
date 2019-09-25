import { module, test } from 'qunit';
import { setupApplicationTest } from 'dummy/tests/helpers/setup';
import { addResolveFunctionsToSchema } from 'graphql-tools';
import { click, find, visit } from '@ember/test-helpers';

module('Acceptance | computed with watch query', function(hooks) {
  setupApplicationTest(hooks);

  const mockHuman = {
    id: '1000',
    name: 'Luke Skywalker',
    __typename: 'Human',
  };
  let schema;

  hooks.beforeEach(function() {
    schema = this.pretender.schema;
  });

  test('visiting /characters', async function(assert) {
    let resolvers = {
      Query: {
        characters(obj, args) {
          assert.deepEqual(args, { kind: 'human' });
          return [mockHuman];
        },
      },
    };
    addResolveFunctionsToSchema({ schema, resolvers });

    await visit('/characters?kind=human');

    assert.equal(find('.model-name').innerText, 'Luke Skywalker');
    assert.equal(find('.computed-value').innerText, 'LUKE SKYWALKER_computed');
    assert.equal(find('.model-typename').innerText, 'Human');

    mockHuman.name = 'updated name';

    await click('.refetch-data');

    assert.equal(find('.model-name').innerText, 'updated name');
    assert.equal(find('.computed-value').innerText, 'UPDATED NAME_computed');
  });
});
