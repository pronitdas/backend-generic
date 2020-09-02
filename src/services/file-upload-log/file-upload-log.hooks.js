const { authenticate } = require('@feathersjs/authentication').hooks;
const populate = require('../../hooks/populate')



module.exports = {
  before: {
    all: [ authenticate('jwt') ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [populate({
      'bulkUploadID': {
        service: 'bulk-upload',
        f_key: '_id'
      }})],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
