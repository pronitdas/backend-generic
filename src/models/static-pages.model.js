// static-pages-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const staticPages = new Schema({ 
    title: String,
    template_code: String,
    template_body: String,
    status: String,
  }, {
    timestamps: true
  });

  return mongooseClient.model('staticPages', staticPages);
};
