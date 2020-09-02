
const verifyHooks = require('feathers-authentication-management').hooks;
const accountService = require('../auth/notifier');
const { authenticate } = require('@feathersjs/authentication').hooks;
const {
  hashPassword, protect
} = require('@feathersjs/authentication-local').hooks;
const { iff, isProvider, preventChanges } = require('feathers-hooks-common');

const populate = require('feathers-populate-hook');


const { restrictUser } = require('../../middleware/auth');


const notify = context => {
  if (context.data) {
    if (context.data.firstTime) {
      accountService(context.app).notifier('resendVerifySignup', context.result);
    }
  }
}







module.exports = {
  before: {
    all: [],
    find: [authenticate(['jwt'])],
    get: [authenticate(['jwt'])],
    create: [
      hashPassword(),
      verifyHooks.addVerification()
    ],
    update: [hashPassword(),],
    patch: [iff(
      isProvider('external'),
      preventChanges(
        'email',
        'isVerified',
        'verifyToken',
        'verifyShortToken',
        'verifyExpires',
        'verifyChanges',
        'resetToken',
        'resetShortToken',
        'resetExpires'
      ),
      hashPassword(),
      authenticate(['jwt']),
    )],
    remove: []
  },

  after: {
    all: [protect('password')],
    find: [],
    get: [],
    create: [verifyHooks.removeVerification()],
    update: [],
    patch: [context => { notify(context) }],
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
