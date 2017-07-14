import copy from 'ember-apollo-client/utils/copy';
import { module, test } from 'qunit';

module('Unit | Utility | copy');

test('it can copy graphql properties that are prefixed with __', function (assert) {
  const object = { __typename: 'Person' };
  const copiedObject = copy(object);
  assert.deepEqual(copiedObject, object)
});

test('it can copy graphql properties that are prefixed with __ in nested structures', function (assert) {
  const object = {
    __typename: 'Person',
    car: {
      __typename: 'Car',
      producer: {
        __typename: 'Producer'
      }
    }
  };
  const copiedObject = copy(object);
  assert.deepEqual(copiedObject, object);
});

test('it can copy graphql properties of objects with arrays', function (assert) {
  const object = {
    __typename: 'Person',
    cars: [
      {
        __typename: `Car`,
      },
      {
        __typename: `Car`,
      },
      {
        __typename: `Car`,
      }
    ]
  };
  const copiedObject = copy(object);
  assert.deepEqual(copiedObject, object);
});
