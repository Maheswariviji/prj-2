  'use strict';

  var angular = require('angular');
  require('angular-animate');
  require('angular-aria');
  require('angular-messages');
  require('angular-material');
  require('angular-ui-router');
  require('ngStorage');
  require('angular-cookies');
  require('ng-file-upload');
  var app = angular.module('cabBooking', ['ui.router', 'ngMessages', 'ngMaterial', 'ngStorage', 'ngCookies', 'ngFileUpload']);
  require('./directives');
  require('./controllers');

  app.config(function($stateProvider, $urlRouterProvider, $locationProvider) {
      $urlRouterProvider.otherwise("/");
      $stateProvider.state('home', {
          url: '/',
          templateUrl: 'views/main.html',
          controller: 'MainController'
      }).state('AddCab', {
          url: '/AddCab',
          templateUrl: 'views/AddCabDetails.html',
          controller: 'AddCabController',
          controllerAs: 'up'
      }).state('BookCab', {
          url: '/BookCab',
          templateUrl: 'views/BookCab.html',
          controller: 'BookCabController',
          controllerAs: 'bookcab'
      }).state('Register', {
          url: '/Register',
          templateUrl: 'views/RegisterUser.html',
          controller: 'RegisterController'
      }).state('Login', {
          url: '/Login',
          templateUrl: 'views/Login.html',
          controller: 'LoginController'
      }).state('TariffPlan', {
          url: '/TariffPlan',
          templateUrl: 'views/tariff.html',
          controller: 'TariffController'
      }).state('BookingConfirmation', {
          url: '/BookingConfirmation',
          templateUrl: 'views/BookingConfirmation.html',
          controller: 'BookingController'
      }).state('Driver', {
          url: '/Driver',
          templateUrl: 'views/Driver.html',
          controller: 'DriverController'
      }).state('MyRides', {
          url: '/MyRides',
          templateUrl: 'views/MyRides.html',
          controller: 'MyRidesController'
      }).state('Unauthorized', {
          url: '/Unauthorized',
          templateUrl: 'views/Unauthorized.html'
      }).state('ChangePassword', {
          url: '/ChangePassword',
          templateUrl: 'views/ChangePassword.html',
          controller: 'ChangePasswordController'
      });
  });

  app.run(function($rootScope, $http, $location, $sessionStorage, $cookies) {
      if ($sessionStorage.tokenDetails) {
          $http.defaults.headers.common.Authorization = $sessionStorage.tokenDetails.token;
      }

      // redirect to login page if not logged in and trying to access a restricted page
      $rootScope.$on('$locationChangeStart', function(event, next, current) {
          var publicPages = ['/', '/Login', '/Register'];
          var AdminPages = ['/TariffPlan', '/AddCab', '/', '/ChangePassword'];
          var CustomerPages = ['/BookCab', '/MyRides', '/BookingConfirmation', '/', '/ChangePassword'];
          var DriverPages = ['/Driver', '/MyRides', '/', '/ChangePassword'];
          var authUser = $cookies.getObject('authUser');
          if (authUser != undefined) {
              var loggedInUser = authUser.currentUser.userInfo;
          }
          var restrictedPage = publicPages.indexOf($location.path()) === -1;
          if (restrictedPage && !$sessionStorage.tokenDetails && $location.path() != '') {
              $location.path('/Login');
          } else {
              if (authUser != undefined) {
                  if (authUser.currentUser.userInfo.usertype == 'Admin') {
                      var Admin = AdminPages.indexOf($location.path()) === -1;
                      if (Admin) {
                          $location.path('/Unauthorized');
                      }
                  }
                  if (authUser.currentUser.userInfo.usertype == 'Customer') {
                      var Customer = CustomerPages.indexOf($location.path()) === -1;
                      if (Customer) {
                          $location.path('/Unauthorized');
                      }
                  }
                  if (authUser.currentUser.userInfo.usertype == 'Driver') {
                      var Driver = DriverPages.indexOf($location.path()) === -1;
                      if (Driver) {
                          $location.path('/Unauthorized');
                      }
                  }
              }
          }
          // console.log(restrictedPage);
          // console.log($sessionStorage.tokenDetails);
      });
  });
