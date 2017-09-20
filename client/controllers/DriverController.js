module.exports = function($scope, $http, $cookies) {
    var socket = io();
    var BookingData = {};
    socket.on('DriverAcknowledge', function(data) {
        BookingData = data;
        document.getElementById('pickupLoc').innerHTML = data.Pickup;
        document.getElementById('destinationLoc').innerHTML = data.Drop;
        document.getElementById('custname').innerHTML = data.Customer.fname + ' ' + data.Customer.lname;
        document.getElementById('custcontact').innerHTML = data.Customer.mobile;
        document.getElementById('tfare').innerHTML = '&#8377; ' + data.CabFare;
        $("#mymodal").modal();
    });

    $scope.ShowCurrentBooking = function() {
        if (Object.keys(BookingData).length == 0) {
            alert('You have no current bookings at the moment.');
        } else {
            $("#mymodal").modal();
        }
    }
    $scope.initMap = function() {
        var map = new google.maps.Map(document.getElementById('drivermap'), {
            center: {
                lat: -34.397,
                lng: 150.644
            },
            zoom: 18,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        });
        var infoWindow = new google.maps.InfoWindow({
            map: map
        });
        // Try HTML5 geolocation.
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                var pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                coords = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                infoWindow.setPosition(pos);
                infoWindow.setContent('Location found.');
                map.setCenter(pos);
                var marker = new google.maps.Marker({
                    position: pos,
                    map: map,
                    icon: "../public/images/car.png",
                    title: "Your Location"
                });
                sendLocation(position.coords.latitude, position.coords.longitude);
            }, function() {
                handleLocationError(true, infoWindow, map.getCenter());
            });
        } else {
            // Browser doesn't support Geolocation
            handleLocationError(false, infoWindow, map.getCenter());
        }
    }

    function sendLocation(latitude, longitude) {
        var authUser = $cookies.getObject('authUser');
        var driverInfo = authUser.currentUser.userInfo;
        socket.emit('init', {
            location: {
                lat: latitude,
                lng: longitude
            },
            driver: driverInfo
        });
    }

    function handleLocationError(browserHasGeolocation, infoWindow, pos) {
        infoWindow.setPosition(pos);
        infoWindow.setContent(browserHasGeolocation ?
            'Error: The Geolocation service failed.' :
            'Error: Your browser doesn\'t support geolocation.');
    }
};
