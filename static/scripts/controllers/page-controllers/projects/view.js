(function () {
  "use strict";
  angular.module("app").controller("ViewProjectCtrl", ViewProjectCtrl);
  ViewProjectCtrl.$inject = ["$scope", "$http", "$rootScope"];

  function ViewProjectCtrl($scope, $http, $rootScope) {
    var vm = $scope;
    vm.table = {
      title: "Project",
      limit: "10",
      fields: [
        ["Project's Name", "name"],
        ["Builder's Name", "builder"],
        ["Property Type", "property_type"],
        ["Subcity", "subcity"],
        ["City", "city"],
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
    vm.projectTypesList = [
      "",
      "Residential Plots",
      "Villas",
      "Apartments",
      "Floors",
      "Commercial Land",
      "Commercial Office",
      "Retail Shop",
      "Serviced Apartments",
      "Industrial Land",
      "Penthouse",
      "Duplex",
      "Farm house",
    ];
    vm.locationFilter = "";
    vm.builderFilter = "";
    vm.typeaheadEditable = false;
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
      if (newValue != oldValue) {
        vm.table.skip = 1;
        vm.getData();
      }
    });
    vm.$watch("builderFilter", function (newValue, oldValue) {
      if (newValue != oldValue) {
        vm.getData();
      }
    });
    vm.$watch("propertyTypeFilter", function (newValue, oldValue) {
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
      } else {
        payload.sort = "newest";
      }
      if (vm.location) {
        payload.filter[Object.keys(vm.location)[0]] =
          vm.location[Object.keys(vm.location)[0]];
      }
      if (vm.builderFilter) {
        payload.filter.builder = vm.builderFilter;
      }
      if (vm.propertyTypeFilter) {
        payload.filter.type = vm.propertyTypeFilter;
      }
      if (window.localStorage.getItem('user')){
        payload.user = window.localStorage.getItem('user');
      }
      console.log("project payload = ", payload);
      $http.post("/api/project/get", payload).then(function (res) {
        console.log("project response : ", res);
        if (res.data.success) {
          vm.table.results = res.data.results;
          vm.table.total = res.data.total;
        }
      });
    };
    vm.getData();

    vm.getLocation = function (val) {
      return $http
        .post("/api/location/typeahead", {
          data: val,
          status: "0",
        })
        .then(function (response) {
          return response.data.results.map(function (item) {
            return { name: item.name, location_type: item.location_type };
          });
        });
    };
    vm.getBuilders = function (val) {
      return $http
        .post("/api/builder/typeahead", {
          data: val,
          status: "0",
        })
        .then(function (response) {
          return response.data.results.map(function (item) {
            return item.name;
          });
        });
    };
  }
})();
