/**
 * @ngdoc overview
 * @name app
 * @description
 * # app
 *
 * Main module of the application.
 */
(function () {
  'use strict';
  angular
    .module('app', [
      'ngAnimate',
      'ngResource',
      'ngSanitize',
      'ngTouch',
      'ngStorage',
      'ngStore',
      'ui.router',
      'ui.utils',
      'ui.load',
      'ui.jp',
      'oc.lazyLoad',
      'Authentication'
    ])

    .run(['$rootScope', '$location', '$http', 'AuthenticationService', function ($rootScope, $location, $http, AuthenticationService) {
      var token = localStorage.getItem('token'),
        role = localStorage.getItem('role'),
        user = localStorage.getItem('user');
      AuthenticationService.SetCredentials(token, role, user);

      $rootScope.$on('$locationChangeStart', function (event, next, current) {
        if ($location.path() !== '/access/signin' && !$rootScope.globals.currentUser) {
          $location.path('/access/signin');
        }
      });

      $rootScope.$on('$stateChangeStart', function (event, next) {
        var authorizedRoles = next.data && next.data.authorizedRoles || [];
        if (!$rootScope.isAuthorised(authorizedRoles)) {
          $location.path('/access/signin');
        }
      });

      $rootScope.isAuthorised = function (authorizedRoles) {
        var user = $rootScope.globals.currentUser || {};
        if (authorizedRoles.indexOf(user.role) === -1) {
          return false;
        }

        return true;
      }

    }])

})();
