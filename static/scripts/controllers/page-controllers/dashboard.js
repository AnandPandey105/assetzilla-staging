(function () {
    'use strict';
    angular
        .module('app')
        .controller('DashboardCtrl', DashboardCtrl);


    DashboardCtrl.$inject = ['$scope', '$http', '$rootScope'];

    function DashboardCtrl($scope, $http, $rootScope) {
        var vm = $scope;
        vm.checkLogin = function () {
            if(vm.edit) {
                vm.updateLocation();
                return
            }
            $http.get('/users/checkLogin').then(function (res) {
                if(res.data.success) {
                    vm.location.name = "";
                    vm.location.desc = "";
                }
            });
        }
    }
})();
