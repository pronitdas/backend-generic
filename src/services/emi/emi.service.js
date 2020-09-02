// Initializes the `emi` service on path `/emi`
const createService = require('feathers-mongoose');
const createModel = require('../../models/emi.model');
const hooks = require('./emi.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/emi', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('emi');

  service.hooks(hooks);
};
