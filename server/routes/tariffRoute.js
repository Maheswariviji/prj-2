var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var Tariff = require('../models/tariff.js');

router.use(bodyParser.urlencoded({
    extended: true
}));

router.post('/tariff', function(req, res) {
    var tariff = new Tariff();
    tariff.CabType = req.body.CabType,
        tariff.NormalRate = req.body.NormalRate,
        tariff.PeakRate = req.body.PeakRate,
        tariff.StartPeakHour = req.body.StartPeakHour,
        tariff.EndPeakHour = req.body.EndPeakHour,
        tariff.Status = req.body.Status
    tariff.save(function(err) {
        if (err) {
            console.log('Error in Saving user: ' + err);
            throw err;
            res.json({
                success: false
            });
        } else {
            res.json({
                success: true
            });
            console.log('Tariff Saved');
        }
    });
});

router.get('/gettariff', function(req, res) {
    Tariff.find({}, function(err, docs) {
        res.json(docs);
    });
});

router.get('/gettariffbyid/:id', function(req, res) {
    Tariff.find({
        '_id': req.params.id
    }, function(err, docs) {
        res.json(docs);
    });
});

router.delete('/deletetariff/:id', function(req, res) {
    Tariff.remove({
        _id: req.params.id
    }, function(err, docs) {
        console.log('Tariff Removed Successfully');
    });
});

module.exports = router;
