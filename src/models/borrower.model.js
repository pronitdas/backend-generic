// borrower-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const mongooseHistory = require('mongoose-history');
  const uniqueValidator = require('mongoose-unique-validator')
  var validateEmail = function(email) {
    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email)
};
  const { Schema } = mongooseClient;
  const borrower = new Schema({
    firstName: { type: String,
        required: [true, 'First Name is required'] },
    lastName: { type: String,
        required: [true, 'Last Name is required'] },
    email: {  type: String,
      required: [true, 'Email is required'],
    validate: [validateEmail, 'Please fill a valid email address'],
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']  
   }, 
   dob: { type : Date, required: true},
   phoneNo: { type: String,
    required: [true, 'Phone is required']
   },
   associate: { type : Boolean,default: false, required: false},
   image: { type: String },
    ssn : { type: String,  required: true , unique: true,
      uniqueCaseInsensitive: true }, // last 4 digits
    lgc: { type : Boolean, required: false}, //licensed general contractor
    pree: { type : Boolean, required: false}, //  Prior real estate experience
  }, {
    timestamps: true
  });
  borrower.plugin(uniqueValidator);

  return mongooseClient.model('borrower', borrower);
};
