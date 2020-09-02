const generalTemplate = require('../../utilities/mail-generator.js')



const mailer = (app, email, cb)=>{
  app.service('mailer').create(email).then(function (result) {
    console.log('Sent email', result)
  }).catch(err => {
    console.log('Error sending email', err)
  })

}

const sendInquiryToAdmin = (context)=>{
  let mailContent = context.data.message
  const mailDefaults = context.app.get('mail')
  let inquiryEmail = {
    from: mailDefaults.mail_id,
    to: mailDefaults.mail_id,
    subject: 'Support Query',
    html: generalTemplate({content: mailContent, firstName: "Team", lender: false})
  }

  mailer(context.app , inquiryEmail)
}

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [context => sendInquiryToAdmin(context)],
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
