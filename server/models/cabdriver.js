var mongoose = require('mongoose');
var cabdriverSchema = mongoose.Schema({
    CabType: String,
    Make: String,
    Model: String,
    RegNo: String,
    Photo: String,
    LicenseNo: String,
    Address: String,
    MobileNumber: String
});

module.exports = mongoose.model('CabDriverDetails', cabdriverSchema, 'CabDriverDetails');
