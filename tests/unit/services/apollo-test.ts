import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { computed } from '@ember-decorators/object';
import ApolloService from 'ember-apollo-client/services/apollo';
import testQuery from '../build/test-query';
import testMutation from '../build/test-mutation';
import { Promise } from 'rsvp';

module('Unit | Service | apollo', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let options = {
      apiURL: 'https://test.example/graphql',
    };
    let service = this.owner.factoryFor('service:apollo').create({ options });
    assert.ok(service);
  });

  test('it uses clientOptions', function(assert) {
    let customDataIdFromObject = o => o.name;
    this.owner.register(
      'service:overridden-apollo',
      class extends ApolloService {
        // Override the clientOptions.
        @computed
        get clientOptions() {
          let opts = this._super(...arguments);
          opts.dataIdFromObject = customDataIdFromObject;
          return opts;
        }
      }
    );
    let service = this.owner.lookup('service:overridden-apollo');

    // make sure the override was used.
    assert.equal(
      service.get('apollo.dataIdFromObject', customDataIdFromObject)
    );
  });

  test('.mutate resolves with __typename', async function(assert) {
    let done = assert.async();
    let service = this.owner.lookup('service:apollo');

    service.set('client', {
      mutate() {
        assert.ok(true, 'Called mutate function on apollo client');

        return new Promise(resolve => {
          resolve({ data: { human: { name: 'Link' }, __typename: 'person' } });
        });
      },
    });

    const result = await service.mutate({ mutation: testMutation });

    assert.equal(result.__typename, 'person');
    done();
  });

  test('.query resolves with __typename', async function(assert) {
    let done = assert.async();
    let service = this.owner.lookup('service:apollo');

    service.set('client', {
      query() {
        assert.ok(true, 'Called query function on apollo client');

        return new Promise(resolve => {
          resolve({ data: { human: { name: 'Link' }, __typename: 'person' } });
        });
      },
    });

    const result = await service.query({ query: testQuery });

    assert.equal(result.__typename, 'person');
    done();
  });

  test('.watchQuery with key', async function(assert) {
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
    assert.equal(result.get('name'), 'Link');
  });

  test('.watchQuery with key gracefully handles null', async function(assert) {
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
    assert.equal(result.get('name'), undefined);
  });
});
