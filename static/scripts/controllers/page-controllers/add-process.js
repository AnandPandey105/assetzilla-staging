(function () {
    'use strict';
    angular
        .module('app')
        .filter('propsFilter', propsFilter)
        .controller('AddProcessCtrl', AddProcessCtrl);

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


    AddProcessCtrl.$inject = ['$scope', '$http', '$rootScope', '$location'];

    function AddProcessCtrl($scope, $http, $rootScope, $location) {
        // console.log('AddProcessCtrl');
        var vm = $scope;
        $rootScope.editTicket = false;
        $rootScope.showBackBtn = false;
        
        // notifications
        vm.SuccessAlertBox = "";
        vm.ErrorAlertBox = ";"
        vm.ErrorSaveMessage = "";
        vm.SucessSaveMessage = "";
        vm.SuccessAlertBox = document.getElementById("SuccessAlertBox");
        vm.ErrorAlertBox = document.getElementById("ErrorAlertBox");
        vm.submitConfirmation = false;
        vm.showClearParts = false;

        vm.onChangePartsDrpDwn = function() {
            if ($rootScope.multipleParts.selectedPartsWithGroupBy.length > 0) { 
                vm.showClearParts = true;    
            } else {
                vm.showClearParts = false;    
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

        // $rootScope.multipleParts = {};
        // $rootScope.process = {};
        // $rootScope.stageList = [{}];
        // vm.edit = false;

        if ($rootScope.processEdit) {} else {
            $rootScope.process = {};
            $rootScope.stageList = [{}];
            $rootScope.ticketToUpdate = {};
        }

        function patterncheck(arr) {

            var len = arr.length
            if (arr[len - 1].length < 1) {
                return false;
            } else {
                return true;
            }
        }

        vm.add_more_stage_field = function () { 
            // console.log("inside add more"); 
            $rootScope.stageList.push({}) 
        };

        vm.remove_input = function (i) {
            if ($rootScope.stageList.length > 1) {
                // console.log("Inside if cond")
                $rootScope.stageList.splice(i, 1)
            }
        };

        vm.submitConfirmationFn = function () {
            vm.submitConfirmation = true;
        }

        vm.addProcess = function () {
            if ($rootScope.processEdit) {
                vm.updateProcess();
                return
            }
            var len = $rootScope.stageList.length;
            for (var i=0; i<len; i++) {
                $rootScope.stageList[i].fileNames = [];
                $rootScope.stageList[i].filePath = '';
                $rootScope.stageList[i].comments = '';
                $rootScope.stageList[i].updatedBy = '';
            }
            console.log($rootScope.stageList);
            $http.post('/process/add', {
                process: $rootScope.process,
                stages: $rootScope.stageList,
                parts: $rootScope.multipleParts.selectedPartsWithGroupBy
            }).then(function (res) {
                vm.submitConfirmation = false;
                if (res.data.success) {
                    $rootScope.process = {};
                    $rootScope.stageList = [{}];
                    vm.createSuccess(res.data.message);
                    // vm.product.machines = vm.multipleMachines.selectedMachinesWithGroupBy;
                    // vm.productsList.push(vm.product);
                    // vm.product = {};
                    // vm.multipleMachines.selectedMachinesWithGroupBy = [];
                } else {
                    vm.createError(res.data.message);
                }

            });
        };

        vm.updateProcess = function () {
            // console.log($rootScope.process);
            $http.post('/process/edit', {
                process: $rootScope.process,
                stages: $rootScope.stageList,
                parts: $rootScope.multipleParts.selectedPartsWithGroupBy
            }).then(function (res) {
                vm.submitConfirmation = false;
                if (res.data.success) {
                    $rootScope.process = {};
                    $rootScope.stageList = [{}];
                    $location.path('/app/view-process');
                    vm.createSuccess(res.data.message);
                } else {
                    vm.createError(res.data.message);
                }

            });
        }

        // get all parts' list
        vm.getAllParts = function () {
            $http.post('/part/getAll', {
                'param': vm.search
            }).then(function (res) {
                // console.log(res.data.success);
                if (res.data.success) {
                    $rootScope.partList = res.data.docs;
                }
            });
        }
        vm.getAllParts();

        vm.blankForm = function () {
            $rootScope.process = {};
            $rootScope.processEdit = false;
            $rootScope.stageList = [{}];
            $rootScope.multipleParts.selectedPartsWithGroupBy = [];
            vm.submitConfirmation = false;
        }

        vm.clearPartsDrpDwn = function () {
            $rootScope.multipleParts.selectedPartsWithGroupBy = [];
        }

        // assinging values to multiple select dropdown
        // $rootScope.multipleParts.selectedPartsWithGroupBy = vm.productsList;

        // var vm = $scope;
        // vm.disabled = undefined;
        // vm.searchEnabled = undefined;

        // vm.enable = function () {
        //     vm.disabled = false;
        // };

        // vm.disable = function () {
        //     vm.disabled = true;
        // };

        // vm.enableSearch = function () {
        //     vm.searchEnabled = true;
        // }

        // vm.disableSearch = function () {
        //     vm.searchEnabled = false;
        // }

        // vm.clear = function () {
        //     vm.person.selected = undefined;
        //     vm.address.selected = undefined;
        //     vm.country.selected = undefined;
        // };

        // vm.someGroupFn = function (item) {
        //     if (item.name[0] >= 'A' && item.name[0] <= 'M')
        //         return 'From A - M';

        //     if (item.name[0] >= 'N' && item.name[0] <= 'Z')
        //         return 'From N - Z';
        // };

        // vm.personAsync = { selected: "wladimir@email.com" };
        // vm.peopleAsync = [];



        // vm.counter = 0;
        // vm.someFunction = function (item, model) {
        //     vm.counter++;
        //     vm.eventResult = { item: item, model: model };
        // };

        // vm.removed = function (item, model) {
        //     vm.lastRemoved = {
        //         item: item,
        //         model: model
        //     };
        // };
    }
})();
