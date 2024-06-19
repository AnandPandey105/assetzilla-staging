(function () {
  "use strict";
  angular.module("app").controller("ViewPropertyCtrl", ViewPropertyCtrl);
  ViewPropertyCtrl.$inject = [
    "$scope",
    "$http",
    "$rootScope",
    "$compile",
    "$location",
  ];

  function ViewPropertyCtrl($scope, $http, $rootScope, $compile, $location) {
    var vm = $scope;
    vm.table = {
      title: "Property",
      limit: "10",
      fields: [
        ["Property Name", "name"],
        ["Project's Name", "project"],
        ["Builder's Name", "builder"],
        ["Property Type", "property_type"],
        ["Status", "is_live"],
        ["Area", "area_converted"],
        ["Price", "price"],
        ["Modified at", "updatedAt"],
        ["Page Views", "views"],
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
      "Retail Shops",
      "Serviced Apartments",
      "Industrial Land",
      "Penthouse",
      "Duplex",
      "Farm house",
    ];
    vm.locationFilter = "";
    vm.builderFilter = "";
    vm.projectFilter = "";
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
    vm.$watch("projectFilter", function (newValue, oldValue) {
      if (newValue != oldValue) {
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
    vm.$watch("caseIdFilter", function (newValue, oldValue) {
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
      // console.log("hghg", vm.table.query)
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
      if (vm.projectFilter) {
        payload.filter.project = vm.projectFilter;
      }
      if (vm.caseIdFilter) {
        payload.filter.case_id = vm.caseIdFilter;
      }
      if (window.localStorage.getItem('user')){
        payload.user = window.localStorage.getItem('user');
      }
      // console.log("property payload = ", payload);
      $http.post("/api/property/get", payload).then(function (res) {
        if (res.data.success) {
          console.log("property response : ", res);
          vm.table.results = res.data.results;
          vm.table.total = res.data.total;
        }
      });
    };
    vm.getData();

    vm.getProjects = function (val) {
      return $http
        .post("/api/project/typeahead", {
          data: val,
          status: "0",
        })
        .then(function (response) {
          return response.data.results.map(function (item) {
            return item.name;
          });
        });
    };
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
