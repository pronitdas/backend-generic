// mailinglist-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const mailinglist = new Schema({
    email: { type: String,
      required: [true, 'Email is required'] }
  }, {
    timestamps: true
  });

  return mongooseClient.model('mailinglist', mailinglist);
};
