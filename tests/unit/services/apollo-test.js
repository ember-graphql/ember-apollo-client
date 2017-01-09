import { moduleFor, test } from 'ember-qunit';

let options;

moduleFor('service:apollo', 'Unit | Service | apollo', {
  beforeEach() {
    options = {
      apiURL: "https://test.example/graphql"
    }
  }
});

test('it exists', function(assert) {
  let service = this.subject({ options });
  assert.ok(service);
});
