var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var Booking = require('../models/booking.js');

router.get('/GetBookings/:id', function(req, res) {
    Booking.find({
        'Customer.email': req.params.id
    }, function(err, data) {
        if (err) {
            res.json(err);
        } else {
            res.json(data);
        }
    });
});

router.get('/GetDriverBookings/:id', function(req, res) {
    Booking.find({
        'Driver.email': req.params.id
    }, function(err, data) {
        if (err) {
            res.json(err);
        } else {
            res.json(data);
        }
    });
});

module.exports = router;
