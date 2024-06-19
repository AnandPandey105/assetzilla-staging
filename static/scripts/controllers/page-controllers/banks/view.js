(function () {
  "use strict";
  angular
    .module("app")
    .controller("ViewBankCtrl", ViewBankCtrl)
    .directive("fileModel", [
      "$parse",
      function ($parse) {
        return {
          restrict: "A",
          link: function (scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;

            element.bind("change", function () {
              scope.$apply(function () {
                modelSetter(scope, element[0].files[0]);
              });
            });
          },
        };
      },
    ]);

  ViewBankCtrl.$inject = ["$scope", "$http", "$rootScope"];

  function ViewBankCtrl($scope, $http, $rootScope) {
    var vm = $scope;
    vm.table = {
      title: "Bank",
      limit: "10",
      fields: [
        ["Logo", "img"],
        ["Bank's Name", "name"],
        ["Bank Type", "type"],
        ["Status", "is_live"],
        ["Modified At", "updated"],
        ["Page Views", "views"],
      ],
      results: [],
      query: "",
      total: 0,
      status: "0",
      skip: 1,
      sort: "newest",
      refresh: 1,
    };
    vm.filter = "all";
    vm.$watch("table.limit", function (newValue, oldValue) {
      if (newValue != oldValue) {
        vm.getData();
      }
    });
    vm.$watch("table.query", function (newValue, oldValue) {
      if (newValue != oldValue) {
        vm.getData();
      }
    });
    vm.$watch("table.skip", function (newValue, oldValue) {
      if (newValue != oldValue) {
        vm.getData();
      }
    });
    vm.$watch("table.sort", function (newValue, oldValue) {
      if (newValue != oldValue) {
        vm.table.skip = 1;
        vm.getData();
      }
    });
    vm.$watch("table.status", function (newValue, oldValue) {
      if (newValue != oldValue) {
        vm.getData();
      }
    });
    vm.$watch("filter", function (newValue, oldValue) {
      if (newValue != oldValue) {
        vm.getData();
      }
    });
    vm.getData = function () {
      let payload = { limit: parseInt(vm.table.limit) };
      if (vm.table.query.length > 0) {
        payload.query = vm.table.query;
      }
      if (vm.table.status != "0") {
        payload.status = vm.table.status;
      }
      if (vm.table.skip > 1) {
        payload.skip = vm.table.skip - 1;
      }
      if (vm.table.sort.length > 1) {
        payload.sort = vm.table.sort;
      }
      if (vm.filter != "all") {
        payload.filter = vm.filter;
      }
      $http.post("/api/bank/get", payload).then(function (res) {
        if (res.data.success) {
          vm.table.results = [];
          let bucket = "https://d13ir9awo5x8gl.cloudfront.net"
            // let bucket = "https://s3-application.s3-us-west-2.amazonaws.com"
          res.data.results.forEach((element) => {
            // console.log(element)
            if ("logo" in element) {
              element.img =
                bucket+"/dyn-res/bank/" +
                element.logo;
            } else {
              element.img = "/images/bg.webp";
            }
            vm.table.results.push(element);
          });
          vm.table.total = res.data.total;
        }
      });
    };
    vm.getData();
  }
})();
