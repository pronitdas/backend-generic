// Initializes the `mailinglist` service on path `/mailinglist`
const createService = require('feathers-mongoose');
const createModel = require('../../models/mailinglist.model');
const hooks = require('./mailinglist.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/mailinglist', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('mailinglist');

  service.hooks(hooks);
};
