const populate = require('feathers-populate-hook');


module.exports = {
  before: {
    all: [populate.compatibility()],
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
      'associates': { // Destination key
        service: 'borrower', // Foreign service
        f_key: '_id',  // Foreign key
      }
    })],
    get: [populate({
      'associates': { // Destination key
        service: 'borrower', // Foreign service
        f_key: '_id',  // Foreign key
      }
    })],
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
