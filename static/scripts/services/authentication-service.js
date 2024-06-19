(function() {
    'use strict';
    angular
      .module('Authentication', [])
      .factory('AuthenticationService', 
        ['$http', '$rootScope', 
        function($http, $rootScope) {
            var service = {};
            
            service.Login = function (email, password, callback) {

                $http.post('/api/user/signin', {
                    "email": email,
                    "password": password
                }).success(function (res) {
                    callback(res);
                })
            }

            service.SetCredentials = function (token, role, user) {
                if (!token || !role || !user) {
                    $rootScope.globals = {};
                    return false;
                }
                $rootScope.globals = {
                    currentUser: {
                        token: token,
                        role: role,
                        user: user
                    }
                };
                $http.defaults.headers.common['Authorization'] = token;
                $http.defaults.headers.common['Role'] = role;
                localStorage.setItem('token', token);
                localStorage.setItem('role', role);
                localStorage.setItem('user', user);
            }

            service.ClearCredentials = function () {
                $rootScope.globals = {};
                localStorage.removeItem('token');
                localStorage.removeItem('role');
                localStorage.removeItem('user');
                $http.defaults.headers.common.Authorization = '';
            }
            return service;
        }]).factory('httpResponseInterceptor', ['$q', '$location', function($q, $location) {
            return {
                responseError: function(rejection) {
                    if (rejection.status === 401) {
                        $location.path('/access/signin');
                    }
                    return $q.reject(rejection);
                }
            };
        }]).config(function($httpProvider) {
          $httpProvider.interceptors.push('httpResponseInterceptor');
        });
      
    }) ();