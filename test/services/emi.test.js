const assert = require('assert');
const app = require('../../src/app');

describe('\'emi\' service', () => {
  it('registered the service', () => {
    const service = app.service('emi');

    assert.ok(service, 'Registered the service');
  });
});
