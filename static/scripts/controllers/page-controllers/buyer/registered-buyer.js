(function () {
    'use strict';
    angular
        .module('app')
        .controller('RegisteredBuyerCtrl', RegisteredBuyerCtrl);

    RegisteredBuyerCtrl.$inject = ['$scope', '$http', '$rootScope'];

    function RegisteredBuyerCtrl($scope, $http, $rootScope) {
        var vm = $scope;
        vm.modalData = {}
        vm.userViewHistory = undefined;
        vm.userSearchHistory = undefined;
        vm.bmfilter = "properties"
        vm.search = "";
        vm.sortForm = -1;
        vm.sortBy = "createdAt";
        vm.sort = 'createdAt';
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
            vm.SucessSaveMessage = success;
            vm.SuccessAlertBox.style.display = "inline";
            setTimeout(function () { vm.SuccessAlertBox.style.display = "none"; }, 4000);
        }

        // pagination starts
        vm.pageIndex = 1;
        vm.totalRecords = 0;
        vm.tableData = []
        vm.paginationCount;
        vm.currentArrayIndex = 0;

        vm.clearSearchBox = function () {
            if (vm.search.length == 0) {
                vm.getAll(1, vm.sortBy, vm.sortForm);
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
            vm.currentArrayIndex = vm.currentArrayIndex - 1;
            vm.getAll(vm.mainArray[vm.currentArrayIndex][0], vm.sortBy, vm.sortForm)
        }

        vm.nextPaginationArray = function () {
            vm.currentArrayIndex = vm.currentArrayIndex + 1;
            vm.getAll(vm.mainArray[vm.currentArrayIndex][0], vm.sortBy, vm.sortForm)
        }

        // pagination ends



        // get all list
        vm.getAll = function (currentPageIndex, sortBy, sortForm, filter) {
            $http.post('/api/buyer/get/registered',
                {
                    'param': {
                        'search': vm.search,
                    },
                    'sortBy': sortBy,
                    'sortForm': sortForm,
                    'pageIndex': currentPageIndex,
                    'recordLimit': 10,
                    filter: filter,
                }
            ).then(function (res) {
                if (res.data.success) {
                    vm.pageIndex = currentPageIndex;
                    vm.tableData = [];
                    vm.totalRecords = res.data.count;
                    vm.paginationCount = Math.ceil(vm.totalRecords / 10);
                    vm.paginationArray = new Array(vm.paginationCount)
                    vm.usersList = res.data.docs;
                    console.log('vm.usersList : ',vm.usersList)
                    vm.createPaginationArray();
                }
            });
        }
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
        vm.setModalData = function(index){
            vm.modalData = vm.usersList[index]
            if (vm.modalData['viewHistory']){
                if (Object.keys(vm.modalData['viewHistory']).length > 0){
                    vm.userViewHistory = Object.keys(vm.modalData['viewHistory'])
                }
            }
            if (vm.modalData['searchHistory']){
                if (Object.keys(vm.modalData['searchHistory']).length > 0){
                    vm.userSearchHistory = Object.keys(vm.modalData['searchHistory'])
                }
            }
            console.log('vm.modalData : ',vm.modalData)
        }

        vm.getLink = function (prop) {
            console.log('case id', prop.case_id)
            var caseId = prop.case_id
            $http.post('/api/customer/getLink',
                {
                    caseId: caseId,
                    caseIdDisplay:prop.case_id_display,
                }
            ).then(function (res) {
                console.log('res', res)
                if (res.data.success) {
                    var fullUrl = "www.assetzilla.com" + res.data.url
                    console.log('fullurl', fullUrl)
                    window.open(res.data.url, '_blank');
                }
                else {
                    window.open("/page-not-found", '_blank');
                }    
                // if (res.data.success) {
                //     console.log('res')
                // }
            });
        }
    }
})();
