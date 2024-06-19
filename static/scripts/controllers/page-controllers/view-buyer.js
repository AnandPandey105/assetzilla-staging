(function () {
    'use strict';
    angular
        .module('app')
        .filter('propsFilter', propsFilter)
        .controller('ViewBuyerCtrl', ViewBuyerCtrl);

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

    ViewBuyerCtrl.$inject = ['$scope', '$http', '$rootScope'];

    function ViewBuyerCtrl($scope, $http, $rootScope) {
        var vm = $scope;
        vm.edit = false;
        $rootScope.editTicket = false;
        $rootScope.processEdit = false;
        $rootScope.showBackBtn = false;
        vm.search = "";
        vm.submitConfirmation = false;
        vm.sortBy = '_id';
        vm.sortForm = -1;
        vm.buyer = {};
        vm.roles = [];
        vm.buyersList = [];
        vm.indexToUpdate = "";
        vm.rolesForFilter = [];
        vm.showCrossForBuyer = false;
        vm.selectedRoleForFilter = {};
        vm.buyerToDelete = {};
        
        vm.SuccessAlertBox = "";
        vm.ErrorAlertBox = ";"
        vm.ErrorSaveMessage = "";
        vm.SucessSaveMessage = "";
        vm.SuccessAlertBox = document.getElementById("SuccessAlertBox");
        vm.ErrorAlertBox = document.getElementById("ErrorAlertBox");

        /* create success notification */
        vm.createError = function (error) {
            vm.ErrorSaveMessage = error;
            vm.ErrorAlertBox.style.display = "inline";
            setTimeout(function () { vm.ErrorAlertBox.style.display = "none"; }, 4000);
        }

        /* create error notification */
        vm.createSuccess = function (success) {
            // console.log(success);
            vm.SucessSaveMessage = success;
            vm.SuccessAlertBox.style.display = "inline";
            // console.log(vm.SucessSaveMessage);
            setTimeout(function () { vm.SuccessAlertBox.style.display = "none"; }, 4000);
        }

        // pagination starts
        vm.tableHeading = "Basic Table"
        vm.pageIndex = 1;
        vm.totalRecords = 0;
        vm.tableData = []
        vm.paginationCount;
        vm.currentArrayIndex = 0;

        vm.clearSearchBox = function () {
            console.log(vm.search.length);
            if (vm.search.length == 0) {
                vm.getAllBuyers(1, vm.sortBy, vm.sortForm);
            }
        }


        vm.createPaginationArray = function () {
            vm.mainArray = []
            var temp = 0;
            var tempArray = []
            for (var count = 1; count <= vm.paginationCount; count++) {
                if (tempArray.length >= 5) {
                    vm.mainArray.push(tempArray)
                    tempArray = []
                }
                tempArray.push(count);
            }
            vm.mainArray.push(tempArray)
            if (vm.pageIndex == 1) {
                vm.currentArrayIndex = 0
            }
        }


        vm.previousPaginationArray = function () {
            // console.log("inside previous")
            vm.currentArrayIndex = vm.currentArrayIndex - 1;
            vm.getAllBuyers(vm.mainArray[vm.currentArrayIndex][0], vm.sortBy, vm.sortForm)
        }

        vm.nextPaginationArray = function () {
            vm.currentArrayIndex = vm.currentArrayIndex + 1;
            vm.getAllBuyers(vm.mainArray[vm.currentArrayIndex][0], vm.sortBy, vm.sortForm)
        }

        // pagination ends


        vm.submitConfirmationFn = function () {
            vm.submitConfirmation = true;
        }

        vm.blankFormFn = function () {
            console.log('inside blank');
            vm.buyer = {};
            vm.buyer.role = "";
            vm.submitConfirmation = false;
        }

        vm.edit = false;
        vm.buyer = {};
        
        vm.createBuyer = function (buyer) {
            console.log('buyer is', buyer);
            if (vm.edit) {
                vm.updateBuyer();
                return
            }
            $http.post('/buyer/createBuyer', vm.buyer).then(function (res) {
                // console.log(res);
                vm.submitConfirmation = false;
                if (res.data.success) {
                    // console.log(res.data.message);
                    vm.createSuccess(res.data.message);
                    $('#addNewBuyerModal').modal('hide');
                    vm.buyer = {};
                    vm.getAllBuyers(1, vm.sortBy, vm.sortForm);
                } else {
                    vm.createError(res.data.message);
                }
            });
        }

        // get all Buyer list
        vm.getAllBuyers = function (currentPageIndex, sortBy, sortForm) {
            // console.log(vm.search);
            $http.post('/buyer/getAll',
                {
                    'param': {
                        'search': vm.search,
                        'role': vm.selectedRoleForFilter,
                    },
                    'sortBy': sortBy,
                    'sortForm': sortForm,
                    'pageIndex': currentPageIndex,
                    'recordLimit': 10
                }
            ).then(function (res) {
                if (res.data.success) {
                    // console.log(res);
                    vm.pageIndex = currentPageIndex;
                    vm.tableData = [];
                    vm.totalRecords = res.data.count;
                    vm.paginationCount = Math.ceil(vm.totalRecords / 10);
                    vm.paginationArray = new Array(vm.paginationCount)
                    vm.buyersList = res.data.docs;
                    vm.createPaginationArray();

                    // vm.buyersList = res.data.docs;
                    // console.log(vm.buyersList);
                }
            });
        }
        vm.getAllBuyers(1, vm.sortBy, vm.sortForm);
        
        vm.submitConfirmationFn = function () {
            vm.submitConfirmation = true;
        }

        vm.showAsc = true;
        // sortForm is asc or dsc
        vm.changeSort = function (sortBy) {
            console.log(sortBy);
            if (vm.showAsc) {
                vm.showAsc = false;
                vm.sortBy = sortBy;
                vm.sortForm = 1
                vm.getAllBuyers(1, vm.sortBy, vm.sortForm);
            } else {
                vm.showAsc = true;
                vm.sortBy = sortBy;
                vm.sortForm = -1
                vm.getAllBuyers(1, vm.sortBy, vm.sortForm);
            }
        }

        vm.getBuyerToUpdate = function (buyer, index) {
            console.log(buyer, index);
            vm.edit = true;
            vm.indexToUpdate = index;
            vm.buyer = buyer;
        }

        vm.updateBuyer = function () {
            // console.log(vm.buyersList[vm.indexToUpdate].name);
            // console.log(vm.location);
            console.log(vm.buyer);
            $http.post('/buyer/edit', {
                buyer: vm.buyer
            }).then(function (res) {
                vm.submitConfirmation = false;
                if (res.data.success) {
                    vm.edit = false;
                    vm.buyersList[vm.indexToUpdate].name = vm.buyer.name;
                    vm.buyersList[vm.indexToUpdate].email = vm.buyer.email;
                    vm.buyersList[vm.indexToUpdate].role = vm.buyer.role;
                    vm.buyer = {};
                    vm.createSuccess(res.data.message);
                    // document.getElementById("closeCreateEditModal").click();
                } else {
                    vm.createError(res.data.message);
                }
            });
        }
        
        // delete machine
        vm.getBuyerToDelete = function (buyer, index) {
            // console.log(buyer, index);
            vm.indexToDelete = index;
            vm.buyerToDelete = buyer;
        }

        vm.deleteBuyerFn = function () {
            $http.post('/buyer/delete', {
                "buyer": vm.buyerToDelete
            }).then(function (res) {
                if (res.data.success) {
                    console.log(res);
                    vm.createSuccess(res.data.message);
                    vm.buyersList.splice(vm.indexToDelete, 1);
                } else {
                    vm.createError(res.data.message);
                }
            });
        }

        vm.showCrossForFilter = function (data) {
            if (data == 'buyer') {
                vm.showCrossForBuyer = true;
            }
        }

        vm.clearDropdown = function (data) {
            if (data == 'buyer') {
                vm.selectedRoleForFilter.selected = ""
                vm.showCrossForBuyer = false;
                vm.search = "";
                vm.getAllBuyers(1, vm.sortBy, vm.sortForm);
            }
        }
        
    }
})();
