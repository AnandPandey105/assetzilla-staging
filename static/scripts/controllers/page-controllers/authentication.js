(function () {
    'use strict';
    angular
        .module('app')
        .controller('authCtrl', auth);

        auth.$inject = ['$scope', '$rootScope', '$location', 'AuthenticationService']

        function auth($scope, $rootScope, $location, AuthenticationService) {
            var vm = $scope;
            vm.user = {};

            AuthenticationService.ClearCredentials();

            vm.login = function () {
                AuthenticationService.Login(vm.user.email, vm.user.password, 
                    function (res) {
                        if (res.success) {
                            AuthenticationService.SetCredentials(res.token, res.role, res.user);
                            if(res.role === "Admin") {
                                $location.path('/');
                            } else if(res.role === "Manager") {
                                $location.path('/')
                            } else {
                                $location.path('/signin')
                            }
                            
                        } else {
                            alert('Username or Password mismatched')
                        }
                    })
            }

            vm.checkLogin = function () {

            }
        }
}) ()