import EmberObject from '@ember/object';
import { queryManager, QueryManager } from 'ember-apollo-client';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import ApolloService from 'ember-apollo-client/services/apollo';
import { gte } from 'ember-compatibility-helpers';

class OverriddenApollo extends ApolloService {}

let TestObject;

module('Unit | queryManager | macro - decorator', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.owner.register('service:overridden-apollo', OverriddenApollo);

    this.subject = function () {
      this.owner.register('test-container:test-object', TestObject);
      return this.owner.lookup('test-container:test-object');
    };
  });

  test('it works in a regular ember object', function (assert) {
    TestObject = EmberObject.extend({
      apollo: queryManager({ service: 'overridden-apollo' }),
    });

    let subject = this.subject();
    assert.ok(subject.apollo, 'should create a apollo property');
    assert.ok(
      subject.apollo instanceof QueryManager,
      'it should be an instance of the query manager'
    );
    assert.ok(
      subject.apollo.apollo instanceof OverriddenApollo,
      'the apollo service should be an instance of the overridden apollo service'
    );
  });

  if (gte('3.10.0')) {
    test('it works using decorator syntax without options', function (assert) {
      TestObject = class MyTestClassObject extends EmberObject {
        @queryManager apollo;
      };

      let subject = this.subject();
      assert.ok(subject.apollo, 'should create a apollo property');
      assert.ok(
        subject.apollo instanceof QueryManager,
        'it should be an instance of the query manager'
      );
      assert.ok(
        subject.apollo.apollo instanceof ApolloService,
        'it should be an instance of the apollo service'
      );
    });

    test('it works using decorator syntax with options', function (assert) {
      TestObject = class MyTestClassObject extends EmberObject {
        @queryManager({ service: 'overridden-apollo' }) apollo;
      };

      let subject = this.subject();
      assert.ok(subject.apollo, 'should create a apollo property');
      assert.ok(
        subject.apollo instanceof QueryManager,
        'it should be an instance of the query manager'
      );
      assert.ok(
        subject.apollo.apollo instanceof OverriddenApollo,
        'the apollo service should be an instance of the overridden apollo service'
      );
    });

    test('it works using the `defaultQueryManagerService` environment option', function (assert) {
      const config = this.owner.resolveRegistration('config:environment');

      config.apollo.defaultQueryManagerService = 'overridden-apollo';

      TestObject = class MyTestClassObject extends EmberObject {
        @queryManager apollo;
      };

      let subject = this.subject();

      assert.ok(subject.apollo, 'should create an apollo property');

      assert.true(
        subject.apollo instanceof QueryManager,
        'it should be an instance of the query manager'
      );

      assert.true(
        subject.apollo.apollo instanceof OverriddenApollo,
        'the apollo service should be an instance of the overridden apollo service'
      );

      delete config.apollo.defaultQueryManagerService;
    });
  }
});
