(function () {
  "use strict";
  angular.module("app").controller("ViewDistrictCtrl", ViewDistrictCtrl);

  ViewDistrictCtrl.$inject = ["$scope", "$http", "$rootScope"];

  function ViewDistrictCtrl($scope, $http, $rootScope) {
    var vm = $scope;
    vm.table = {
      title: "District",
      limit: "10",
      fields: [
        ["District's Name", "name"],
        ["District's GDP (Crore Rs)", "gdp"],
        ["District's Population (Lakhs)", "population"],
        ["No. Of Projects", "total_projects"],
        ["Area (Sq.Km)", "area"],
        ["State", "state"],
        ["Status", "is_live"],
        ["Modified At", "updated"],
        ["Page Views", "views"]
      ],
      results: [],
      query: "",
      total: 0,
      skip: 1,
      sort: "newest",
      status: "0",
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
      if (vm.table.status != "0") {
        payload.filter.status = vm.table.status;
      }
      if (vm.location) {
        payload.filter.location = vm.location;
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
      $http.post("/api/location/get/district", payload).then(function (res) {
        if (res.data.success) {
          for (var index = 0; index < res.data.results.length; index++) {
            if ("area" in res.data.results[index]) {
              if ("area" in res.data.results[index].area) {
                res.data.results[index]["area"] =
                  res.data.results[index]["area"]["area"];
              } else {
                delete res.data.results[index]["area"];
              }
            }
          }
          vm.table.results = res.data.results;
          vm.table.total = res.data.total;
        }
      });
    };
    vm.getData();
    vm.getLocation = function (val) {
      return $http
        .post("/api/district/custom-typeahead", {
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
