import Ember from 'ember';
import ApolloMutationMixin from 'ember-apollo-client/mixins/apollo-mutation';
import { module, test } from 'qunit';

const {
  get,
  Object: EObject,
  RSVP: { Promise: EPromise },
} = Ember;

module('Unit | Mixin | apollo mutation');

// Replace this with your real tests.
test('it can be created', function(assert) {
  assert.expect(1);
  let ApolloMutationObject = EObject.extend(ApolloMutationMixin);
  let subject = ApolloMutationObject.create();
  assert.ok(subject);
});

test('it creates mutation methods', function(assert) {
  assert.expect(1);
  const apolloMock = {
    mutate: () => EPromise.resolve(),
  };

  let ApolloMutationObject = EObject.extend(ApolloMutationMixin, {
    apollo: apolloMock,
  });
  let subject = ApolloMutationObject.create({
    mutations: {
      createSomething: {
        mutation: 'Sum mutation doc',
      }
    }
  });
  assert.ok(subject.createSomething);
});

test('mutation methods call the mutate method of the service', function(assert) {
  assert.expect(1);
  const apolloMock = {
    mutate: () => {
      assert.ok(true);
      return EPromise.resolve();
    }
  };
  let ApolloMutationObject = EObject.extend(ApolloMutationMixin, {
    apollo: apolloMock,
  });
  let subject = ApolloMutationObject.create({
    mutations: {
      createSomething: {
        mutation: 'Sum mutation doc',
      }
    }
  });
  subject.createSomething();
});

test('it supports the loadingProperty option', function(assert) {
  assert.expect(2);
  const apolloMock = {
    mutate: () => new EPromise(res => {
      setTimeout(res, 100);
    })
  };
  let ApolloMutationObject = EObject.extend(ApolloMutationMixin, {
    apollo: apolloMock,
  });
  let subject = ApolloMutationObject.create({
    mutations: {
      createSomething: {
        mutation: 'This should be a gql-tagged document',
        loadingProperty: 'isCreatingSomething',
      }
    }
  });
  let promise = subject.createSomething();
  assert.equal(get(subject, 'isCreatingSomething'), 1);
  return promise.then(() => {
    assert.equal(get(subject, 'isCreatingSomething'), 0);
  })
});

test('it decrements the loadingProperty on mutation failures', function(assert) {
  assert.expect(2);
  const apolloMock = {
    mutate: () => new EPromise((res, rej) => {
      setTimeout(rej, 100);
    })
  };

  let ApolloMutationObject = EObject.extend(ApolloMutationMixin, {
    apollo: apolloMock,
  });
  let subject = ApolloMutationObject.create({
    mutations: {
      createSomething: {
        mutation: 'This should be a gql-tagged document',
        loadingProperty: 'isCreatingSomething',
      }
    }
  });
  let promise = subject.createSomething();
  assert.equal(get(subject, 'isCreatingSomething'), 1);
  return promise.catch(() => {
    assert.equal(get(subject, 'isCreatingSomething'), 0);
  });
});

test('it correctly merges variables', function(assert) {
  assert.expect(1);
  const apolloMock = {
    mutate(options) {
      assert.propEqual(options.variables, {
        color: `red`,
        id: 31,
      })
    },
  };

  let ApolloMutationObject = EObject.extend(ApolloMutationMixin, {
    apollo: apolloMock,
  });
  let subject = ApolloMutationObject.create({
    mutations: {
      updateColor: {
        mutation: 'This should be a gql-tagged document',
        variables: {
          color: `red`,
        },
      }
    }
  });
  subject.updateColor({ id: 31 });
});

test('it throws if there is already a property with the same key as the mutation', function(assert) {
  assert.expect(1);
  const apolloMock = {
    mutate: () => EPromise.resolve(),
  };
  let ApolloMutationObject = EObject.extend(ApolloMutationMixin, {
    apollo: apolloMock,
  });
  assert.throws(() => {
    ApolloMutationObject.create({
      mutations: {
        updateColor: {
          mutation: 'This should be a gql-tagged document',
        }
      },
      updateColor: true
    })
  });
});

test('it throws of there is already a property with the same key as a mutations loadingPropery', function(assert) {
  assert.expect(1);
  const apolloMock = {
    mutate: () => EPromise.resolve(),
  };
  let ApolloMutationObject = EObject.extend(ApolloMutationMixin, {
    apollo: apolloMock,
  });
  assert.throws(() => {
    ApolloMutationObject.create({
      mutations: {
        updateColor: {
          mutation: 'This should be a gql-tagged document',
          loadingProperty: 'isUpdatingColor',
        }
      },
      isUpdatingColor: true,
    })
  })
});