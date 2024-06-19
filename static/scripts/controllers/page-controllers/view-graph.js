(function () {
    'use strict';
    angular
        .module('app')
        .filter('propsFilter', propsFilter)
        .controller('ViewGraphCtrl', ViewGraphCtrl);

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

    ViewGraphCtrl.$inject = ['$scope', '$http', '$rootScope'];

    function ViewGraphCtrl($scope, $http, $rootScope) {
        var vm = $scope;
        vm.edit = false;
        $rootScope.editTicket = false;
        $rootScope.processEdit = false;
        $rootScope.showBackBtn = false;
        vm.search = "";
        vm.submitConfirmation = false;
        vm.sortBy = '_id';
        vm.sortForm = -1;
        vm.graph = {};
        vm.roles = [];
        vm.graphsList = [];
        vm.indexToUpdate = "";
        vm.rolesForFilter = [];
        vm.showCrossForGraph = false;
        vm.selectedRoleForFilter = {};
        vm.graphToDelete = {};
        
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
                vm.getAllGraphs(1, vm.sortBy, vm.sortForm);
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
            vm.getAllGraphs(vm.mainArray[vm.currentArrayIndex][0], vm.sortBy, vm.sortForm)
        }

        vm.nextPaginationArray = function () {
            vm.currentArrayIndex = vm.currentArrayIndex + 1;
            vm.getAllGraphs(vm.mainArray[vm.currentArrayIndex][0], vm.sortBy, vm.sortForm)
        }

        // pagination ends


        vm.submitConfirmationFn = function () {
            vm.submitConfirmation = true;
        }

        vm.blankFormFn = function () {
            console.log('inside blank');
            vm.graph = {};
            vm.graph.role = "";
            vm.submitConfirmation = false;
        }

        vm.edit = false;
        vm.graph = {};
        
        vm.createGraph = function (graph) {
            console.log('graph is', graph);
            if (vm.edit) {
                vm.updateGraph();
                return
            }
            $http.post('/graph/createGraph', vm.graph).then(function (res) {
                // console.log(res);
                vm.submitConfirmation = false;
                if (res.data.success) {
                    // console.log(res.data.message);
                    vm.createSuccess(res.data.message);
                    $('#addNewGraphModal').modal('hide');
                    vm.graph = {};
                    vm.getAllGraphs(1, vm.sortBy, vm.sortForm);
                } else {
                    vm.createError(res.data.message);
                }
            });
        }

        // get all Graph list
        vm.getAllGraphs = function (currentPageIndex, sortBy, sortForm) {
            // console.log(vm.search);
            $http.post('/graph/getAll',
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
                    vm.graphsList = res.data.docs;
                    vm.createPaginationArray();

                    // vm.graphsList = res.data.docs;
                    // console.log(vm.graphsList);
                }
            });
        }
        vm.getAllGraphs(1, vm.sortBy, vm.sortForm);
        
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
                vm.getAllGraphs(1, vm.sortBy, vm.sortForm);
            } else {
                vm.showAsc = true;
                vm.sortBy = sortBy;
                vm.sortForm = -1
                vm.getAllGraphs(1, vm.sortBy, vm.sortForm);
            }
        }

        vm.getGraphToUpdate = function (graph, index) {
            console.log(graph, index);
            vm.edit = true;
            vm.indexToUpdate = index;
            vm.graph = graph;
        }

        vm.updateGraph = function () {
            // console.log(vm.graphsList[vm.indexToUpdate].name);
            // console.log(vm.location);
            console.log(vm.graph);
            $http.post('/graph/edit', {
                graph: vm.graph
            }).then(function (res) {
                vm.submitConfirmation = false;
                if (res.data.success) {
                    vm.edit = false;
                    vm.graphsList[vm.indexToUpdate].name = vm.graph.name;
                    vm.graphsList[vm.indexToUpdate].email = vm.graph.email;
                    vm.graphsList[vm.indexToUpdate].role = vm.graph.role;
                    vm.graph = {};
                    vm.createSuccess(res.data.message);
                    // document.getElementById("closeCreateEditModal").click();
                } else {
                    vm.createError(res.data.message);
                }
            });
        }
        
        // delete machine
        vm.getGraphToDelete = function (graph, index) {
            // console.log(graph, index);
            vm.indexToDelete = index;
            vm.graphToDelete = graph;
        }

        vm.deleteGraphFn = function () {
            $http.post('/graph/delete', {
                "graph": vm.graphToDelete
            }).then(function (res) {
                if (res.data.success) {
                    console.log(res);
                    vm.createSuccess(res.data.message);
                    vm.graphsList.splice(vm.indexToDelete, 1);
                } else {
                    vm.createError(res.data.message);
                }
            });
        }

        vm.showCrossForFilter = function (data) {
            if (data == 'graph') {
                vm.showCrossForGraph = true;
            }
        }

        vm.clearDropdown = function (data) {
            if (data == 'graph') {
                vm.selectedRoleForFilter.selected = ""
                vm.showCrossForGraph = false;
                vm.search = "";
                vm.getAllGraphs(1, vm.sortBy, vm.sortForm);
            }
        }
        
    }
})();
