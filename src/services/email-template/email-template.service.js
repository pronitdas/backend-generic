// Initializes the `email-template` service on path `/email-template`
const createService = require('feathers-mongoose');
const createModel = require('../../models/email-template.model');
const hooks = require('./email-template.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/email-template', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('email-template');

  service.hooks(hooks);
};
