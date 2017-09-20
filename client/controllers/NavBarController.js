require('../services/authentication.js')
module.exports = function($rootScope, $scope, $http, $cookies, $state, AuthenticationService) {
    var nav = this;
    nav.userName = '';
    nav.userType = '';
    nav.isLoggedIn = false;
    initController();

    function initController() {
        var authUser = $cookies.getObject('authUser');
        if (authUser != undefined) {
            var loggedInUser = authUser.currentUser.userInfo;
            var isLoggedIn = authUser.currentUser.isLoggedIn;
            if (isLoggedIn) {
                nav.isLoggedIn = isLoggedIn;
                nav.userName = loggedInUser.fname;
                nav.userType = loggedInUser.usertype;
            }
        } else {
            nav.isLoggedIn = false;
        }
    }

    $scope.LoginUser = function() {
        initController();
    }

    $rootScope.$on('CallLoginUser', function() {
        $scope.LoginUser();
    });

    $scope.LogoutUser = function() {
        AuthenticationService.Logout();
        nav.isLoggedIn = false;
        $state.go('Login');
    }

}
