const assert = require('assert');
const app = require('../../src/app');

describe('\'custom\' service', () => {
  it('registered the service', () => {
    const service = app.service('custom');

    assert.ok(service, 'Registered the service');
  });
});
