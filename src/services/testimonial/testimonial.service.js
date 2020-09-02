// Initializes the `testimonial` service on path `/testimonial`
const createService = require('feathers-mongoose');
const createModel = require('../../models/testimonial.model');
const hooks = require('./testimonial.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/testimonial', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('testimonial');

  service.hooks(hooks);
};
