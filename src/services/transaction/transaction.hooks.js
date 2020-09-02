const populate = require('../../hooks/populate')
const hooks = require('feathers-authentication-hooks');
const { authenticate, } = require('@feathersjs/authentication').hooks;


const ObjectId = require('mongodb').ObjectID;

const updateReferences = (context) => {

  if (context.data) {
    if (context.data.property) {
      context.data.property = ObjectId(context.data.property);
    }

    if (context.data.company) {
      context.data.company = ObjectId(context.data.company);
    }
    if (context.data.borrower) {
      context.data.borrower = ObjectId(context.data.borrower);
    }
  }

  if (context.query) {
    // context.data.lender = ObjectId(context.query.lender);
  }

  return context;
};


const filteredReferences = (context) => {
  populate({
    'borrower': {
      service: 'borrower',
      f_key: '_id'
    },
    'company': {
      service: 'company',
      f_key: '_id'
    },
    'property': {
      service: 'property',
      f_key: '_id',  // Foreign key
    }
  });
  // return context;
};





module.exports = {
  before: {
    all: [],
    find: [(context) => updateReferences(context)],
    get: [],
    create: [authenticate('jwt'), hooks.associateCurrentUser({ idField: '_id', as: 'lender' }), (context) => updateReferences(context)],
    update: [authenticate('jwt'), (context) => updateReferences(context)],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [populate({
      'borrower': {
        service: 'borrower',
        f_key: '_id'
      },
      'company': {
        service: 'company',
        f_key: '_id'
      },
      'property': {
        service: 'property',
        f_key: '_id',  // Foreign key
      }
    })],
    get: [populate({
      'borrower': {
        service: 'borrower',
        f_key: '_id'
      },
      'company': {
        service: 'company',
        f_key: '_id'
      },
      'property': {
        service: 'property',
        f_key: '_id',  // Foreign key
      }
    })],
    create: [populate({
      'borrower': {
        service: 'borrower',
        f_key: '_id'
      },
      'company': {
        service: 'company',
        f_key: '_id'
      },
      'property': {
        service: 'property',
        f_key: '_id',  // Foreign key
      }
    })],
    update: [],
    patch: [populate({
      'borrower': {
        service: 'borrower',
        f_key: '_id'
      },
      'company': {
        service: 'company',
        f_key: '_id'
      },
      'property': {
        service: 'property',
        f_key: '_id',  // Foreign key
      }
    })],
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
