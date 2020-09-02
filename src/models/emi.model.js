// emi-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const mongooseHistory = require('mongoose-history')
  const { Schema, models } = mongooseClient;
  const emi = new Schema({
    transaction: {type: mongooseClient.Schema.Types.ObjectId, ref: 'transaction'},
    amount : {type:String, required: true}
  }, {
    timestamps: true
  });

  return mongooseClient.model('emi', emi);
};
