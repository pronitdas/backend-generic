const {
  authenticate
} = require('@feathersjs/authentication').hooks;
const AWS = require('aws-sdk');
const populate = require('../../hooks/populate')

const hooks = require('feathers-authentication-hooks');
const bulkUploader = require('./bulk-upload')






// try {
//   let res = await bulkUploaderFn.csvToJson('/home/pronit/Documents/bulk_upload.csv', params.lenderId || params.user._id)
//   return { data : res }
// } catch (error) {
//   return { error }
// }


// const bulkUploaderFn = await bulkUploader(this.app);
// try {
//   bulkUploaderFn.xlsToJson('/home/pronit/Downloads/bulk-upload-borrower.xlsx', params.lenderId || params.user._id)
//   return { 'done': 200 }
// } catch (error) {
//   return { error }
// }



const uploadFn = async (context) => {
  const aws = context.app.get('aws')
  const S3 = new AWS.S3({
    accessKeyId: aws.access_key,
    secretAccessKey: aws.secret_access_key,
  });

  const bulkUploaderFn = await bulkUploader(context.app, context.data.lender, context.data.fileName, context.result._id, context.params.user._id.toString());
  let fileNameArr = context.data.fileName.split(".")
  let ext = fileNameArr[fileNameArr.length - 1]
  const stream = S3.getObject({
    Bucket: aws.bucket,
    Key: context.data.fileName
  }).createReadStream();

  if (ext === "xlsx" || ext === "xls") { // check for file typee
    bulkUploaderFn.xlsToJson(stream)
  } else if (ext === 'csv') {
    bulkUploaderFn.csvToJson(stream)
  }

  return context;
}







module.exports = {
  before: {
    all: [authenticate('jwt')],
    find: [],
    get: [],
    create: [hooks.associateCurrentUser({
      idField: '_id',
      as: 'uploadedBy'
    })],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [populate({
      'uploadedBy': {
        service: 'users',
        f_key: '_id'
      },
      'lender': {
        service: 'users',
        f_key: '_id'
      }
    })],
    get: [populate({
      'uploadedBy': {
        service: 'users',
        f_key: '_id'
      },
      'lender': {
        service: 'users',
        f_key: '_id'
      }
    })],
    create: [context => uploadFn(context)],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};