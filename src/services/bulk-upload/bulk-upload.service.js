// Initializes the `bulk-upload` service on path `/bulk-upload`
const createService = require('feathers-mongoose');
const createModel = require('../../models/bulk-upload.model');
const hooks = require('./bulk-upload.hooks');



module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/bulk-upload', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('bulk-upload');

  service.hooks(hooks);
};
