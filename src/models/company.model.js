// company-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const mongooseHistory = require('mongoose-history')
  var validateEmail = function (email) {
    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email)
  };
  const { Schema, models } = mongooseClient;
  const uniqueValidator = require('mongoose-unique-validator')
  const company = new Schema({
    companyName: { type: String, required: true },
    ein: {
      type: String, required: true, unique: true,
      uniqueCaseInsensitive: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      validate: [validateEmail, 'Please fill a valid email address'],
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    logo: { type: String },
    associates: [{
      type: Schema.ObjectId,
      ref: 'borrower'
    }], // users
    owner: [{
      type: Schema.ObjectId,
      ref: 'user'
    }]
  }, {
      timestamps: true
    });
  company.plugin(uniqueValidator);
  return mongooseClient.model('company', company);
};
