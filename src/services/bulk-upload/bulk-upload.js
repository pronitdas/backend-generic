const fs = require('fs');
const node_xj = require('xls-to-json');
const _ = require('lodash');
const moment = require('moment');
const async = require('async');
const dot = require('dot-object');
const csv = require('csvtojson');
const json2csv = require('json-2-csv');
const { getBase64DataURI } = require('dauria');


// console.log(borrowerModel)



function generateUUID() { // Public Domain/MIT
    var d = new Date().getTime();
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
        d += performance.now(); //use high-precision timer if available
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}


function objectFlip(obj) {
    const ret = {};
    Object.keys(obj).forEach((key) => {
        ret[obj[key]] = key;
    });
    return ret;
}


const LOANTYPES = {
    'Purchase and renovation': 'par',
    'Bridge loan': 'brl',
    'Business-purpose financing': 'bpf',
    'Cash-out refinance': 'cor',
    'Construction/renovation completion': 'crc',
    'Wholesale flip': 'wf',
    'HELOC': 'h',
    'Purchase only': 'p',
    'Rehab only': 'r'
};
const REVLOANTYPES = objectFlip(LOANTYPES);

const STRATEGY = {
    'Fix & Flip': 'fnf',
    'New Construction': 'nc',
    'Rental': 'r'
};
const REVSTRATEGY = objectFlip(STRATEGY);

const PROPERTYTYPE = {
    'Single family residence': 'srf',
    '2-4 unit residential': 'ur',
    'Condominiums and townhomes': 'cat',
    'Commercial': 'commercial',
    'Mobile/manufactured homes': 'mmh'
};
const REVPROPERTYTYPE = objectFlip(PROPERTYTYPE);
const KEYMAPS = {
    'Loan Status': 'loan.status',
    'Borrower First Name': 'borrower.firstName',
    'Borrower Last Name': 'borrower.lastName',
    'Borrower Email': 'borrower.email',
    'Borrower Phone Number': 'borrower.phoneNo',
    'Borrower DOB': 'borrower.dob',
    'Borrower SSN': 'borrower.ssn',
    'Company Name': 'company.companyName',
    'Company EIN': 'company.ein',
    'Company Email': 'company.email',
    'Property Address Line1': 'property.address.line1',
    'Property Address Street': 'property.address.street',
    'Property Address City': 'property.address.city',
    'Property Address State': 'property.address.state',
    'Property Address Zipcode': 'property.address.zipcode',
    'Loan Term': 'loan.loanDuration',
    'Loan Start Date': 'loan.loanStartDate',
    'Loan End Date': 'loan.loanEndDate',
    'Last Payment Date': 'loan.lastPaymentDate',
    'Purchase Price': 'loan.purchasePrice',
    'Downpayment': 'loan.downpayment',
    'Current Loan Amount': 'loan.currentLoanAmount',
    'Property Type': 'property.type',
    'Loan Type': 'loan.type',
    'Exit Strategy': 'loan.exitStrategy',
    'Property Name': 'property.name',
};

const REVKEYMAPS = objectFlip(KEYMAPS);





const bulkUploader = async function (app, lenderId, fileName, bulkUploadRefID, uploadBy) {

    const transactionService = app.service('transaction');
    const borrowerService = app.service('borrower');
    const companyService = app.service('company');
    const propertyService = app.service('property');
    const uploadService = app.service('upload');
    const bulkUploadService = app.service('bulk-upload');
    const fileLogService = app.service('file-upload-log');
    const lenderObjId = lenderId;
    const filename = fileName;
    const bulkUploadID = bulkUploadRefID;
    const uploadedBy = uploadBy;

    async function reqToFile(rawBody) {
        convertExcel = require('excel-as-json').processFile;
        var base64Data = rawBody.replace(/^data:image\/png;base64,/, '');
        var filename = generateUUID();
        let ab = await fs.writeFile(filename, base64Data, 'base64');
        return ab;
    }

    return {
        xlsToJson: async function xlsToJson(xls) {
            try {
                const jsonArray = await node_xj({
                    input: xls, // input xls
                    output: null, // output json
                });
                const out = await jsonBulkUpload(jsonArray, lenderObjId);
                return out;
            } catch (error) {
                console.error(error);
            }
        },

        reqToFile: async function reqToFile(rawBody) {
            convertExcel = require('excel-as-json').processFile;
            var base64Data = rawBody.replace(/^data:image\/png;base64,/, '');
            var filename = generateUUID();
            let ab = await fs.writeFile(filename, base64Data, 'base64');
            return ab;
        },
        csvToJson: async function csvToJson(csvStream) {
            try {
                const jsonArray = await csv().fromStream(csvStream);
                const out = await jsonBulkUpload(jsonArray);
                return out;
            } catch (error) {
                console.error(error);
            }
        }
    };

    async function jsonBulkUpload(jsonArr, lenderObjId) {
        let loanObjects = await parseJson(jsonArr, lenderObjId);

        let validRows = _.filter(loanObjects, (loanObj) => {
            return _.keys(loanObj.error).length === 0;
        });
        let invalidRows = _.filter(loanObjects, (loanObj) => {
            return _.keys(loanObj.error).length > 0;
        });

        let csvArray = [];
        let individualLoans = _.filter(validRows, (row) => row.company.ein === '-');
        let companyLoans = _.groupBy(_.filter(validRows, (row) => row.company.ein !== '-'), 'company.ein');

        let count = individualLoans.length + _.keys(companyLoans).length

        bulkUploadUpdate(count, bulkUploadID);
        individualAdd(individualLoans);
        companyTransactionAdd(companyLoans);
        writeInvalidRowToBulkUpload(invalidRows);
    }

    async function bulkUploadUpdate(count, bulkUploadID, errorFileId, errorCount= 0) {
        if (count) {
            bulkUploadService.patch(bulkUploadID, { totalCount: count })
        }
        
        if (errorFileId) {
            bulkUploadService.patch(bulkUploadID, { errorFileId: errorFileId, errorCount: errorCount })
        }
    }


    async function companyTransactionAdd(companyLoans) {
        //will get all the companies with common ein.
        async.mapSeries(companyLoans, async (company) => {
            let groupByProperty = _.groupBy(company, 'property.address_string');
            let loanObject = _.cloneDeep(groupByProperty[_.keys(groupByProperty)[0]]);
            let dbWriteValid = await createTransaction(loanObject, true);
            if (dbWriteValid.error) {
                loanObject[0].errorDb = dbWriteValid.error;
                writeErrorsToDb(dbWriteValid, groupByProperty, filename, bulkUploadID)
            } else {
                writeSuccessToDb(dbWriteValid, groupByProperty, filename, bulkUploadID)
            }
        });

    }

    async function individualAdd(individualLoans) {
        async.mapSeries(individualLoans, async (propertyItems) => {
            let dbWriteValid = await createTransaction(propertyItems, false);
            if (dbWriteValid.error) {
                writeErrorsToDb(dbWriteValid, propertyItems)
            } else {
                writeSuccessToDb(dbWriteValid, propertyItems)
            }
        });
    }

    async function writeErrorsToDb(errorObject, dataObject) {
        // console.log(uploadedBy, bulkUploadID, filename)
        bulkUploadService.emit('customEvent', {
            type: 'customEvent',
            data: 'error event'
        });
        fileLogService.create({
            fileName: filename,
            errorObject: errorObject,
            dataObject: dataObject,
            bulkUploadID: bulkUploadID,
            uploadedBy: uploadedBy,
            isError: true,
            rowCount: dataObject.length()
        });
    }

    async function writeInvalidRowToBulkUpload(rows) {
        // console.log(uploadedBy, bulkUploadID, filename)
        let transformedRows = await toCsv(rows)
        
        const permFileName = `error_csv/${generateUUID()}.csv`;
       

        try {
            json2csv.json2csv(transformedRows, (err, csv) => {
                uploadService.create({
                    id: permFileName,
                    uri: getBase64DataURI(new Buffer(csv), 'text/plain')
                }).then(res => {
                    console.log(res)
                    bulkUploadUpdate(null, bulkUploadID, permFileName, transformedRows.length)
                }).catch(err => {
                    console.log(err)
                })
            })
        } catch (error) {
            console.log(error)
        }


        // fileLogService.create({
        //     fileName: filename,
        //     invalidRows: transformedRows,
        //     bulkUploadID: bulkUploadID,
        //     uploadedBy: uploadedBy,
        //     isInvalid: true,
        //     rowCount: transformedRows.length()
        // });
    }

    async function writeSuccessToDb(successObject, dataObject) {
        // console.log(uploadedBy, bulkUploadID, filename) 
        fileLogService.create({
            fileName: filename,
            successObject: successObject,
            dataObject: dataObject,
            isDuplicate: successObject.isHidden,
            bulkUploadID: bulkUploadID,
            uploadedBy: uploadedBy,
            isSuccess: true
        });
    }

    async function createTransaction(item, isCompany) {

        let borrowerObj, companyObj, propertyObj, loanObj = {};
        try {
            if (isCompany) {

                let {
                    loan,
                    company,
                    property
                } = item[0];

                let borrowers = item.map(el => {
                    return el.borrower;
                });

                companyObj = await companyAdd(company);

                let associates = async.mapSeries(borrowers, async (b) => {
                    return await borrowerAdd(b);
                }, (err, results) => {
                    console.log(results);
                    company.associates = results.map(asso => asso._id.toString());
                    companyAdd(company);
                });


                propertyObj = await propertyAdd(property);
                let detailedLoan = addLoanMetaData(loan, propertyObj, null, companyObj);
                console.log('why is this here', detailedLoan)
                loanObj = await transactionService.create(detailedLoan);
                return loanObj;
            } else {

                let {
                    borrower,
                    loan,
                    property
                } = item;


                borrowerObj = await borrowerAdd(borrower);
                propertyObj = await propertyAdd(property);
                let detailedLoan = addLoanMetaData(loan, propertyObj, borrowerObj, null);
                console.log('why is this here', detailedLoan)
                // property.name = generateUUID()
                loanObj = await transactionService.create(detailedLoan);
                return loanObj;
            }

        } catch (error) {
            console.log(error);
            if (error.message.startsWith('property')) {
                item.errorProperty = error;
            }

            if (error.message.startsWith('transaction')) {
                item.errorLoan = error;
            }

            if (error.message.startsWith('company')) {
                item.errorCompany = error;
            }

            if (error.message.startsWith('borrower')) {

                item.errorBorrower = error;
            }

            item.error = error;

            return item;
        }


    }

    function addLoanMetaData(loan, propertyObj, borrowerObj, companyObj) {
        let loanObj = _.clone(loan);
        loanObj.property = propertyObj._id;
        loanObj.lender = propertyObj.currentOwner;
        loanObj.propertyType = propertyObj.type;

        if (propertyObj.pendingHandover || propertyObj.duplicate) {
            loanObj.isHidden = true;
        }

        loanObj.loanDuration = moment
            .duration(
                moment(loan['loanEndDate'], 'MM-DD-YYYY').diff(moment(loan['loanStartDate'], 'MM-DD-YYYY'))
            )
            .asMonths();


        if (companyObj) {
            loanObj.company = companyObj._id;
        }

        if (borrowerObj) {
            loanObj.borrower = borrowerObj._id;
        }
        return loanObj;
    }


    async function borrowerAdd(borrower) {
        let existing = await borrowerService.find({
            query: {
                ssn: borrower.ssn
            }
        });
        let borrowerObj = {};
        try {
            if (existing && existing.data && existing.data.length > 0) {
                delete borrower.ssn;

                borrowerObj = await borrowerService.patch(existing['data'][0]._id, borrower);
            } else {

                borrowerObj = await borrowerService.create(borrower);
            }

            return borrowerObj;
        } catch (error) {
            if (error.errors.ssn && error.errors.ssn.kind === 'unique') {
                const borrowerObj = await borrowerAdd(borrower);
                return borrowerObj;
            }
        }
    }

    function propertyTransformer(property) {
        let propertyTransformed = dot.object(property);
        const {
            line1,
            city,
            street,
            zipcode,
            state
        } = propertyTransformed.address;
        let address_string = `${line1} , ${street} ,${city} ,${state} ,${zipcode}`;
        propertyTransformed['address_string'] = address_string;
        return propertyTransformed;
    }

    async function propertyAdd(property) {

        let existing = await propertyService.find({
            query: {
                address_string: property.address_string,
                currentOwner: { $ne: null }
            }
        });
        let propertyObj = {};
        let existingPropObj = {};

        if (existing && existing.data && existing.data.length > 0) {

            existingPropObj = existing['data'][0];
            console.log(existingPropObj, property)
            if (existingPropObj.currentOwner[0]._id.toString() !== property.currentOwner) {
                property.newOwner = property.currentOwner;
                property.pendingHandover = true;
                console.log('is handover');
            } else {
                property.duplicate = true;
                console.log('is duplicate');
            }

            propertyObj = await propertyService.patch(existing['data'][0]._id, property);
        } else {
            propertyObj = await propertyService.create(property);
        }
        return propertyObj;
    }

    async function companyAdd(company) {
        let companyObj = {};
        let cloneCompany = _.clone(company)
        let existing = await companyService.find({
            query: {
                ein: company.ein
            }
        });
        try {
            if (existing && existing.data && existing.data.length > 0) {

                delete cloneCompany.ein
                companyObj = await companyService.patch(existing['data'][0]._id, cloneCompany);
            } else {

                companyObj = await companyService.create(cloneCompany);
            }
            return companyObj;
        } catch (error) {
            console.log(error)
            if (error.errors.ein && error.errors.ein.kind === 'unique') {

                companyObj = await companyAdd(cloneCompany);

                return companyObj;
            }
        }

    }

    function toCsv(loanObjects) {
        let errObjArr = _.map(loanObjects, (loan) => {
            let tgt = {};
            let error = _.clone(loan.error);
            dot.dot(loan, tgt); // Transforms nested object to dot notation for our ease of access.
            let errorObject = {};


            _.keys(REVKEYMAPS).forEach(key => {
                if (key.includes('type')) {
                    if (key.includes('loan.type')) {

                        if (REVLOANTYPES[tgt[key]]) {
                            errorObject[REVKEYMAPS[key]] = REVLOANTYPES[tgt[key]];
                        } else {
                            errorObject[REVKEYMAPS[key]] = tgt[key];
                        }
                    }
                    if (key.includes('property.type')) {

                        if (REVPROPERTYTYPE[tgt[key]]) {
                            errorObject[REVKEYMAPS[key]] = REVPROPERTYTYPE[tgt[key]];
                        } else {
                            errorObject[REVKEYMAPS[key]] = tgt[key];
                        }
                    }
                } else if (key.includes('strategy')) {

                    if (REVSTRATEGY[tgt[key]]) {
                        errorObject[REVKEYMAPS[key]] = REVSTRATEGY[tgt[key]];
                    } else {
                        errorObject[REVKEYMAPS[key]] = tgt[key];
                    }
                } else {
                    errorObject[REVKEYMAPS[key]] = tgt[key];
                }
            });

            errorObject['comments'] = [];

            _.forOwn(error, (key, value) => {
                errorObject['comments'].push(key);
            });
            if (errorObject['comments'].length > 0) {

                errorObject['comments'] = errorObject['comments'].join(',');
            }
            return errorObject;
        });
        return errObjArr;
    }

    async function parseJson(result, lenderId) {
        const dataArr = result;
        const keys = Object.keys(result[0]);

        //csv to json
        let formattedJson = dataArr.map(data => {
            let newObject = {};
            keys.forEach(key => {

                newObject[KEYMAPS[key]] = data[key];
            });
            return newObject;
        });

        let properties = _.filter(formattedJson, (data) => {
            return data['property.address'] !== '';
        });

        let loanObjects = properties.map((prop) => {
            let loan = {};
            let borrower = {};
            let property = {};
            let company = {};
            let error = {};
            _.forOwn(prop, function (value, key) {
                let normalisedKey = '';
                if (key.includes('loan')) {
                    normalisedKey = key.replace('loan.', '');
                    loan.lender = lenderObjId;
                    if (normalisedKey === 'type') {
                        if (LOANTYPES[value]) {
                            loan[normalisedKey] = LOANTYPES[value];
                        } else {
                            error[key] = BULKUPLOADERROR('WRONGOPTION');
                            loan[normalisedKey] = value;
                        }

                    } else if (normalisedKey === 'exitStrategy') {
                        if (STRATEGY[value]) {
                            loan[normalisedKey] = STRATEGY[value];
                        } else {
                            error[key] = BULKUPLOADERROR['WRONGOPTION'];
                            loan[normalisedKey] = value;
                        }
                    } else if (normalisedKey.includes('Date')) {
                        let dt = moment(value, 'MM-DD-YYYY');
                        if (dt.isValid()) {
                            loan[normalisedKey] = dt.format('MM-DD-YYYY');
                            let startDate = moment(loan.loanStartDate, 'MM-DD-YYYY');
                            let endDate = moment(loan.loanEndDate, 'MM-DD-YYYY');
                            if (startDate.isValid() && endDate.isValid() && (moment(loan.loanStartDate, 'MM-DD-YYYY') >= moment(loan.loanEndDate, 'MM-DD-YYYY'))) {
                                error['INVALIDDATE'] = BULKUPLOADERROR('ENDDATELESS');
                            }
                        } else {
                            error[key] = BULKUPLOADERROR('INVALIDDATE');
                            loan[normalisedKey] = value;
                        }
                    } else if (normalisedKey.includes('Price') || normalisedKey.includes('downpayment') || normalisedKey.includes('LoanAmount')) {
                        loan[normalisedKey] = numberFromString(value.split('.').join());
                    } else {
                        loan[normalisedKey] = value;
                    }
                }
                if (key.includes('borrower')) {
                    normalisedKey = key.replace('borrower.', '');
                    if (normalisedKey.includes('dob')) {
                        borrower[normalisedKey] = moment(value, 'MM-DD-YYYY').format('MM-DD-YYYY');
                    } else if (normalisedKey.includes('ssn')) {
                        let number = alphaNumberFromString(value);
                        if (number.length === 9) {
                            borrower[normalisedKey] = number;
                        } else {
                            borrower[normalisedKey] = value;
                            error[key] = number.length > 9 ? BULKUPLOADERROR('SSNGREATER') : BULKUPLOADERROR('SSNLESS');
                        }
                    } else if (normalisedKey.includes('phoneNo')) {
                        borrower[normalisedKey] = numberFromString(value);
                    } else {
                        borrower[normalisedKey] = value;
                    }
                }
                if (key.includes('property')) {
                    normalisedKey = key.replace('property.', '');
                    console.log(value)
                    if (normalisedKey === 'type') {
                        property[normalisedKey] = PROPERTYTYPE[value];
                    } else {
                        property[normalisedKey] = value;
                    }
                    property.currentOwner = lenderObjId;
                }
                if (key.includes('company')) {
                    normalisedKey = key.replace('company.', '');
                    if (value === '-') {
                        company[normalisedKey] = value;
                    } else if (normalisedKey == 'ein') {
                        let parsedNumber = alphaNumberFromString(value);
                        if (parsedNumber && parsedNumber.length === 9) {
                            company[normalisedKey] = parsedNumber;
                        } else {
                            error[key] = parsedNumber.length > 9 ? BULKUPLOADERROR('EINGREATER') : BULKUPLOADERROR('EINLESS');
                            company[normalisedKey] = value;
                        }
                    } else {
                        company[normalisedKey] = value;
                    }
                }
            });

            let propertyTransformed = propertyTransformer(property);

            return {
                loan,
                company,
                borrower,
                property: propertyTransformed,
                error
            };
        });
        return loanObjects;
    }
};


const numberFromString = (string) => {
    let numberPattern = /\d+/g;
    return string.match(numberPattern).join([]);
};


const alphaNumberFromString = (string) => {
    return string.replace(/[^a-z0-9+]+/gi, '');
};

const BULKUPLOADERROR = (key) => {
    switch (key) {
        case 'Email':
            return 'Invalid email';
        case 'SSNGREATER':
            return 'SSN is greater than 9 digits or have characters.';
        case 'SSNLESS':
            return 'SSN is less than 9 digits or have characters.';
        case 'EINGREATER':
            return 'EIN is greater than 9 digits or have characters.';
        case 'EINLESS':
            return 'EIN is less than 9 digits or have characters.';
        case 'ENDDATELESS':
            return 'Loan End Date is should be after Loan Start date.';
        case 'INVALIDDATE':
            return 'Date format should be in (MM/DD/YYYY) and should be digits only.';
        case 'WRONGOPTION':
            return 'Undefined field values. Use any one of the mentioned values from the list of possible values.';
        case 'BLANK':
            return 'Undefined field values. Use any one of the mentioned values from the list of possible values.';
        default:
            return '';
    }
};

module.exports = bulkUploader;


/* PSEUDOCODE
USER UPLOAD THE FILEs.
MARK the user model with  BULK UPLOAD IN PROGESS flag.
BASED on the extension required parser is used. Done
It will give a json array of the csv. Done
Divide Borrower and company records. Done
Find by ssn and update each borrower. If the ssn is present update the record according to current. update the loan record with borrower id. If err append to comments in comma seperated Done
Find by ein and update each company. If the ein is present update the record according to current. update the loan record with company id. If err append to comments in comma seperated Done
add each property. Check the address string for each property. If match create a duplicate record add reference to the old property for handover. If err append to comments in comma seperated Done
IF admin select the lender id from request.
IF random user access the lender id from the jwt user object. Done
Create new transaction record which has all the valid information. Done
Collect all the error records which has comments in a csv. Done
MARK the user model with BULK UPLOAD Partially flag.
Upload the csv to s3 and add the reference in user object so he is able to download the error csv.
Once he resolves the error codes. MARK the user model with UPLOAD COMPLETED Flag.
*/