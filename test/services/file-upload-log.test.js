const assert = require('assert');
const app = require('../../src/app');

describe('\'file-upload-log\' service', () => {
  it('registered the service', () => {
    const service = app.service('file-upload-log');

    assert.ok(service, 'Registered the service');
  });
});
