// transaction-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const mongooseHistory = require('mongoose-history')
  const { Schema } = mongooseClient;
  const transaction = new Schema({
    company: {type: Schema.ObjectId, 
      ref: 'company'},
    property: {type: Schema.ObjectId, 
      ref: 'property',
      required: true},
    borrower: {type: Schema.ObjectId, 
      ref: 'borrower'},
    purchasePrice: {type: 'Number', required: true}, //
    downpayment:  {type: 'Number', required: true},  // buyers downpayment
    currentLoanAmount: {type: 'Number', required: false},
    emi: {type: Schema.ObjectId, 
      ref: 'emi'},
    lender :  { type: Schema.ObjectId, 
        ref: 'user', required: true }, 
    loanStartDate: { type : Date, required: true},
    loanEndDate: { type : Date, required: true},
    loanDuration: { type : Number, required: false},
    ltco: {type: String, required: false}, // loan to cost offered
    ltvo: {type: String, required: false}, // loan to value offered
    lenderNotes: {type: String, required: false},
    contractorName: {type: String, required: false},
    contractorLicenseNumber: {type: String, required: false},
    contractorNotes: {type: String, required: false},
    type: {type: String, required: true},
    exitStrategy: {type: String, required: true , default: 'nc'},
    perfomance: {type: Boolean, required: true, default: false},
    propertyType:  { type: String, required: true },
    isHidden : {type: Boolean, required: true , default: false}
  }, {
    timestamps: true
  });

  return mongooseClient.model('transaction', transaction);
};
