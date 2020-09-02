// Initializes the `property` service on path `/property`
const createService = require('feathers-mongoose');
const createModel = require('../../models/property.model');
const hooks = require('./property.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/property', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('property');

  service.hooks(hooks);
};
