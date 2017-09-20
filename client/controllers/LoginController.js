require('../services/authentication.js');
require('../services/NavStatus.js');
module.exports = function($rootScope, $scope, $http, $location, $state, AuthenticationService, NavService) {
    initController();

    function initController() {
        // reset login status
        AuthenticationService.Logout();
    };

    $scope.LoginUser = function() {
        AuthenticationService.Login($scope.User, function(response) {
            if (response.data.success === true) {
                if (response.data.userDetail.UserType == 'Customer' || response.data.userDetail.UserType == 'Admin') {
                    $state.go('home');
                    $rootScope.$emit('CallLoginUser', {});
                } else if (response.data.userDetail.UserType == 'Driver') {
                    $state.go('Driver');
                    $rootScope.$emit('CallLoginUser', {});
                }

            } else {
                $scope.success = response.data.success;
                document.getElementById('msg').innerHTML = response.data.message;
                console.log(response.data.message);
            }
        });
    };
}
