(function () {
  "use strict";
  angular.module("app").controller("ViewAuthorityCtrl", ViewAuthorityCtrl);

  ViewAuthorityCtrl.$inject = ["$scope", "$http", "$rootScope"];

  function ViewAuthorityCtrl($scope, $http, $rootScope) {
    var vm = $scope;
    vm.table = {
      title: "Authority",
      limit: "10",
      fields: [
        ["Logo", "img"],
        ["Authority's Name", "name"],
        ["Total Projects", "total_projects"],
        ["State", "state"],
        ["District", "district"],
        ["Status", "is_live"],
        ["Modified at", "updatedAt"],
        ["Page Views", "views"]
      ],
      results: [],
      query: "",
      sort: "newest",
      total: 0,
      skip: 1,
      status: "0",
      refresh: 1,
    };
    vm.locationFilter = "";
    vm.typeaheadEditable = false;
    // console.table(vm.table);
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
    vm.$watch("locationFilter", function (newValue, oldValue) {
      if (newValue != oldValue) {
        if (!vm.locationFilter) {
          delete vm.location;
        }
        vm.getData();
      }
    });

    vm.onSelect = function ($item, $model, $label) {
      vm.location = {};
      vm.location[$item.location_type] = $model;
    };

    vm.getData = function () {
      let payload = { limit: parseInt(vm.table.limit) };
      payload.filter = {};
      if (vm.table.query.length > 0) {
        payload.query = vm.table.query;
      }
      if (vm.table.skip > 1) {
        payload.skip = vm.table.skip - 1;
      }
      if (vm.table.status != "0") {
        payload.filter.status = vm.table.status;
      }
      if (vm.table.sort.length > 1) {
        payload.sort = vm.table.sort;
      }
      if (vm.location) {
        payload.filter.location = vm.location;
      }
      if (window.localStorage.getItem('user')){
        payload.user = window.localStorage.getItem('user');
      }
      $http.post("/api/authority/get", payload).then(function (res) {
        if (res.data.success) {
          vm.table.results = [];
          let bucket = "https://d13ir9awo5x8gl.cloudfront.net"
          // let bucket = "https://s3-application.s3-us-west-2.amazonaws.com"
          res.data.results.forEach((element) => {
            if ("logo" in element) {
              element.img =
                bucket+"/dyn-res/authority/" +
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

    vm.getLocation = function (val) {
      return $http
        .post("/api/authority/custom-typeahead", {
          data: val,
          status: "0",
        })
        .then(function (response) {
          return response.data.results.map(function (item) {
            return { name: item.name, location_type: item.location_type };
          });
        });
    };
  }
})();
