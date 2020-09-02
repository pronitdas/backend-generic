// Initializes the `borrower` service on path `/borrower`
const createService = require('feathers-mongoose');
const createModel = require('../../models/borrower.model');
const hooks = require('./borrower.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/borrower', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('borrower');

  service.hooks(hooks);
};
