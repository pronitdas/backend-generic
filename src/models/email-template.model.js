// email-template-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const emailTemplate = new Schema({
    type: {type: String, required: true},
    template_code: {type: String, required: true},
    mail_subject: {type: String, required: true},
    mail_body: {type: String, required: true},
    status: {type: String, required: true, default : true},
  }, {
    timestamps: true
  });

  return mongooseClient.model('emailTemplate', emailTemplate);
};
