// Initializes the `s3upload` service on path `/ups3`
const createModel = require('../../models/s3upload.model');
const hooks = require('./s3upload.hooks');
const AWS = require('aws-sdk');
const S3BlobStore = require('s3-blob-store');
const feathers = require('@feathersjs/feathers');
const BlobService = require('feathers-blob');

module.exports = function (app) {
  const aws = app.get('aws')

  const s3 = new AWS.S3({
    accessKeyId: aws.access_key,
    secretAccessKey: aws.secret_access_key,
  });
  console.log(aws.bucket, 'bucket')
  const blobStore = S3BlobStore({
    client: s3,
    bucket: aws.bucket
  });
  app.use('/upload', BlobService({
    Model: blobStore
  }));
  // Initialize our service with any options it requires
  const blobService = app.service('upload');

  app.service('upload').hooks({
    before: {
      create(context) {       
        if(!context.data.uri.includes('bulk')){
          context.params.s3 = { ACL: 'public-read' };
        }        
      }
    }
  });

  blobService.hooks(hooks);
};
