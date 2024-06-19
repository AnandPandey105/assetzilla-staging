(function () {
    'use strict';
    angular
        .module('app')
        .controller('CountryCtrl', CountryCtrl);

    CountryCtrl.$inject = ['$scope', '$http', '$rootScope', '$location'];

    function CountryCtrl($scope, $http, $rootScope, $location) {
        console.log('CountryCtrl');
        var vm = $scope;
        
    }


})();
