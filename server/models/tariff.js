var mongoose = require('mongoose');
var tariffSchema = mongoose.Schema({
    CabType: String,
    NormalRate: Number,
    PeakRate: Number,
    StartPeakHour: String,
    EndPeakHour: String
});

module.exports = mongoose.model('TariffPlan', tariffSchema, 'TariffPlan');
