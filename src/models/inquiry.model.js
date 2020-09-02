// inquiry-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const inquiry = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    number: { type: String, required: true },
    message: { type: String, required: true }
  }, {
    timestamps: true
  });

  return mongooseClient.model('inquiry', inquiry);
};
