// Initializes the `static-pages` service on path `/static-pages`
const createService = require('feathers-mongoose');
const createModel = require('../../models/static-pages.model');
const hooks = require('./static-pages.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/static-pages', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('static-pages');

  service.hooks(hooks);
};
