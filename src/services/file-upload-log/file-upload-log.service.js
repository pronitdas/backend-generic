// Initializes the `file-upload-log` service on path `/file-upload-log`
const createService = require('feathers-mongoose');
const createModel = require('../../models/file-upload-log.model');
const hooks = require('./file-upload-log.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/file-upload-log', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('file-upload-log');

  service.hooks(hooks);
};
