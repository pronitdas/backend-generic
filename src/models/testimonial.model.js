// testimonial-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const testimonial = new Schema({
    name: { type: String, required: true },
    title: { type: String, required: true },
    company: { type: String, required: true },
    content: { type: String, required: true },
    active : {type : Boolean, default: true},
    image: { type: String }
  }, {
    timestamps: true
  });

  return mongooseClient.model('testimonial', testimonial);
};
