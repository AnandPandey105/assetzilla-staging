(function () {
    'use strict';
    angular
        .module('app')
        .filter('propsFilter', propsFilter)
        .controller('OverviewCtrl', OverviewCtrl);

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

    OverviewCtrl.$inject = ['$scope', '$http', '$rootScope', '$compile', '$location'];

    function OverviewCtrl($scope, $http, $rootScope, $compile, $location) {
        // console.log('frm OverviewCtrl');
        var vm = $scope;
        
        $scope.selectedDate = new Date();
      $scope.selectedDateAsNumber = Date.UTC(1986, 1, 22);
      // $scope.fromDate = new Date();
      // $scope.untilDate = new Date();
      $scope.getType = function(key) {
        return Object.prototype.toString.call($scope[key]);
      };

      $scope.clearDates = function() {
        $scope.selectedDate = null;
      };

    }
})();