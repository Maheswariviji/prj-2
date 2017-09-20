var express = require('express');
var router = express.Router();
var tariff = require('../models/tariff.js');
var booking = require('../models/booking.js');
var mongoose = require('mongoose');

router.get('/getFare/:id', function(req, res) {
    tariff.find({
        CabType: req.params.id
    }, function(err, docs) {
        if (err) {
            console.log(err);
        } else {
            var startTime = docs[0].StartPeakHour;
            var endTime = docs[0].EndPeakHour;
            var now = new Date();

            var startDate = dateObj(startTime); // get date objects
            var endDate = dateObj(endTime);

            if (startDate > endDate) { // check if start comes before end
                var temp = startDate; // if so, assume it's across midnight
                startDate = endDate; // and swap the dates
                endDate = temp;
            }
            var fare = now <= endDate && now >= startDate ? docs[0].PeakRate : docs[0].NormalRate; // compare
            console.log(fare);
            res.json({
                Fare: fare
            });
        }
    });
});

function dateObj(d) { // date parser ...
    var parts = d.split(/:|\s/),
        date = new Date();
    if (parts.pop().toLowerCase() == 'pm') parts[0] = (+parts[0]) + 12;
    date.setHours(+parts.shift());
    date.setMinutes(+parts.shift());
    return date;
}

router.post('/BookCabNow', function(req, res) {
    newBooking = new booking();
    newBooking.BookingID = req.body.BookingID;
    newBooking.PickupLocation = req.body.PickupLocation;
    newBooking.DestinationLocation = req.body.DestinationLocation;
    newBooking.BookingType = req.body.BookingType;
    newBooking.PickupDate = req.body.PickupDate;
    newBooking.PickupTime = req.body.PickupTime;
    newBooking.Fare = req.body.Fare;
    newBooking.Customer = req.body.Customer;
    newBooking.CabType = req.body.CabType;
    newBooking.Distance = req.body.Distance;
    newBooking.BookingStatus = req.body.BookingStatus;
    newBooking.Driver = req.body.DriverDetails;
    newBooking.Cab = req.body.CabDetails;
    newBooking.save(function(err) {
        if (err) {
            res.json(err);
            console.log(err);
        } else {
            res.json({
                success: true
            });
        }
    });
});

module.exports = router;
