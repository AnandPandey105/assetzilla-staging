(function () {
  "use strict";
  angular.module("app").controller("EmiCtrl", EmiCtrl);

  EmiCtrl.$inject = ["$scope", "$http", "$rootScope"];

  function EmiCtrl($scope, $http, $rootScope) {
    var vm = $scope;
    vm.emi_per_lac = 0;
    vm.saving = false;

    vm.setEMIPerLac = () => {
      console.log(vm.emi_per_lac);
      $("#saveEMIPerLacButton").attr("disabled", "disabled");
      $("#saveEMIPerLacButton").html("Saving...");

      $http
        .post("/api/setEMIPerLac", { emi_per_lac: vm.emi_per_lac })
        .then(function (res) {
          console.log(res);
          $("#saveEMIPerLacButton").removeAttr("disabled");
          $("#saveEMIPerLacButton").html("Save");
          alert("Saved!");
        }).catch(function (err) {
          console.log(err);
          alert("Something went wrong");
        });
    };

    vm.getEMIPerLac = () => {
      $http.post("/api/getEMIPerLac").then(function (response) {
        console.log(response);
        if (response.data.emi_per_lac) {
          vm.emi_per_lac = response.data.emi_per_lac;
        }
      });
    };
    vm.getEMIPerLac();
  }
})();
