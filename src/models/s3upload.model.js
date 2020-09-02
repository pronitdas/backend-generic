// s3upload-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const s3Upload = new Schema({
    image: { type: String, required: true },
    property : {type: String, required: true}
  }, {
    timestamps: true
  });

  return mongooseClient.model('s3Upload', s3Upload);
};
