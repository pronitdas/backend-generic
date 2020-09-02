const generalTemplate = require('../../utilities/mail-generator.js')
const fs = require('fs')
const pdf = fs.createReadStream('src/mail-templates/PDF.pdf')
var HTMLing = require('htmling');

const mailer = (app, email, cb)=>{

  app.service('mailer').create(email).then(function (result) {
    console.log('Sent email', result)
  }).catch(err => {
    console.log('Error sending email', err)
  })

}

const sendPdf = (context)=>{
  let mailContent = `Please interview`
  const mailDefaults = context.app.get('mail')
  let interviewemail = {
    from: mailDefaults.mail_id,
    to: context.data.email,
    subject: 'Read Interviews',
    attachments :[
      {   // use URL as an attachment
        filename: 'interview.pdf',
        path: 'src/mail-templates/PDF.pdf'
    },
    ],
    html: generalTemplate({content: mailContent})
  }
  mailer(context.app , interviewemail)
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
    create: [context => sendPdf(context)],
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
