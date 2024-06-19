(function () {
    'use strict';
    angular
        .module('app')
        .filter('propsFilter', propsFilter)
        .controller('AddBuyerCtrl', AddBuyerCtrl);

    function propsFilter() {
        return filter;
        function filter(items, props) {
            var out = [];

            if (angular.isArray(items)) {
                items.forEach(function (item) {
                    var itemMatches = false;

                    var keys = Object.keys(props);
                    for (var i = 0; i < keys.length; i++) {
                        var prop = keys[i];
                        var text = props[prop].toLowerCase();
                        if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
                            itemMatches = true;
                            break;
                        }
                    }

                    if (itemMatches) {
                        out.push(item);
                    }
                });
            } else {
                // Let the output be the input untouched
                out = items;
            }

            return out;
        };
    }


    AddBuyerCtrl.$inject = ['$scope', '$http', '$rootScope', '$location', '$parse'];

    function AddBuyerCtrl($scope, $http, $rootScope, $location, $parse) {
        console.log('AddBuyerCtrl');
        
    }
})();
