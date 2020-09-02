// property-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

module.exports = function(app) {
    const mongooseClient = app.get('mongooseClient');
    const mongooseHistory = require('mongoose-history')
    const {
        Schema
    } = mongooseClient;
    const property = new Schema({
        name: {
            type: String,
            required: [true, 'Please enter Property Name'],
        },
        address: {
            type: Object
        },
        address_string: {
            type: String
        },
        type: {
            type: String,
            required: true
        },
        images: [{
            type: Schema.ObjectId,
            ref: 's3Upload'
        }],
        previosOwner: {
            type: Schema.ObjectId,
            ref: 'user'
        },
        handover: {
            type: String,
            default: false
        },
        currentOwner: {
            type: Schema.ObjectId,
            ref: 'user',
            required: true
        },
        pendingHandover: {
            type: Boolean,
            default: false
        },
        duplicate: {
            type: Boolean,
            default: false
        }
    }, {
        timestamps: true
    });
    property.plugin(mongooseHistory);
    return mongooseClient.model('property', property);
};