module.exports = function($scope, $http, $cookies, $state) {
    var directionsService;
    var directionsDisplay;
    var selectedCab;
    var dist;
    var totalfare;
    var socket = io();
    var cabmarkers = {};
    var pos;

    $(document).ready(function() {
        $('#pickuptime').timepicki();
        $('#pickupdate').datepicker({
            dateFormat: "dd-mm-yy",
            minDate: 0,
            maxDate: 1
        });
        $(".cabTypeDiv").click(function() {
            selectedCab = $(this).children('img').attr('id');
            $(this).css('background-color', '#D5DB3E');
            $(this).parent().siblings().children('div').css('background-color', '#EFEBF0');
            $('#estimation').hide();
        });
    });

    $scope.calculateFare = function() {
        if (selectedCab != undefined) {
            $("#rideNowButton").prop('disabled', false);
            $("#rideLaterButton").prop('disabled', false);
            $http.get('/bookcabapi/getFare/' + selectedCab).then(function(response) {
                $scope.fare = response.data.Fare;
                calculateAndDisplayRoute(directionsService, directionsDisplay);
            });
        } else {
            alert('Please select cab type');
        }
    }
    $scope.ShowRideLaterModal = function() {
        $("#rideLaterModal").modal();
        document.getElementById('modalpickup').value = document.getElementById('pickup').value;
        document.getElementById('modaldestination').value = document.getElementById('destination').value;
        $("#cabtype").val(selectedCab);
    }

    $scope.RideLater = function() {
        var customer = $cookies.getObject('authUser');
        $scope.Booking.PickupLocation = document.getElementById('modalpickup').value;
        $scope.Booking.DestinationLocation = document.getElementById('modaldestination').value;
        $scope.Booking.Fare = totalfare;
        $scope.Booking.Customer = customer.currentUser.userInfo;
        $scope.Booking.CabType = selectedCab;
        $scope.Booking.Distance = dist;
        $scope.Booking.BookingType = 'Advance';
        $scope.Booking.BookingStatus = 'Hold';
        $scope.Booking.PickupDate = $('#pickupdate').datepicker('getDate');
        $scope.Booking.PickupTime = document.getElementById('pickuptime').value;
        $http.post('/bookcabapi/BookCabNow', $scope.Booking).then(function() {

        });
        alert('Your cab has been booked');
    }

    $scope.RideNow = function() {
        var customer = $cookies.getObject('authUser');
        var loggedInUser = customer.currentUser.userInfo;
        socket.emit('BookRide', {
            location: pos,
            CustomerInfo: loggedInUser,
            SelectedCab: selectedCab,
            Pickup: document.getElementById('pickup').value,
            Dest: document.getElementById('destination').value,
            Fare: totalfare
        });
    }

    socket.on('BookingDetails', function(data) {
        if (!data.Status) {
            alert('No Cabs available at this moment.');
        } else if (socket.id == data.BookingId) {
            alert('You cant book same cab again');
        } else {
            var customer = $cookies.getObject('authUser');
            $("#pickupLoc").html($("#pickup").val());
            $("#destinationLoc").html($("#destination").val());
            $("#drivername").html(data.DriverDetails.fname + ' ' + data.DriverDetails.lname);
            $("#contactno").html(data.DriverDetails.mobile);
            $("#vehicle").html(data.CabDetails.Make + ' ' + data.CabDetails.Model);
            $("#modalfare").html('&#8377; ' + data.CabFare);
            $("#driverimage").attr('src', '../public/uploads/' + data.CabDetails.Photo);
            $("#mymodal").modal();
            $("#rideNowButton").prop('disabled', true);
            $("#rideLaterButton").prop('disabled', true);
            $scope.Booking.BookingID = data.BookingId;
            $scope.Booking.PickupLocation = document.getElementById('pickup').value;
            $scope.Booking.DestinationLocation = document.getElementById('destination').value;
            $scope.Booking.Fare = totalfare;
            $scope.Booking.Customer = customer.currentUser.userInfo;
            $scope.Booking.CabType = selectedCab;
            $scope.Booking.Distance = dist;
            $scope.Booking.BookingType = 'Current';
            $scope.Booking.PickupDate = Date.now();
            $scope.Booking.DriverDetails = data.DriverDetails;
            $scope.Booking.CabDetails = data.CabDetails;
            $scope.Booking.BookingStatus = 'Booked';
            $http.post('/bookcabapi/BookCabNow', $scope.Booking).then(function() {});
        }
    });

    $scope.initMap = function() {
        var marker;
        directionsService = new google.maps.DirectionsService;
        directionsDisplay = new google.maps.DirectionsRenderer;
        var map = new google.maps.Map(document.getElementById('map'), {
            center: {
                lat: 12.966899,
                lng: 77.5872
            },
            zoom: 17
        });
        var geocoder = new google.maps.Geocoder;
        var infowindow = new google.maps.InfoWindow({
            map: map
        });
        directionsDisplay.setMap(map);

        var input = /** @type {!HTMLInputElement} */ (
            document.getElementById('pickup'));
        var input1 = /** @type {!HTMLInputElement} */ (
            document.getElementById('destination'));
        var autocomplete = new google.maps.places.Autocomplete(input);
        var autocomplete1 = new google.maps.places.Autocomplete(input1);

        autocomplete.bindTo('bounds', map);
        autocomplete1.bindTo('bounds', map);

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                //Setting Pickup location in textbox
                var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                geocoder.geocode({
                    'latLng': latlng
                }, function(results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        if (results[0]) {
                            address = results[0].formatted_address;
                            document.getElementById('pickup').value = address;
                            infowindow = new google.maps.InfoWindow({
                                content: address
                            });
                        } else {
                            alert("address not found");
                        }
                    } else {
                        //document.getElementById("location").innerHTML="Geocoder failed due to: " + status;
                        //alert("Geocoder failed due to: " + status);
                    }
                });

                map.setCenter(pos);
                marker = new google.maps.Marker({
                    position: pos,
                    title: 'You are here !',
                    icon: "../public/images/customer.png",
                    map: map,
                    draggable: true,
                    anchorPoint: new google.maps.Point(0, -29)
                });


                google.maps.event.addListener(marker, 'dragend', function(evt) {
                    var input = evt.latLng.lat().toFixed(3) + ',' + evt.latLng.lng().toFixed(3);
                    var latlngStr = input.split(',', 2);
                    var latlng = {
                        lat: parseFloat(latlngStr[0]),
                        lng: parseFloat(latlngStr[1])
                    };
                    geocoder.geocode({
                        'location': latlng
                    }, function(results, status) {
                        if (status === 'OK') {
                            if (results[1]) {
                                map.setZoom(17);
                                infowindow.setContent(results[1].formatted_address);
                                infowindow.open(map, marker);
                                document.getElementById('pickup').value = results[1].formatted_address;
                            } else {
                                window.alert('No results found');
                            }
                        } else {
                            window.alert('Geocoder failed due to: ' + status);
                        }
                    });
                });

                infowindow.setPosition(pos);
                infowindow.setContent('<b>You are Here !</b>');

                socket.on('NewDriver', function(data) {
                    cabmarkers[data.id] = new google.maps.Marker({
                        position: data.location,
                        map: map,
                        icon: "../public/images/car.png"
                    });
                });

                socket.on('RemoveDriver', function(driver) {
                    if (cabmarkers[driver.id] != undefined) {
                        cabmarkers[driver.id].setMap(null);
                    }
                });

            }, function() {
                handleLocationError(true, infowindow, map.getCenter());
            });
        } else {
            // Browser doesn't support Geolocation
            handleLocationError(false, infowindow, map.getCenter());
        }

        autocomplete.addListener('place_changed', function() {
            infowindow.close();
            marker.setVisible(false);
            var place = autocomplete.getPlace();
            if (!place.geometry) {
                window.alert("Autocomplete's returned place contains no geometry");
                return;
            }

            var address = '';
            if (place.address_components) {
                address = [
                    (place.address_components[0] && place.address_components[0].short_name || ''),
                    (place.address_components[1] && place.address_components[1].short_name || ''),
                    (place.address_components[2] && place.address_components[2].short_name || '')
                ].join(' ');
            }
        });
    }

    // var onChangeHandler = function() {
    //     var x = calculateAndDisplayRoute(directionsService, directionsDisplay);
    //     return x;
    // };

    function calculateAndDisplayRoute(directionsService, directionsDisplay) {
        directionsService.route({
            origin: document.getElementById('pickup').value,
            destination: document.getElementById('destination').value,
            travelMode: 'DRIVING'
        }, function(response, status) {
            if (status === 'OK') {
                directionsDisplay.setDirections(response);
                document.getElementById('distance').innerHTML = 'Estmd. Distance : ' + response.routes[0].legs[0].distance.text;
                document.getElementById('duration').innerHTML = 'Estmd. Duration : ' + response.routes[0].legs[0].duration.text;
                dist = response.routes[0].legs[0].distance.text;
                var Distance = dist.slice(0, -2);
                totalfare = Math.round($scope.fare * Distance);
                document.getElementById('fare').innerHTML = 'Estmd. Fare : ' + totalfare;
                // $scope.Duration = response.routes[0].legs[0].duration.text;
                $('#estimation').fadeIn(1000);
            } else {
                window.alert('Directions request failed due to ' + status);
            }
        });
    }

    function handleLocationError(browserHasGeolocation, infowindow, pos) {
        infowindow.setPosition(pos);
        infowindow.setContent(browserHasGeolocation ?
            'Error: The Geolocation service failed.' :
            'Error: Your browser doesn\'t support geolocation.');
    }
};
