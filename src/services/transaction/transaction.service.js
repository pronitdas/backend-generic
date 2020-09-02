// Initializes the `transaction` service on path `/transaction`
const createService = require('feathers-mongoose');
const createModel = require('../../models/transaction.model');
const hooks = require('./transaction.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    whitelist: ['$populate', '$regex'],
    paginate,
    multi: true
  };

  // Initialize our service with any options it requires
  app.use('/transaction', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('transaction');

  service.hooks(hooks);
};
