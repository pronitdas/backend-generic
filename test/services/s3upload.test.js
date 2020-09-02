const assert = require('assert');
const app = require('../../src/app');

describe('\'s3upload\' service', () => {
  it('registered the service', () => {
    const service = app.service('ups3');

    assert.ok(service, 'Registered the service');
  });
});
