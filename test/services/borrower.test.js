const assert = require('assert');
const app = require('../../src/app');

describe('\'borrower\' service', () => {
  it('registered the service', () => {
    const service = app.service('borrower');

    assert.ok(service, 'Registered the service');
  });
});
