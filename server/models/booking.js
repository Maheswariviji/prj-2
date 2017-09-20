var mongoose = require('mongoose');
var BookingSchema = mongoose.Schema({
    BookingID: String,
    PickupLocation: String,
    DestinationLocation: String,
    BookingType: String,
    PickupDate: Date,
    PickupTime: String,
    Fare: Number,
    Customer: Object,
    Driver: Object,
    Cab: Object,
    CabType: String,
    Distance: String,
    BookingStatus: String
});

module.exports = mongoose.model('Bookings', BookingSchema, 'Bookings');
