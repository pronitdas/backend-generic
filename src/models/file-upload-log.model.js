// file-upload-log-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
    const mongooseClient = app.get('mongooseClient');
    const {
        Schema
    } = mongooseClient;
    const fileUploadLog = new Schema({
        fileName: {
            type: String,
            required: true
        },
        successObject: {
            type: Object
        },
        dataObject: {
            type: Object
        },
        errorObject: {
            type: Object
        },
        invalidRows: {
            type: Object
        },
        bulkUploadID: {
            type: Schema.ObjectId,
            ref: 'bulk-upload', required: true
        },
        uploadedBy: {
            type: Schema.ObjectId,
            ref: 'bulk-upload', required: true
        },
        isDuplicate: {
            type: Boolean,
            default : false
        },
        isSuccess: {
            type: Boolean,
            default : false
        },
        isInvalid: {
            type: Boolean,
            default : false
        },
        isError: {
            type: Boolean,
            default : false
        },
        rowCount :{
            type : Number
        }
    }, {
            timestamps: true
        });

    return mongooseClient.model('fileUploadLog', fileUploadLog);
};