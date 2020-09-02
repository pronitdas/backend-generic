// Initializes the `custom` service on path `/custom`
const createService = require('./custom.class.js');
const hooks = require('./custom.hooks');

module.exports = function (app) {
  
  const paginate = app.get('paginate');

  const options = {
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/custom', createService(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('custom');

  service.hooks(hooks);
};
