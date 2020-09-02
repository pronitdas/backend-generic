// Initializes the `user` service on path `/user`
const createService = require('feathers-mongoose');
const createModel = require('../../models/user.model');
const hooks = require('./user.hooks');

module.exports = function(app) {
    const Model = createModel(app);
    const paginate = app.get('paginate');

    const options = {
        Model,
        paginate
    };

    // console.log(Model)

    // const historyOptions = {
    //   ,
    //   paginate
    // };
    // Initialize our service with any options it requires
    app.use('/users', createService(options));

    // Get our initialized service so that we can register hooks
    const service = app.service('users');
    service.hooks(hooks);
};