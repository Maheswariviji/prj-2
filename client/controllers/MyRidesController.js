module.exports = function($scope, $http, $cookies) {
    var GetBookings = function() {
        var customer = $cookies.getObject('authUser');
        if (customer.currentUser.userInfo.usertype == 'Customer') {
            $http.get('/bookingapi/GetBookings/' + customer.currentUser.userInfo.email).then(function(response) {
                $scope.BookingData = response.data;
                console.log(response.data);
            });
        } else if (customer.currentUser.userInfo.usertype == 'Driver') {
            $http.get('/bookingapi/GetDriverBookings/' + customer.currentUser.userInfo.email).then(function(response) {
                $scope.BookingData = response.data;
                console.log(response.data);
            });
        }
    }
    GetBookings();
};
