(function () {
  "use strict";
  console.log("NewsletterCtrl", NewsletterCtrl);
  angular.module("app").controller("NewsletterCtrl", NewsletterCtrl);

  NewsletterCtrl.$inject = [
    "$scope",
    "$http",
    "$rootScope",
    "$location",
    "$parse",
  ];

  function NewsletterCtrl($scope, $http, $rootScope) {
    var vm = $scope;
    vm.search = "";
    vm.submitConfirmation = false;
    vm.sortBy = "created";
    vm.sort = 'created';
    vm.sortForm = -1;

    vm.SuccessAlertBox = "";
    vm.ErrorAlertBox = ";";
    vm.ErrorSaveMessage = "";
    vm.SucessSaveMessage = "";
    vm.SuccessAlertBox = document.getElementById("SuccessAlertBox");
    vm.ErrorAlertBox = document.getElementById("ErrorAlertBox");

    vm.isSubscribedFilter = "";
    vm.isSubscribedFilterToSend = {};

    vm.filterByIsSubscribed = () => {
      if (vm.isSubscribedFilter === "true") {
        vm.isSubscribedFilterToSend = { isSubscribed: true }
        vm.getAll(1, vm.sortBy, vm.sortForm, vm.isSubscribedFilterToSend);
      } else if (vm.isSubscribedFilter === "false") {
        vm.isSubscribedFilterToSend = { isSubscribed: false }
        vm.getAll(1, vm.sortBy, vm.sortForm, vm.isSubscribedFilterToSend);
      } else {
        vm.isSubscribedFilterToSend = {}
        vm.getAll(1, vm.sortBy, vm.sortForm);
      }
    };

    /* create success notification */
    vm.createError = function (error) {
      vm.ErrorSaveMessage = error;
      vm.ErrorAlertBox.style.display = "inline";
      setTimeout(function () {
        vm.ErrorAlertBox.style.display = "none";
      }, 4000);
    };

    /* create error notification */
    vm.createSuccess = function (success) {
      vm.SucessSaveMessage = success;
      vm.SuccessAlertBox.style.display = "inline";
      setTimeout(function () {
        vm.SuccessAlertBox.style.display = "none";
      }, 4000);
    };

    // pagination starts
    vm.pageIndex = 1;
    vm.totalRecords = 0;
    vm.tableData = [];
    vm.paginationCount;
    vm.currentArrayIndex = 0;

    vm.clearSearchBox = function () {
      if (vm.search.length == 0) {
        vm.getAll(1, vm.sortBy, vm.sortForm);
      }
    };

    vm.createPaginationArray = function () {
      vm.mainArray = [];
      var temp = 0;
      var tempArray = [];
      for (var count = 1; count <= vm.paginationCount; count++) {
        if (tempArray.length >= 5) {
          vm.mainArray.push(tempArray);
          tempArray = [];
        }
        tempArray.push(count);
      }
      vm.mainArray.push(tempArray);
      if (vm.pageIndex == 1) {
        vm.currentArrayIndex = 0;
      }
    };

    vm.previousPaginationArray = function () {
      vm.currentArrayIndex = vm.currentArrayIndex - 1;
      vm.getAll(vm.mainArray[vm.currentArrayIndex][0], vm.sortBy, vm.sortForm);
    };

    vm.nextPaginationArray = function () {
      vm.currentArrayIndex = vm.currentArrayIndex + 1;
      vm.getAll(vm.mainArray[vm.currentArrayIndex][0], vm.sortBy, vm.sortForm);
    };

    // pagination ends

    // get all list
    vm.getAll = function (currentPageIndex, sortBy, sortForm, filter) {
      // $http.post('/api/buyer/get/leads',
      console.log({
        param: {
          search: vm.search,
        },
        sortBy: sortBy,
        sortForm: sortForm,
        pageIndex: currentPageIndex,
        recordLimit: 10,
        filter: filter,
      });
      $http
        .post("/api/newsletter/get", {
          param: {
            search: vm.search,
          },
          sortBy: sortBy,
          sortForm: sortForm,
          pageIndex: currentPageIndex,
          recordLimit: 10,
          filter: filter,
        })
        .then(function (res) {
          console.log("res :", res);
          if (res.data.success) {
            vm.pageIndex = currentPageIndex;
            vm.tableData = [];
            vm.totalRecords = res.data.count;
            vm.paginationCount = Math.ceil(vm.totalRecords / 10);
            vm.paginationArray = new Array(vm.paginationCount);
            vm.usersList = res.data.docs;
            vm.createPaginationArray();
            console.log("vm.usersList", vm.usersList);
          }
        });
    };
    vm.getAll(1, vm.sortBy, vm.sortForm);

    vm.showAsc = true;
    // sortForm is asc or dsc
    vm.changeSort = function (sortBy, sortForm) {
      vm.showAsc = false;
      vm.sortBy = sortBy;
      vm.sortForm = sortForm;
      vm.getAll(1, vm.sortBy, vm.sortForm, vm.isSubscribedFilterToSend);
      if (vm.sortForm === -1){
        vm.sort = vm.sortBy + 'reverse';
      } else {
        vm.sort = vm.sortBy;
      }
    };
  }
})();
