
const verifyHooks = require('feathers-authentication-management').hooks;
const accountService = require('../auth/notifier');
const { authenticate, } = require('@feathersjs/authentication').hooks;
const hooks = require('feathers-authentication-hooks');
const populate = require('feathers-populate-hook');
const ObjectId = require('mongodb').ObjectID;
const filter = require('lodash').filter
const startCase = require('lodash').startCase
const generalTemplate = require('../../utilities/mail-generator.js')


const {
  hashPassword, protect, 
} = require('@feathersjs/authentication-local').hooks;
const { iff, isProvider, preventChanges } = require('feathers-hooks-common');



const mailer = (app, email, cb)=>{

  app.service('mailer').create(email).then(function (result) {
    console.log('Sent email', result)
  }).catch(err => {
    console.log('Error sending email', err)
  })

}

const updateReferences = async (context)=>{
  // console.log(context)
   if(context.data.newOwner && context.data.reqHandover) {
    context.data.previosOwner = ObjectId(context.data.currentOwner);
    context.data.currentOwner = ObjectId(context.data.newOwner);
    if(context.type === 'after'){
      let transaction = await context.app.settings.mongooseClient.model('transaction').find({"property":  context.result._id})
      let pownerDetails = await context.app.service('users').get(context.result.previosOwner)
      let nownerDetails = await context.app.service('users').get(context.result.currentOwner)
     
      context.app.service('transaction').patch(transaction[0]._id, {lender: context.result.currentOwner}).then(res=>{
         const mailDefaults = context.app.get('mail')

        let previosOwneremailContent = `We have handed over your property ${context.result.name} to ${nownerDetails.firstName} name.`
        
        let previosOwneremail = {
          from: mailDefaults.mail_id,
          to: pownerDetails.email,
          subject: 'Property handedover',
          html: generalTemplate({content: previosOwneremailContent, firstName: pownerDetails.firstName })
        }

        let newOwnerMailContent = `Property ${context.result.name} is now handed over to you.`

        let newOwneremail = {
          from: mailDefaults.mail_id,
          to: nownerDetails.email,
          subject: 'Property handedover',
          html: generalTemplate({content: newOwnerMailContent,  firstName: nownerDetails.firstName})
        }
        mailer(context.app , previosOwneremail)
        mailer(context.app , newOwneremail)

        console.log('transaction lender updated')
      }).catch((err)=>{
        console.log('transaction lender notupdated')
        console.log(err)
      })
      
    //   // context.app.service('users').find({_id: transaction.lender}).then(res=>{
         
        
    //   //   let prevOwner = filter(res, (lender)=>{ lender._id === transaction.lender})
    //   //    let newOwner = filter(res, (lender)=>{ lender._id === context.result.lender})
         
    //   //     let prevEmail = {
    //   //       from: mailDefaults.mail_id,
    //   //       to: 'pronit78@gmail.com' ,//prevOwner.email,
    //   //       subject: 'Your Property has been handover',
    //   //       html: `${context.result.name} has been handover to ${startCase(newOwner.firstName)}`
    //   //     }

    //   //     let newEmai = {
    //   //       from: mailDefaults.mail_id,
    //   //       to: 'pronit.das@arkenea.com' ,//prevOwner.email,
    //   //       subject: 'Handover Approves',
    //   //       html: `${context.result.name} has been handover to ${startCase(newOwner.firstName)}`
    //   //     }


    //   //     context.app.service('mailer').create([prevEmail, newEmai]).then(function (result) {
    //   //       console.log('Sent email', result)
    //   //     }).catch(err => {
    //   //       console.log('Error sending email', err)
    //   //     })




    //   // })
    }
    
    
  } else {
    context.data.currentOwner = ObjectId(context.data.currentOwner);
  }

  return context;
};

//add auth hooks before commit


module.exports = {
  before: {
    all: [],
    find: [authenticate('jwt')],
    get: [authenticate('jwt')],
    create: [authenticate('jwt'), hooks.associateCurrentUser({ idField: '_id', as: 'currentOwner' })],
    update: [],
    patch: [(context)=>updateReferences(context)],
    remove: []
  },

  after: {
    all: [],
    find: [populate({     
      'currentOwner': {
        service: 'users',
        f_key: '_id'
      }})
    ],
    get: [],
    create: [],
    update: [],
    patch: [(context)=>updateReferences(context)],
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
