(function () {
    'use strict';
    angular
        .module('app')
        .filter('propsFilter', propsFilter)
        .controller('ViewProcessCtrl', ViewProcessCtrl);
        function propsFilter() {
            return filter;
            function filter(items, props) {
                var out = [];

                if (angular.isArray(items)) {
                  items.forEach(function(item) {
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


    ViewProcessCtrl.$inject = ['$scope', '$http', '$rootScope', '$location'];

    function ViewProcessCtrl($scope, $http, $rootScope, $location) {
        // console.log('ViewProcessCtrl');
        var vm = $scope;
        $rootScope.showBackBtn = false;
        vm.processList = [];
        vm.processToDelete = {};
        vm.indexToDelete = "";
        vm.search = '';
        vm.showCrossForProcess = false;
        $rootScope.editTicket = false;
        $rootScope.processEdit = false;
        vm.search = "";
        vm.sortBy = '_id';
        vm.sortForm = -1;

        // notifications
        vm.SuccessAlertBox = "";
        vm.ErrorAlertBox = ";"
        vm.ErrorSaveMessage = "";
        vm.SucessSaveMessage = "";
        vm.SuccessAlertBox = document.getElementById("SuccessAlertBox");
        vm.ErrorAlertBox = document.getElementById("ErrorAlertBox");

        vm.clearSearchBox = function () {
            console.log(vm.search.length);
            if (vm.search.length == 0) {
                vm.getAllProcesses(1, vm.sortBy, vm.sortForm);
            }
        }

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
        vm.pageIndex = 1;
        vm.totalRecords = 0;
        vm.tableData = []
        vm.paginationCount;
        vm.currentArrayIndex = 0;
        vm.selectedPartForFilter = {};
        vm.partListForFilter = [];

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
            vm.getAllProcesses(vm.mainArray[vm.currentArrayIndex][0], vm.sortBy, vm.sortForm)
        }

        vm.nextPaginationArray = function () {
            vm.currentArrayIndex = vm.currentArrayIndex + 1;
            vm.getAllProcesses(vm.mainArray[vm.currentArrayIndex][0], vm.sortBy, vm.sortForm)
        }
        // pagination ends

        // get all parts' list
        vm.getAllParts = function () {
            $http.post('/part/getAll', {}).then(function (res) {
                // console.log(res.data.success);
                if (res.data.success) {
                    // $rootScope.partList = res.data.docs;
                    for (var i = 0; i < res.data.docs.length; i++) {
                        vm.partListForFilter.push(res.data.docs[i].name)
                    }
                }
            });
        }
        vm.getAllParts();

        // vm.applyFilter = function (currentPageIndex, sortForm, sortBy) {
        //     console.log(vm.selectedLocationForFilter);

        //     $http.post('/process/getAllByFilter', {
        //         'param': {
        //             'part': vm.selectedPartForFilter,
        //         },
        //         'sortForm': sortForm,
        //         'sortBy': sortBy,
        //         'pageIndex': currentPageIndex,
        //         'recordLimit': 10
        //     }).then(function (res) {
        //         // console.log(res.data.docs);
        //         vm.ticketsList = res.data.docs;
        //         if (res.data.success) {
        //             vm.pageIndex = currentPageIndex;
        //             vm.tableData = [];
        //             vm.totalRecords = res.data.count;
        //             vm.paginationCount = Math.ceil(vm.totalRecords / 10);
        //             vm.paginationArray = new Array(vm.paginationCount)
        //             vm.processList = res.data.docs;
        //             vm.createPaginationArray();
        //         }
        //     });
        // }

        

        vm.getAllProcesses = function (currentPageIndex, sortBy, sortForm) {
            $http.post('/process/getAll', {
                'param': {
                    'search': vm.search,
                    'part': vm.selectedPartForFilter,
                },
                'sortForm': sortForm,
                'sortBy': sortBy,
                'pageIndex': currentPageIndex,
                'recordLimit': 10
            }).then(function (res) {
                // console.log(res.data.docs);
                if (res.data.success) {
                    vm.pageIndex = currentPageIndex;
                    vm.tableData = [];
                    vm.totalRecords = res.data.count;
                    vm.paginationCount = Math.ceil(vm.totalRecords / 10);
                    vm.paginationArray = new Array(vm.paginationCount)
                    vm.processList = res.data.docs;
                    vm.createPaginationArray();

                    // vm.processList = res.data.docs;
                }
            });
        }
        vm.getAllProcesses(1, vm.sortBy, vm.sortForm);

        vm.showAsc = true;
        // sortForm is asc or dsc
        vm.changeSort = function (sortBy) {
            console.log(sortBy);
            if (vm.showAsc) {
                vm.showAsc = false;
                vm.sortBy = sortBy;
                vm.sortForm = 1
                vm.getAllProcesses(1, vm.sortBy, vm.sortForm);
            } else {
                vm.showAsc = true;
                vm.sortBy = sortBy;
                vm.sortForm = -1
                vm.getAllProcesses(1, vm.sortBy, vm.sortForm);
            }
        }

        vm.getProcessToUpdate = function (process, index) {
            // console.log(process, index);
            $rootScope.process = process;
            $rootScope.stageList = process.stages;
            $rootScope.processEdit = true;

            // code to prefill the dropdown
            $rootScope.multipleParts.selectedPartsWithGroupBy = [];
            var indexList = []
            for (var temp = 0; temp < $rootScope.process['parts'].length; temp++) {
                indexList.push($rootScope.partList.map(function (x) { return x.name }).indexOf($rootScope.process['parts'][temp]['name']))
            }
            for (var temp = 0; temp < indexList.length; temp++) {
                $rootScope.multipleParts.selectedPartsWithGroupBy.push($rootScope.partList[indexList[temp]])
            }

            $location.path('/app/add-process');
        }

        vm.getProcessToDelete = function (process, index) {
            // console.log(process, index);
            vm.processToDelete = process;
            vm.indexToDelete = index;
        }

        vm.deleteProcess = function () {
            $http.post('/process/delete', {
                "process": vm.processToDelete
            }).then(function (res) {
                if (res.data.success) {
                    // console.log(res);
                    vm.processList.splice(vm.indexToDelete, 1);
                    vm.createSuccess(res.data.message);
                } else {
                    vm.createError(res.data.message);
                }
            });
        }

        vm.showCrossForFilter = function (data) {
            if (data == 'process') {
                vm.showCrossForProcess = true;
            }
        }

        vm.clearDropdown = function (data) {
            if (data == 'process') {
                vm.selectedPartForFilter.selected = ""
                vm.showCrossForProcess = false;
                vm.search = "";
                vm.getAllProcesses(1, vm.sortBy, vm.sortForm);
            }
        }

    }
})();
