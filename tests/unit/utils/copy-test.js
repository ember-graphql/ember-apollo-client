import copy from 'ember-apollo-client/utils/copy';
import { module, test } from 'qunit';

module('Unit | Utility | copy');

test('it can copy graphql properties that are prefixed with __', function (assert) {
  const input = { 
    __typename: 'Person',
    name: 'Sven'
  };
  const expected = {
    __typename: 'Person',
    name: 'Sven'
  }
  const copiedObject = copy(input);
  assert.deepEqual(copiedObject, expected)
});

test('it can copy graphql properties that are prefixed with __ in nested structures', function (assert) {
  const input = {
    __typename: 'Person',
    age: 30,
    car: {
      __typename: 'Car',
      producer: {
        __typename: 'Producer',
        country: 'DE'
      }
    }
  }
  const expected = {
    __typename: 'Person',
    age: 30,
    car: {
      __typename: 'Car',
      producer: {
        __typename: 'Producer',
        country: 'DE'
      }
    }
  };
  const copiedObject = copy(input);
  assert.deepEqual(copiedObject, expected);
});

test('it can copy graphql properties of objects with arrays', function (assert) {
  const input = {
    __typename: 'Person',
    cars: [
      {
        __typename: `Car`,
        doorCount: 4,
      },
      {
        __typename: `Car`,
        doorCount: 4,
      },
      {
        __typename: `Car`,
        doorCount: 2,
      }
    ]
  };
  const expected = {
    __typename: 'Person',
    cars: [
      {
        __typename: `Car`,
        doorCount: 4,
      },
      {
        __typename: `Car`,
        doorCount: 4,
      },
      {
        __typename: `Car`,
        doorCount: 2,
      }
    ]
  };
  const copiedObject = copy(input);
  assert.deepEqual(copiedObject, expected);
});
