const assert = require('assert');
const app = require('../../src/app');

describe('\'mailinglist\' service', () => {
  it('registered the service', () => {
    const service = app.service('mailinglist');

    assert.ok(service, 'Registered the service');
  });
});
