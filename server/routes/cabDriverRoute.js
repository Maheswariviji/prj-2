var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var CabDriver = require('../models/cabdriver.js');
var User = require('../models/user.js');
var multer = require('multer');
var FileName = '';
var storage = multer.diskStorage({ //multers disk storage settings
    destination: function(req, file, cb) {
        cb(null, './client/public/uploads/')
    },
    filename: function(req, file, cb) {
        var datetimestamp = Date.now();
        cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1]);
        FileName = file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1];
    }
});
var upload = multer({ //multer settings
    storage: storage
}).single('file');
/** API path that will upload the files */
router.post('/upload', function(req, res) {
    upload(req, res, function(err) {
        if (err) {
            res.json({
                error_code: 1,
                err_desc: err
            });
            return;
        }
        res.json({
            error_code: 0,
            err_desc: null
        });
        console.log('Upload API Called');
    });
});

router.post('/AddCabDetails', function(req, res) {
    User.findOne({
        MobileNumber: req.body.ContactNo
    }, function(err, user) {
        if (user) {
            console.log('User Already Exists !');
            res.json({
                message: 'User with this contact number already exists'
            });
        } else {
            var newUser = new User();
            newUser.FirstName = req.body.FirstName;
            newUser.LastName = req.body.LastName;
            newUser.Email = req.body.Email;
            newUser.MobileNumber = req.body.ContactNo;
            newUser.Password = newUser.generateHash('password');
            newUser.UserType = req.body.UserType;
            var Cab = new CabDriver();
            Cab.Address = req.body.Address;
            Cab.LicenseNo = req.body.LicenseNo;
            Cab.CabType = req.body.CabType;
            Cab.Make = req.body.Make;
            Cab.Model = req.body.Model;
            Cab.RegNo = req.body.RegNo;
            console.log("FileName");
            console.log(FileName);
            Cab.Photo = FileName;
            Cab.MobileNumber = req.body.ContactNo;
            newUser.save(function(err) {
                if (err) {
                    console.log('Error in Saving user: ' + err);
                    res.json({
                        status: false,
                        error: err
                    });
                } else {
                    console.log('Cab Details Saved');
                    Cab.save(function(err) {
                        if (err) {
                            console.log('Error in Saving user: ' + err);
                            res.json({
                                status: false,
                                error: err
                            });
                        } else {
                            res.json({
                                success: true
                            });
                            console.log('Driver Details Saved');
                        }
                    });
                }
            });
        }
    });
});

router.get('/GetAllCabDrivers', function(req, res) {
    User.aggregate([{
        $lookup: {
            from: "CabDriverDetails",
            localField: "MobileNumber",
            foreignField: "MobileNumber",
            as: "Cab"
        }
    }, {
        $match: {
            "Cab": {
                $ne: []
            }
        }
    }]).exec().then(function(data) {
        res.json(data);
    });
});

router.delete('/DeleteCabDriver/:id', function(req, res) {
    CabDriver.remove({
        MobileNumber: req.params.id
    }, function(err, data) {
        if (err) {
            throw err;
        } else {
            User.remove({
                MobileNumber: req.params.id
            }, function(err, data) {
                if (err) {
                    throw err;
                }
                res.json({
                    success: true
                });
            });
            console.log('Driver Deleted');
        }
    });
});

module.exports = router;
