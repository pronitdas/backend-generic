const assert = require('assert');
const app = require('../../src/app');

describe('\'inquiry\' service', () => {
  it('registered the service', () => {
    const service = app.service('inquiry');

    assert.ok(service, 'Registered the service');
  });
});
