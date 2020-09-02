const assert = require('assert');
const app = require('../../src/app');

describe('\'static-pages\' service', () => {
  it('registered the service', () => {
    const service = app.service('static-pages');

    assert.ok(service, 'Registered the service');
  });
});
