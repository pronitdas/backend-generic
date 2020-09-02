// user-model.js - A mongoose model
//
require('mongoose-type-email');
var validateEmail = function(email) {
  var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
};
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const mongooseHistory = require('mongoose-history')
  const uniqueValidator = require('mongoose-unique-validator')

  const { Schema } = mongooseClient;
  const user = new Schema({
    profilePhoto: { type: String },
    userName: { type: String },
    firstName: {  type: String,
      required: [true, 'First Name is required'] },
    lastName: {  type: String,
      required: [true, 'Last Name is required']
    },
    email: {  type: String,
      required: [true, 'Email is required'],
      unique: true,
      uniqueCaseInsensitive: true,
      validate: [validateEmail, 'Please fill a valid email address'],
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']   
    },
    phoneNo: { type: String },
    password: { type: String },
    adminVerified: {type: Boolean, default: false},
    isVerified: { type: Boolean },
    verifyToken: { type: String },
    verifyExpires: { type: Date },
    verifyChanges: { type: Object },
    resetToken: { type: String },
    resetExpires: { type: Date },
    userType:{type:String, default: 'lender'},
    active: {type: Boolean, default: true}
  }, {
    timestamps: true
  });
  user.plugin(uniqueValidator);


  return mongooseClient.model('user', user);
};
