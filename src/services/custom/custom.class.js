/* eslint-disable no-unused-vars */

const generalTemplate = require('../../utilities/mail-generator.js')

const userModel = require('../../models/user.model');
// const bulkUploader = require('./bulk-upload')
class Service {
  constructor(options, app) {
    this.options = options || {};
    this.app = app || {};
  }

  async find(params) {
    return [];
  }

  async get(id, params) {
    if (id == 'me') {
      const { firstName, lastName, userType, _id, email, profilePhoto } = params.user;
      return { firstName, lastName, userType, _id, email, profilePhoto };
    } else if (id == 'testMail') {
      return generalTemplate({ firstName: 'pronit' });
    } else if (id == 'bulkUpload') {

      // console.log(params.lenderId)
      // console.log(params.user._id)

      // const bulkUploaderFn = await bulkUploader(this.app);
      // try {
      //   bulkUploaderFn.xlsToJson('/home/pronit/Downloads/bulk-upload-borrower.xlsx', params.lenderId || params.user._id)
      //   return { 'done': 200 }
      // } catch (error) {
      //   return { error }
      // }
    } else if (id == 'bulkUploadCsv') {

      // const bulkUploaderFn = await bulkUploader(this.app);
      // try {
      //   let res = await bulkUploaderFn.csvToJson('/home/pronit/Documents/bulk_upload.csv', params.lenderId || params.user._id)
      //   return { data : res }
      // } catch (error) {
      //   return { error }
      // }
    }
  }

  async create(data, params) {


  }

  async update(id, data, params) {
    return data;
  }

  async patch(id, data, params) {
    return data;
  }

  async remove(id, params) {
    return { id };
  }
}

module.exports = function (options, app) {
  return new Service(options, app);
};

module.exports.Service = Service;
