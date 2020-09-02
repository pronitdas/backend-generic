const assert = require('assert');
const app = require('../../src/app');

describe('\'testimonial\' service', () => {
  it('registered the service', () => {
    const service = app.service('testimonial');

    assert.ok(service, 'Registered the service');
  });
});
