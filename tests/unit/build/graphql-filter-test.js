import { module, test } from 'qunit';
import gql from 'graphql-tag';

import testFragment from './test-fragment';
import testQuery from './test-query';

module('Unit | graphql-filter', function() {
  test('simple compilation', function(assert) {
    assert.deepEqual(testFragment.definitions, gql`
      fragment testFragment on Object {
        name
      }
    `.definitions);
  });

  test('compilation with #import references', function(assert) {
    assert.deepEqual(testQuery.definitions, gql`
      query TestQuery {
        subject {
          ...testFragment
        }
      }

      fragment testFragment on Object {
        name
      }
    `.definitions);
  });
});