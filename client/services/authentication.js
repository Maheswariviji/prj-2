'use strict';
var angular = require('angular');
angular.module('cabBooking').factory('AuthenticationService', Service);

function Service($http, $cookies, $sessionStorage) {
    var service = {};
    service.Login = Login;
    service.Logout = Logout;
    var socket = io();
    return service;

    function Login(user, callback) {
        $http.post('/userapi/login', user)
            .then(function(response) {
                if (response.data.success && response.data.token) {
                    $sessionStorage.tokenDetails = {
                        token: response.data.token
                    };
                    $http.defaults.headers.common.Authorization = response.data.token;
                    var obj = {
                        currentUser: {
                            isLoggedIn: true,
                            userInfo: {
                                id: response.data.userDetail._id,
                                email: response.data.userDetail.Email,
                                fname: response.data.userDetail.FirstName,
                                lname: response.data.userDetail.LastName,
                                mobile: response.data.userDetail.MobileNumber,
                                usertype: response.data.userDetail.UserType
                            }
                        }
                    };
                    $cookies.putObject('authUser', obj);
                    callback(response);
                } else {
                    callback(response);
                }
            });
    }

    function Logout() {
        delete $sessionStorage.tokenDetails;
        $http.defaults.headers.common.Authorization = '';
        $cookies.remove('authUser');
        socket.disconnect();
    }
}
