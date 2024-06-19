(function () {
  "use strict";
  angular.module("app").controller("UserCtrl", UserCtrl);

  UserCtrl.$inject = ["$scope", "$http", "$rootScope"];

  function UserCtrl($scope, $http, $rootScope) {
    var vm = $scope;
    vm.edit = false;
    $rootScope.editTicket = false;
    $rootScope.processEdit = false;
    $rootScope.showBackBtn = false;
    vm.search = "";
    vm.submitConfirmation = false;
    vm.sortBy = "_id";
    vm.sortForm = -1;
    vm.user = {};
    vm.roles = [];
    vm.usersList = [];
    vm.indexToUpdate = "";
    vm.rolesForFilter = [];
    vm.showCrossForUser = false;
    vm.selectedRoleForFilter = {};
    vm.userToDelete = {};
    vm.SuccessAlertBox = "";
    vm.ErrorAlertBox = ";";
    vm.ErrorSaveMessage = "ERROR";
    vm.SucessSaveMessage = "SUCCESS";
    vm.SuccessAlertBox = document.getElementById("SuccessAlertBox");
    vm.ErrorAlertBox = document.getElementById("ErrorAlertBox");

    vm.locationAccessLevel = "";
    vm.locationAccessValue = "";

    vm.fullLocations = { State: [], City: [], District: [], Subcity: [] };
    vm.locationAccessLevels = [
      "FULL ACCESS",
      "State",
      "City",
      "District",
      "Subcity",
    ];
    vm.locationAccessValues = [];
    console.log(vm.locationAccessLevel, vm.locationAccessValue);
    vm.userLocationAccess = [];

    vm.userPropertyTypeAccess = [];
    vm.fullPropertyTypes = {
      Residential: [
        "All",
        "Apartments",
        "Residential Plots",
        "Villas",
        "Floors",
        "Penthouse",
        "Duplex",
      ],
      Commercial: [
        "All",
        "Commercial Office Spaces",
        "Retail Shops",
        "Commercial Land",
        "Serviced Apartments",
      ],
      Others: ["All", "Industrial Land", "Farm House"],
    };
    vm.propertyTypeAccessLevel = "";
    vm.propertyTypeAccessValue = "";
    vm.propertyTypeAccessLevels = [
      "FULL ACCESS",
      "Residential",
      "Commercial",
      "Others",
    ];
    vm.propertyTypeAccessValues =
      vm.fullPropertyTypes[vm.propertyTypeAccessLevel];
    console.log(vm.fullPropertyTypes["Residential"]);
    console.log(vm.fullPropertyTypes);

    vm.setOptionsPropertyType = () => {
      vm.propertyTypeAccessValues =
        vm.fullPropertyTypes[vm.propertyTypeAccessLevel];
      console.log(vm.propertyTypeAccessValues);
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
    vm.tableHeading = "Basic Table";
    vm.pageIndex = 1;
    vm.totalRecords = 0;
    vm.tableData = [];
    vm.paginationCount;
    vm.currentArrayIndex = 0;

    vm.clearSearchBox = function () {
      if (vm.search.length == 0) {
        vm.getAllUsers(1, vm.sortBy, vm.sortForm);
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
      vm.getAllUsers(
        vm.mainArray[vm.currentArrayIndex][0],
        vm.sortBy,
        vm.sortForm
      );
    };

    vm.nextPaginationArray = function () {
      vm.currentArrayIndex = vm.currentArrayIndex + 1;
      vm.getAllUsers(
        vm.mainArray[vm.currentArrayIndex][0],
        vm.sortBy,
        vm.sortForm
      );
    };

    // pagination ends

    vm.submitConfirmationFn = function () {
      vm.submitConfirmation = true;
    };

    vm.blankFormFn = function () {
      vm.user = {};
      vm.user.role = "";
      vm.locationAccessLevel = ""
      vm.locationAccessValue = ""
      vm.propertyTypeAccessValue = ""
      vm.propertyTypeAccessLevel = ""

      vm.userLocationAccess = [];
      vm.userPropertyTypeAccess = [];
      vm.submitConfirmation = false;
      vm.edit = false;
    };

    vm.edit = false;
    vm.user = {};

    vm.getRoles = function () {
      $http.get("/api/user/getRoles").then(function (res) {
        if (res.data.success) {
          vm.roles = res.data.roles;
          vm.rolesForFilter = res.data.roles;
        } else {
          vm.createError(res.data.message);
        }
      });
    };
    vm.getRoles();

    vm.createUser = function () {
      if (vm.edit) {
        vm.updateUser();
        return;
      }
      vm.user.propertyTypeAccess = vm.userPropertyTypeAccess
      vm.user.locationAccess = vm.userLocationAccess
      console.log(vm.user);
      $http.post("/api/user/createUser", vm.user).then(function (res) {
        vm.submitConfirmation = false;
        if (res.data.success) {
          vm.createSuccess(res.data.message);
          $("#addNewUserModal").modal("hide");
          vm.user = {};
          alert("Success")
          vm.getAllUsers(1, vm.sortBy, vm.sortForm);
        } else {
          console.log(res)
          vm.createError(res.data.error.name);
          alert("Error Occured")
        }
      });
    };

    // get all User list
    vm.getAllUsers = function (currentPageIndex, sortBy, sortForm) {
      $http
        .post("/api/user/getAll", {
          param: {
            search: vm.search,
            role: vm.selectedRoleForFilter,
          },
          sortBy: sortBy,
          sortForm: sortForm,
          pageIndex: currentPageIndex,
          recordLimit: 10,
        })
        .then(function (res) {
          $http
            .post("/api/user/location-wise-access")
            .then((doc) => {
              if (doc.data.success) {
                vm.fullLocations = doc.data.data;
              }
              console.log(doc);
              console.log(vm.fullLocations);
              vm.locationAccessValues =
                vm.fullLocations[vm.locationAccessLevel];
            })
            .catch((e) => {});
          vm.pageIndex = currentPageIndex;
          vm.tableData = [];
          vm.totalRecords = res.data.count;
          vm.paginationCount = Math.ceil(vm.totalRecords / 10);
          vm.paginationArray = new Array(vm.paginationCount);
          vm.usersList = res.data.docs;
          vm.createPaginationArray();
        });
    };
    vm.getAllUsers(1, vm.sortBy, vm.sortForm);

    vm.submitConfirmationFn = function () {
      if (!vm.user.name || vm.user.name.length < 1) {
        alert("Enter User's Name");
        return;
      }
      console.log(vm.user.pwd)
      if(!vm.user.pwd){
        alert("Please fill in the password before proceeding");
        return;
      }
      if (!vm.user.email || vm.user.email.length < 1) {
        console.log(vm.user.email);
        alert("Enter User's Email");
        return;
      } else {
        const regExp = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
        const match = vm.user.email.match(regExp);
        console.log(match);
        if (!match) {
          alert("Invalid Email");
          return;
        } else {
          console.log("valid email");
        }
      }
      if (vm.edit != true) {
        if (!vm.user.pwd || vm.user.pwd.length < 1) {
          alert("Enter Password");
          return;
        }
      }
      if (!vm.user.role || vm.user.role.length < 1) {
        alert("Enter User's Role");
        return;
      }
      vm.submitConfirmation = true;
    };

    vm.showAsc = true;
    // sortForm is asc or dsc
    vm.changeSort = function (sortBy) {
      if (vm.showAsc) {
        vm.showAsc = false;
        vm.sortBy = sortBy;
        vm.sortForm = 1;
        vm.getAllUsers(1, vm.sortBy, vm.sortForm);
      } else {
        vm.showAsc = true;
        vm.sortBy = sortBy;
        vm.sortForm = -1;
        vm.getAllUsers(1, vm.sortBy, vm.sortForm);
      }
    };

    vm.getUserToUpdate = function (user, index) {
      vm.edit = true;
      vm.indexToUpdate = index;
      vm.user = angular.copy(user);
      vm.locationAccessLevel = ""
      vm.propertyTypeAccessLevel = ""
      vm.locationAccessValue = ""
      vm.propertyTypeAccessValue = ""
      if (vm.user.locationAccess) {
        vm.userLocationAccess = vm.user.locationAccess;
      } else {
        vm.userLocationAccess = [];
      }
      if (vm.user.propertyTypeAccess) {
        vm.userPropertyTypeAccess = vm.user.propertyTypeAccess;
      } else {
        vm.userPropertyTypeAccess = [];
      }
      console.log(vm.user);
      vm.locationAccessLevel = vm.user.locationAccessLevel;
      vm.locationAccessValue = vm.user.locationAccessValue;
    };

    vm.updateUser = function () {
      console.log(vm.user);
      vm.user.locationAccess = vm.userLocationAccess;
      $http
        .post("/api/user/edit", {
          user: vm.user,
        })
        .then(function (res) {
          vm.submitConfirmation = false;
          if (res.data.success) {
            vm.edit = false;
            vm.usersList[vm.indexToUpdate].name = vm.user.name;
            vm.usersList[vm.indexToUpdate].email = vm.user.email;
            vm.usersList[vm.indexToUpdate].role = vm.user.role;
            $("#addNewUserModal").modal("hide");
            vm.user = {};
            alert("success")
            vm.createSuccess(res.data.message);
            vm.getAllUsers(1, vm.sortBy, vm.sortForm);
          } else {
            vm.createError(res.data.message);
            vm.getAllUsers(1, vm.sortBy, vm.sortForm);
            alert("Error")
          }
        });
    };

    // delete
    vm.getUserToDelete = function (user, index) {
      vm.indexToDelete = index;
      vm.userToDelete = user;
    };

    vm.deleteUserFn = function () {
      $http
        .post("/api/user/delete", {
          user: vm.userToDelete,
        })
        .then(function (res) {
          if (res.data.success) {
            vm.createSuccess(res.data.message);
            vm.usersList.splice(vm.indexToDelete, 1);
          } else {
            vm.createError(res.data.message);
          }
        });
    };

    let isItAlreadyPresent = (accObj) => {
      console.log(accObj);
      for (let i = 0; i <= vm.userLocationAccess.length - 1; i++) {
        if (
          vm.userLocationAccess[i].locationAccessLevel ===
            accObj.locationAccessLevel &&
          vm.userLocationAccess[i].locationAccessValue ===
            accObj.locationAccessValue
        ) {
          console.log(
            vm.userLocationAccess[i].locationAccessLevel,
            vm.userLocationAccess[i].locationAccessValue
          );
          return true;
        }
      }
      return false;
    };

    let hasFullAccess = () => {
      for (let i = 0; i <= vm.userLocationAccess.length - 1; i++) {
        if (vm.userLocationAccess[i].locationAccessLevel === "FULL ACCESS") {
          return true;
        }
      }
      return false;
    };

    vm.addNewLocationAccess = () => {
      console.log("Adding ", vm.locationAccessLevel, vm.locationAccessValue);
      if (vm.userLocationAccess.length > 0) {
        console.log(
          vm.userLocationAccess.includes({
            locationAccessLevel: vm.locationAccessLevel,
            locationAccessValue: vm.locationAccessValue,
          })
        );
        if (hasFullAccess()) {
          alert(
            "User already has full access, please remove it and then add specific accesses"
          );
          return;
        }
        if (
          isItAlreadyPresent({
            locationAccessLevel: vm.locationAccessLevel,
            locationAccessValue: vm.locationAccessValue,
          })
        ) {
          alert("Already Present");
          return;
        }
        console.log(
          vm.locationAccessLevel,
          vm.locationAccessValue,
          vm.userLocationAccess.length
        );
        if (
          vm.locationAccessLevel === "FULL ACCESS" &&
          vm.userLocationAccess.length >= 1
        ) {
          alert("Please first remove all other access");
          return;
        }
      }
      if (vm.locationAccessLevel) {
        if (vm.locationAccessLevel === "FULL ACCESS") {
          vm.locationAccessValue = "FULL ACCESS";
        } else if (!vm.locationAccessValue) {
          alert(
            `Please select the value for ${vm.locationAccessLevel} from the subsequent dropdown`
          );
          return;
        }
        vm.userLocationAccess.push({
          locationAccessLevel: vm.locationAccessLevel,
          locationAccessValue: vm.locationAccessValue,
        });
      }
      console.log("Access: ", vm.userLocationAccess);
    };

    vm.removeLocationAccess = (access) => {
      console.log("Removing :", access);
      let arr = vm.userLocationAccess;
      for (let i = 0; i <= vm.userLocationAccess.length - 1; i++) {
        if (
          arr[i].locationAccessLevel === access.locationAccessLevel &&
          arr[i].locationAccessValue === access.locationAccessValue
        ) {
          vm.userLocationAccess.splice(i, 1);
        }
      }
      console.log("New access: ", vm.userLocationAccess);
    };

    let isItAlreadyPresent_PropertyType = (accObj) => {
      console.log(accObj);
      for (let i = 0; i <= vm.userPropertyTypeAccess.length - 1; i++) {
        if (
          vm.userPropertyTypeAccess[i].propertyTypeAccessLevel ===
            accObj.propertyTypeAccessLevel &&
          vm.userPropertyTypeAccess[i].propertyTypeAccessValue ===
            accObj.propertyTypeAccessValue
        ) {
          console.log(
            vm.userPropertyTypeAccess[i].propertyTypeAccessLevel,
            vm.userPropertyTypeAccess[i].propertyTypeAccessValue
          );
          return true;
        }
      }
      return false;
    };

    let hasFullAccess_PropertyType = () => {
      for (let i = 0; i <= vm.userPropertyTypeAccess.length - 1; i++) {
        if (
          vm.userPropertyTypeAccess[i].propertyTypeAccessLevel === "FULL ACCESS"
        ) {
          return true;
        }
      }
      return false;
    };

    let hasFullSubLeveLAccess = () => {
      for (let i = 0; i < vm.userPropertyTypeAccess.length; i++) {
        if (
          vm.userPropertyTypeAccess[i].propertyTypeAccessLevel ===
          vm.propertyTypeAccessLevel
        ) {
          if (vm.userPropertyTypeAccess[i].propertyTypeAccessValue === "All") {
            return true;
          }
        }
      }
      return false;
    };

    let isSpecificAccessPresent = () => {
      for (let i = 0; i <= vm.userPropertyTypeAccess.length - 1; i++) {
        if (
          vm.userPropertyTypeAccess[i].propertyTypeAccessLevel ===
          vm.propertyTypeAccessLevel
        ) {
          return true;
        }
      }
      return false;
    };

    vm.addNewPropertyTypeAccess = () => {
      console.log(
        "Adding ",
        vm.propertyTypeAccessLevel,
        vm.propertyTypeAccessValue
      );
      if (vm.userPropertyTypeAccess.length > 0) {
        if (hasFullAccess_PropertyType()) {
          alert(
            "User already has full access, please remove it and then add specific accesses"
          );
          return;
        }
        if (hasFullSubLeveLAccess()) {
          alert(`user has full access for ${vm.propertyTypeAccessLevel}.`);
          return;
        }
        if (
          isItAlreadyPresent_PropertyType({
            propertyTypeAccessLevel: vm.propertyTypeAccessLevel,
            propertyTypeAccessValue: vm.propertyTypeAccessValue,
          })
        ) {
          alert("Already Present");
          return;
        }
        if (vm.propertyTypeAccessValue === "All") {
          if (isSpecificAccessPresent()) {
            alert(
              `Please first remove other accesses for ${vm.propertyTypeAccessLevel}.`
            );
            return;
          }
        }
        // console.log(
        //   vm.propertyTypeAccessLevel,
        //   vm.propertyTypeAccessValue,
        //   vm.userPropertyTypeAccess.length
        // );
        if (
          vm.propertyTypeAccessLevel === "FULL ACCESS" &&
          vm.userPropertyTypeAccess.length >= 1
        ) {
          alert("Please first remove all other access");
          return;
        }
      }
      if (vm.propertyTypeAccessLevel) {
        if (vm.propertyTypeAccessLevel === "FULL ACCESS") {
          vm.propertyTypeAccessValue = "FULL ACCESS";
        } else if (!vm.propertyTypeAccessValue) {
          alert(
            `Please select the value for ${vm.propertyTypeAccessLevel} from the subsequent dropdown`
          );
          return;
        }
        vm.userPropertyTypeAccess.push({
          propertyTypeAccessLevel: vm.propertyTypeAccessLevel,
          propertyTypeAccessValue: vm.propertyTypeAccessValue,
        });
      }
      console.log("Access: ", vm.userPropertyTypeAccess);
    };

    vm.removePropertyTypeAccess = (access) => {
      console.log("Removing :", access);
      let arr = vm.userPropertyTypeAccess;
      for (let i = 0; i <= vm.userPropertyTypeAccess.length - 1; i++) {
        if (
          arr[i].propertyTypeAccessLevel === access.propertyTypeAccessLevel &&
          arr[i].propertyTypeAccessValue === access.propertyTypeAccessValue
        ) {
          vm.userPropertyTypeAccess.splice(i, 1);
        }
      }
      console.log("New access: ", vm.userPropertyTypeAccess);
    };

    vm.showCrossForFilter = function (data) {
      if (data == "user") {
        vm.showCrossForUser = true;
      }
    };

    vm.handleChangeCategory = (id) => {
      let checked = $(`#${id}`)[0].checked;
      if (checked) {
        let checkboxes = $(`#ul-${id} input[type="checkbox"]`);
        checkboxes.each(function () {
          console.log("This", $(this)[0].checked);
          if (!$(this)[0].checked) {
            $(this).trigger("onchange");
          }
        });
        $(`#ul-${id} input[type="checkbox"]`).prop("checked", true);
        $(`#ul-${id}`).removeClass("d-none");
      } else {
        let checkboxes = $(`#ul-${id} input[type="checkbox"]`);
        checkboxes.each(function () {
          console.log("This", $(this)[0].checked);
          if ($(this)[0].checked) {
            $(this).trigger("onchange");
          }
        });
        $(`#ul-${id} input[type="checkbox"]`).prop("checked", false);
      }
    };

    vm.showHideSubCat = (id) => {
      console.log("id", id);
      $(`#ul-${id}`).toggleClass("d-none");
    };

    vm.clearDropdown = function (data) {
      if (data == "user") {
        vm.selectedRoleForFilter.selected = "";
        vm.showCrossForUser = false;
        vm.search = "";
        vm.getAllUsers(1, vm.sortBy, vm.sortForm);
      }
    };
  }
})();
