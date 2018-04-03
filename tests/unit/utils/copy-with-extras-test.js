import copyWithExtras from 'ember-apollo-client/utils/copy-with-extras';
import { module, test } from 'qunit';

module('Unit | Utility | copyWithExtras', function() {
  test('copies all properties and extraCopyProperties', function(assert) {
    const toCopy = {
      foo: 'bar',
      hamsters: ['Tomster', 'Zoey'],
      people: [
        { name: 'Link', __typename: 'hero' },
        { name: 'Zelda', __typename: 'princess' }
      ],
      bestDay: new Date(2018, 3, 3),
      todoCount: 4,
      __typename: 'testData'
    };

    let result = copyWithExtras(toCopy, [], []);

    assert.deepEqual(result, toCopy);
  });

  test('does not copy attributes prefixed with __ unless in extraCopyProperties', function(assert) {
    const toCopy = {
      __typename: 'test',
      __otherAttribute: 'notATest'
    };

    let result = copyWithExtras(toCopy, [], []);

    assert.equal(result.__typename, 'test');
    assert.equal(result.__otherAttribute, undefined);
  });
});
