import { unsubscribe } from 'ember-apollo-client';
import { module, test } from 'qunit';

module('Unit | unsubscribe', function() {
  test('it should call the unsubscribe function', function(assert) {
    assert.expect(1);

    let mockUnsubscribe = () => {
      assert.ok('should have been called');
    };
    let resultObject = {
      _apolloUnsubscribe: mockUnsubscribe,
    };

    unsubscribe(resultObject);
  });
});
