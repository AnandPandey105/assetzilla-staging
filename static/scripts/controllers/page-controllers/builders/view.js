(function () {
  "use strict";
  angular
    .module("app", ["ui.bootstrap"])
    .controller("ViewBuilderCtrl", ViewBuilderCtrl);

  ViewBuilderCtrl.$inject = ["$scope", "$http", "$rootScope"];

  function ViewBuilderCtrl($scope, $http, $rootScope) {
    var vm = $scope;
    vm.table = {
      title: "Builder",
      limit: "10",
      fields: [
        ["Logo", "img"],
        ["Builder's Name", "name"],
        ["Total Projects", "total_projects"],
        ["Local Presence", "local_presence"],
        ["Status", "is_live"],
        ["Modified at", "updatedAt"],
        ["Page Views", "views"]
      ],
      results: [],
      query: "",
      total: 0,
      status: "0",
      sort: "newest",
      skip: 1,
      refresh: 1,
    };
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
    vm.$watch("table.status", function (newValue, oldValue) {
      if (newValue != oldValue) {
        vm.getData();
      }
    });
    vm.$watch("table.refresh", function (newValue, oldValue) {
      if (newValue != oldValue) {
        vm.getData();
      }
    });
    vm.$watch("table.sort", function (newValue, oldValue) {
      // console.log("newValue : ", newValue);
      if (newValue != oldValue) {
        vm.table.skip = 1;
        vm.getData();
      }
    });

    vm.getData = function () {
      let payload = {
        limit: parseInt(vm.table.limit),
        ref: new Date().getTime(),
      };
      if (vm.table.status != "0") {
        payload.status = vm.table.status;
      }
      if (vm.table.query.length > 0) {
        payload.query = vm.table.query;
      }
      if (vm.table.skip > 1) {
        payload.skip = vm.table.skip - 1;
      }
      if (vm.table.sort.length > 1) {
        payload.sort = vm.table.sort;
      }
      if (window.localStorage.getItem('user')){
        payload.user = window.localStorage.getItem('user');
      }
      $http.post("/api/builder/get", payload).then(function (res) {
        if (res.data.success) {
          // console.table(res.data.results);
          vm.table.results = [];
          let bucket = "https://d13ir9awo5x8gl.cloudfront.net"
            // let bucket = "https://s3-application.s3-us-west-2.amazonaws.com"
          res.data.results.forEach((element) => {
            // console.log(element)
            if ("logo" in element) {
              element.img =
                bucket+"/dyn-res/builder/" +
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
