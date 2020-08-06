import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import ApolloService, {
  unsubscribe,
  getObservable,
  ApolloErrorWithResponse,
} from 'ember-apollo-client/services/apollo';
import testQuery from '../build/test-query';
import testMutation from '../build/test-mutation';
import testSubscription from '../build/test-subscription';
import { Promise } from 'rsvp';
import { addListener, removeListener } from '@ember/object/events';

let fakeLink = () => {};

class OverriddenApollo extends ApolloService {
  clientOptions() {
    let opts = super.clientOptions();
    return { ...opts, link: fakeLink };
  }
}

module('Unit | Service | apollo', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let service = this.owner.lookup('service:apollo');
    assert.ok(service);
  });

  test('it uses clientOptions', function (assert) {
    this.owner.register('service:overridden-apollo', OverriddenApollo);
    let service = this.owner.lookup('service:overridden-apollo');

    // make sure the override was used.
    assert.equal(service.client.link, fakeLink);
  });

  test('.mutate resolves with __typename', async function (assert) {
    let service = this.owner.lookup('service:apollo');

    service.set('client', {
      mutate() {
        assert.ok(true, 'Called mutate function on apollo client');

        return new Promise((resolve) => {
          resolve({ data: { human: { name: 'Link' }, __typename: 'person' } });
        });
      },
    });

    const result = await service.mutate({ mutation: testMutation });

    assert.equal(result.__typename, 'person');
  });

  test('.query resolves with __typename', async function (assert) {
    let service = this.owner.lookup('service:apollo');

    service.set('client', {
      query() {
        assert.ok(true, 'Called query function on apollo client');

        return new Promise((resolve) => {
          resolve({ data: { human: { name: 'Link' }, __typename: 'person' } });
        });
      },
    });

    const result = await service.query({ query: testQuery });

    assert.equal(result.__typename, 'person');
  });

  test('.watchQuery with key', async function (assert) {
    let service = this.owner.lookup('service:apollo');

    service.set('client', {
      watchQuery() {
        assert.ok(true, 'Called watchQuery function on apollo client');

        return {
          subscribe({ next }) {
            next({ data: { human: { name: 'Link' }, __typename: 'person' } });
          },
        };
      },
    });

    const result = await service.watchQuery({ query: testQuery }, 'human');
    assert.equal(result.name, 'Link');
  });

  test('.watchQuery with key gracefully handles null', async function (assert) {
    let service = this.owner.lookup('service:apollo');

    service.set('client', {
      watchQuery() {
        return {
          subscribe({ next }) {
            next({ data: null });
          },
        };
      },
    });

    const result = await service.watchQuery({ query: testQuery }, 'human');
    assert.equal(result.name, undefined);
  });

  test('.subscribe with key', async function (assert) {
    let service = this.owner.lookup('service:apollo');
    let nextFunction = null;

    service.set('client', {
      subscribe() {
        assert.ok(true, 'Called subscribe function on apollo client');

        return {
          subscribe({ next }) {
            nextFunction = next;
          },
        };
      },
    });

    const result = await service.subscribe(
      {
        subscription: testSubscription,
      },
      'human'
    );

    const names = [];
    const handleEvent = (event) => {
      names.push(event.name);
    };

    addListener(result, 'event', handleEvent);

    // Things initialize as empty
    assert.equal(result.lastEvent, null);

    // Two updates come in
    nextFunction({ data: { human: { name: '1 Link' }, __typename: 'person' } });
    nextFunction({ data: { human: { name: '2 Luke' }, __typename: 'person' } });

    // Events are in the correct order
    assert.equal(result.lastEvent.name, '2 Luke');
    // Event streams are in the correct order
    assert.equal(names.join(' '), '1 Link 2 Luke');

    nextFunction({ data: { human: { name: '3 Greg' }, __typename: 'person' } });
    // Stream null
    nextFunction({ loading: true });
    nextFunction({ loading: true, data: null });
    // Still have last event
    assert.equal(result.lastEvent.name, '3 Greg');
    assert.equal(names.join(' '), '1 Link 2 Luke 3 Greg');
    removeListener(result, 'event', handleEvent);
  });

  test('tests should wait for response', async function (assert) {
    let service = this.owner.lookup('service:apollo');

    service.set('client', {
      query() {
        assert.ok(true, 'Called query function on apollo client');

        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              data: { human: { name: 'Link' }, __typename: 'person' },
            });
          }, 300);
        });
      },
    });

    const result = await service.query({ query: testQuery });

    assert.equal(result.__typename, 'person');
  });

  test('unsubscribe works from a watched query', async function (assert) {
    let service = this.owner.lookup('service:apollo');
    assert.expect(1);

    service.set('client', {
      watchQuery() {
        return {
          subscribe({ next }) {
            next({ data: { human: { name: 'Link' }, __typename: 'person' } });
            return {
              unsubscribe: () => {
                assert.ok('Unsbuscribe was called');
              },
            };
          },
        };
      },
    });

    const result = await service.watchQuery({ query: testQuery }, 'human');
    unsubscribe(result);
  });

  test('getObservable works from a watched query', async function (assert) {
    let service = this.owner.lookup('service:apollo');
    assert.expect(1);

    service.set('client', {
      watchQuery() {
        return {
          subscribe({ next }) {
            next({ data: { human: { name: 'Link' }, __typename: 'person' } });
          },
        };
      },
    });

    const result = await service.watchQuery({ query: testQuery }, 'human');
    assert.ok(getObservable(result));
  });

  module('.query errors', function () {
    test('it handles errors with default errorPolicy', async function (assert) {
      let service = this.owner.lookup('service:apollo');

      service.set('client', {
        query() {
          assert.step('Called query function on apollo client');

          return new Promise((resolve, reject) => {
            reject('Test error');
          });
        },
      });

      try {
        await service.query({ query: testQuery });
      } catch (error) {
        assert.step('.query rejects');
        assert.equal(error, 'Test error', 'an error is thrown');
      }

      assert.verifySteps([
        'Called query function on apollo client',
        '.query rejects',
      ]);
    });

    test('it works with errorPolicy="all" without resultKey', async function (assert) {
      let service = this.owner.lookup('service:apollo');

      service.set('client', {
        query() {
          assert.step('Called query function on apollo client');

          return new Promise((resolve) => {
            resolve({
              data: { human: { name: 'Anne' } },
              errors: ['Test error #1', 'Test error #2'],
            });
          });
        },
      });

      try {
        await service.query({ query: testQuery, errorPolicy: 'all' });
      } catch (error) {
        assert.step('.query rejects');
        assert.ok(
          error instanceof ApolloErrorWithResponse,
          'error is of type ApolloErrorWithResponse'
        );
        assert.deepEqual(
          error.errors,
          ['Test error #1', 'Test error #2'],
          'errors are correct'
        );
        assert.deepEqual(
          error.response,
          { human: { name: 'Anne' } },
          'response is correct'
        );
      }

      assert.verifySteps([
        'Called query function on apollo client',
        '.query rejects',
      ]);
    });

    test('it works with errorPolicy="all" with resultKey', async function (assert) {
      let service = this.owner.lookup('service:apollo');

      service.set('client', {
        query() {
          assert.step('Called query function on apollo client');

          return new Promise((resolve) => {
            resolve({
              data: { human: { name: 'Anne' } },
              errors: ['Test error #1', 'Test error #2'],
            });
          });
        },
      });

      try {
        await service.query({ query: testQuery, errorPolicy: 'all' }, 'human');
      } catch (error) {
        assert.step('.query rejects');
        assert.ok(
          error instanceof ApolloErrorWithResponse,
          'error is of type ApolloErrorWithResponse'
        );
        assert.deepEqual(
          error.errors,
          ['Test error #1', 'Test error #2'],
          'errors are correct'
        );
        assert.deepEqual(
          error.response,
          { name: 'Anne' },
          'response is correct'
        );
      }

      assert.verifySteps([
        'Called query function on apollo client',
        '.query rejects',
      ]);
    });

    test('it works with errorPolicy="all" with resultKey and without data', async function (assert) {
      let service = this.owner.lookup('service:apollo');

      service.set('client', {
        query() {
          assert.step('Called query function on apollo client');

          return new Promise((resolve) => {
            resolve({
              data: null,
              errors: ['Test error #1', 'Test error #2'],
            });
          });
        },
      });

      try {
        await service.query({ query: testQuery, errorPolicy: 'all' }, 'human');
      } catch (error) {
        assert.step('.query rejects');
        assert.ok(
          error instanceof ApolloErrorWithResponse,
          'error is of type ApolloErrorWithResponse'
        );
        assert.deepEqual(
          error.errors,
          ['Test error #1', 'Test error #2'],
          'errors are correct'
        );
        assert.deepEqual(error.response, null, 'response is correct');
      }

      assert.verifySteps([
        'Called query function on apollo client',
        '.query rejects',
      ]);
    });
  });
});
