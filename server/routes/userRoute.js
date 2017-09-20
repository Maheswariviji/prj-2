var express = require('express');
var app = express();
var router = express.Router();
var mongoose = require('mongoose');
var User = require('../models/user.js');
var jwt = require('jsonwebtoken');
var newUser = new User();

router.post('/ChangePassword', function(req, res) {
    User.findOne({
        Email: req.body.Email
    }, function(err, user) {
        if (err) {
            res.json(err);
        } else if (!user.validPassword(req.body.OldPassword)) {
            res.json({
                success: false,
                message: 'Incorrect old password.'
            });
            console.log('Incorrect old password');
        } else {
            User.update({
                Email: req.body.Email
            }, {
                $set: {
                    Password: user.generateHash(req.body.NewPassword)
                }
            }, function(err, docs) {
                if (err) {
                    res.json(err);
                } else {
                    res.json({
                        success: true,
                        message: 'Password Changed Successfully !'
                    });
                    console.log('Password changed');
                }
            });
        }
    });
});

router.post('/login', function(req, res) {
    User.findOne({
        Email: req.body.Email
    }, function(err, user) {
        if (err)
            console.log(err.message);
        //throw err;
        else if (!user) {
            res.json({
                success: false,
                message: 'Sorry wrong email id.',
            });
            console.log('No user found.');
        } else if (!user.validPassword(req.body.Password)) {
            res.json({
                success: false,
                message: 'Sorry wrong password'
            });
            console.log('Oops! Wrong password.');
        } else if (user) {
            var token = jwt.sign(user, 'thisismysecret', {
                expiresIn: 1440
            });
            res.json({
                success: true,
                token: token,
                isLoggedIn: true,
                userDetail: user
            });
            console.log('Token Created');
        }
    });
});
router.post('/register', function(req, res) {
    User.findOne({
        Email: req.body.Email
    }, function(err, user) {
        if (err) {
            console.log(err);
        }
        if (user) {
            console.log('User Already Exists');
        } else {
            newUser.FirstName = req.body.FirstName;
            newUser.LastName = req.body.LastName;
            newUser.Email = req.body.Email;
            newUser.MobileNumber = req.body.MobileNumber;
            newUser.Password = newUser.generateHash(req.body.Password);
            newUser.UserType = 'Admin';
            newUser.save(function(err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('User Registered Successfully');
                }
            });
        }
    });
});

module.exports = router;
