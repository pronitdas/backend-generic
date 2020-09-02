// bulk-upload-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const bulkUpload = new Schema({
    fileName: { type: String, required: true },
    uploadedBy: {
      type: Schema.ObjectId,
      ref: 'user', required: true
    },
    lender: {
      type: Schema.ObjectId,
      ref: 'user', required: true
    },
    errorFileId: {
      type: String
    },
    totalCount: {type : Number  },
    status: {type : String , required : true, default :'Initiated' },
    
  }, {
      timestamps: true
    });

  return mongooseClient.model('bulkUpload', bulkUpload);
};
