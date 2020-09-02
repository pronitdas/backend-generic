const assert = require('assert');
const app = require('../../src/app');

describe('\'company\' service', () => {
  it('registered the service', () => {
    const service = app.service('company');

    assert.ok(service, 'Registered the service');
  });
});
