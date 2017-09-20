var angular = require('angular');
angular.module('cabBooking').factory('NavService', Service);

function Service() {
    var status = {
        isLoggedIn: ''
    };

    return {
        setLoggedIn: function() {
            return status.isLoggedIn;
        },
        setLoggedOut: function(firstName) {
            status.isLoggedIn = firstName;
        }
    };
}
