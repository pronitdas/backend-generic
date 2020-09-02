const assert = require('assert');
const app = require('../../src/app');

describe('\'bulk-upload\' service', () => {
  it('registered the service', () => {
    const service = app.service('bulk-upload');

    assert.ok(service, 'Registered the service');
  });
});
