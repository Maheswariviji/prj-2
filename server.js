var express = require('express');
var mongoose = require('mongoose');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var tariffRoute = require('./server/routes/tariffRoute.js');
var cabRoute = require('./server/routes/cabDriverRoute.js');
var bookCab = require('./server/routes/bookCabRoute.js');
var userRoute = require('./server/routes/userRoute.js');
var routes = require('./server/routes/index.js');
var Cab = require('./server/models/cabdriver.js');
var bookingRoute = require('./server/routes/bookingRoute.js');
var app = express();
var router = express.Router();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
var DriversList = {};

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/client')));
app.use('/', routes);
app.use('/api', tariffRoute);
app.use('/cabapi', cabRoute);
app.use('/bookcabapi', bookCab);
app.use('/userapi', userRoute);
app.use('/bookingapi', bookingRoute);
mongoose.connect('mongodb://localhost/bookmycab');
var db = mongoose.connection;
db.once('open', function() {
    console.log('Connected to Database...');
});

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', path.join(__dirname, '/client'));

io.on('connection', function(socket) {
    console.log('Socket Connected');
    console.log('Socket id');
    console.log(socket.id);
       console.log('Socket id printed');
    socket.on('init', function(data) {
        Cab.findOne({
            MobileNumber: data.driver.mobile
        }, function(err, Cab) {
            if (err) {
                res.json(err);
            } else {
                console.log(socket.id);
                DriversList[socket.id] = {
                    location: data.location,
                    id: socket.id,
                    cabdata: Cab,
                    driverdata: data
                };
                console.log('Driver Added');
                socket.broadcast.emit('NewDriver', DriversList[socket.id]);
            }
        });
    });

    socket.on('BookRide', function(data) {
        var DriverLat, DriverLng, Length, Key, id;
        var near = 1;
        var CustLat = data.location.lat;
        var CustLng = data.location.lng;
        var SelectedCab = data.SelectedCab;
        var CustomerInfo = data.CustomerInfo;
        var PickLocation = data.Pickup;
        var DestLocation = data.Dest;
        var Fare = data.Fare;
        Length = Object.keys(DriversList).length;
        Key = Object.keys(DriversList); //Array of all socket ids.
        var CabTypeDriversData = {};
        var DriverData, CabData;

        //Filtering cabs base on selected cab type
        for (cab in DriversList) {
            if (SelectedCab == DriversList[cab].cabdata.CabType) {
                console.log('Matching cab Found');
                CabTypeDriversData[cab] = {
                    latitude: DriversList[cab].location.lat,
                    longitude: DriversList[cab].location.lng,
                    driverInfo: DriversList[cab].driverdata.driver,
                    cabInfo: DriversList[cab].cabdata,
                    id: DriversList[cab].id
                };
                console.log(CabTypeDriversData);
            } else {
                console.log('Matching cab not Found');
                socket.emit('BookingDetails', {
                    Status: false
                });
            }
        }
        Length = Object.keys(CabTypeDriversData).length;
        Key = Object.keys(CabTypeDriversData); //Array of all socket ids.
        //console.log(Key);
        if (Length == 0) {
            id = 0;
        } else {
            for (cab in CabTypeDriversData) {
                DriverLat = CabTypeDriversData[cab].latitude;
                DriverLng = CabTypeDriversData[cab].longitude;
                diff = closestCab(CustLat, CustLng, DriverLat, DriverLng);
                console.log(diff);
                if (diff < near) {
                    near = diff;
                    id = cab;
                    DriverData = CabTypeDriversData[cab].driverInfo;
                    CabData = CabTypeDriversData[cab].cabInfo;
                }
            }
        }

        if (id == 0) {
            socket.emit('BookingDetails', {
                Status: false
            });
        } else {
            socket.emit('BookingDetails', {
                DriverDetails: DriverData,
                CabDetails: CabData,
                BookingId: id,
                CabFare: Fare,
                Status: true
            });
            console.log('Sending Acknowledgement to driver');
            socket.to(id).etmi('DriverAcknowledge', {
                Customer: data.CustomerInfo,
                Pickup: data.Pickup,
                Drop: data.Dest,
                BookingId: id,
                CabFare: Fare,
                Status: 'Booked'
            });
            console.log('Acknowledgement Sent');
        }
    });

    function closestCab(custLat, custLong, driverLat, driverLong) {
        var pos = 0.017453292519943295;
        var calc = Math.cos;
        var adjust = 0.5 - calc((driverLat - custLat) * pos) / 2 +
            calc(custLat * pos) * calc(driverLat * pos) *
            (1 - calc((driverLong - custLong) * pos)) / 2;
        return 12742 * Math.asin(Math.sqrt(adjust));
    }

    socket.on('disconnect', function() {
        console.log("Socket Disconnected");
        socket.broadcast.emit('RemoveDriver', DriversList[socket.id]);
        console.log(socket.id);
        delete DriversList[socket.id];
    });
});

// route middleware to verify a token
router.use(function(req, res, next) {
    // check for token
    var token = req.body.token || req.query.token || req.headers['authorization'];
    if (token) {
        // verifies token
        jwt.verify(token, 'thisismysecret', function(err, decoded) {
            if (err) {
                return res.json({
                    success: false,
                    message: 'Unable to authenticate '
                });
            } else {
                req.decoded = decoded;
                next();
            }
        });
    } else {
        // if no token provided, then return an error
        return res.status(403).send({
            success: false,
            message: 'Unable to authenticate.'
        });
    }
});


if (app.get('env') === 'development') {
    var webpackMiddleware = require("webpack-dev-middleware");
    var webpack = require('webpack');
    var config = require('./webpack.config');
    app.use(webpackMiddleware(webpack(config), {
        publicPath: "/build",
        headers: {
            "X-Custom-Webpack-Header": "yes"
        },
        stats: {
            colors: true
        }
    }));
}

server.listen(3000, function() {
    console.log('Server is running on port 3000....');
});
