(function () {
    'use strict';
    angular
        .module('app')
        .filter('propsFilter', propsFilter)
        .controller('AddArticleCtrl', AddArticleCtrl);

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

    AddArticleCtrl.$inject = ['$scope', '$http', '$rootScope'];

    function AddArticleCtrl($scope, $http, $rootScope) {
        var vm = $scope;
        vm.edit = false;
        $rootScope.editTicket = false;
        $rootScope.processEdit = false;
        $rootScope.showBackBtn = false;
        vm.search = "";
        vm.submitConfirmation = false;
        vm.sortBy = '_id';
        vm.sortForm = -1;
        vm.project = {};
        vm.roles = [];
        vm.projectsList = [];
        vm.indexToUpdate = "";
        vm.rolesForFilter = [];
        vm.showCrossForProject = false;
        vm.selectedRoleForFilter = {};
        vm.projectToDelete = {};
        
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
        vm.tableHeading = "Basic Table"
        vm.pageIndex = 1;
        vm.totalRecords = 0;
        vm.tableData = []
        vm.paginationCount;
        vm.currentArrayIndex = 0;

        vm.clearSearchBox = function () {
            if (vm.search.length == 0) {
                vm.getAllProjects(1, vm.sortBy, vm.sortForm);
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
            vm.getAllProjects(vm.mainArray[vm.currentArrayIndex][0], vm.sortBy, vm.sortForm)
        }

        vm.nextPaginationArray = function () {
            vm.currentArrayIndex = vm.currentArrayIndex + 1;
            vm.getAllProjects(vm.mainArray[vm.currentArrayIndex][0], vm.sortBy, vm.sortForm)
        }

        // pagination ends


        vm.submitConfirmationFn = function () {
            vm.submitConfirmation = true;
        }

        vm.blankFormFn = function () {
            vm.project = {};
            vm.project.role = "";
            vm.submitConfirmation = false;
        }

        vm.edit = false;
        vm.project = {};
        
        vm.createProject = function (project) {
            if (vm.edit) {
                vm.updateProject();
                return
            }
            $http.post('/project/createProject', vm.project).then(function (res) {
                vm.submitConfirmation = false;
                if (res.data.success) {
                    vm.createSuccess(res.data.message);
                    $('#addNewProjectModal').modal('hide');
                    vm.project = {};
                    vm.getAllProjects(1, vm.sortBy, vm.sortForm);
                } else {
                    vm.createError(res.data.message);
                }
            });
        }

        // get all Project list
        vm.getAllProjects = function (currentPageIndex, sortBy, sortForm) {
            $http.post('/project/getAll',
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
                    vm.pageIndex = currentPageIndex;
                    vm.tableData = [];
                    vm.totalRecords = res.data.count;
                    vm.paginationCount = Math.ceil(vm.totalRecords / 10);
                    vm.paginationArray = new Array(vm.paginationCount)
                    vm.projectsList = res.data.docs;
                    vm.createPaginationArray();
                }
            });
        }
        vm.getAllProjects(1, vm.sortBy, vm.sortForm);
        
        vm.submitConfirmationFn = function () {
            vm.submitConfirmation = true;
        }

        vm.showAsc = true;
        // sortForm is asc or dsc
        vm.changeSort = function (sortBy) {
            if (vm.showAsc) {
                vm.showAsc = false;
                vm.sortBy = sortBy;
                vm.sortForm = 1
                vm.getAllProjects(1, vm.sortBy, vm.sortForm);
            } else {
                vm.showAsc = true;
                vm.sortBy = sortBy;
                vm.sortForm = -1
                vm.getAllProjects(1, vm.sortBy, vm.sortForm);
            }
        }

        vm.getProjectToUpdate = function (project, index) {
            vm.edit = true;
            vm.indexToUpdate = index;
            vm.project = project;
        }

        vm.updateProject = function () {
            $http.post('/project/edit', {
                project: vm.project
            }).then(function (res) {
                vm.submitConfirmation = false;
                if (res.data.success) {
                    vm.edit = false;
                    vm.projectsList[vm.indexToUpdate].name = vm.project.name;
                    vm.projectsList[vm.indexToUpdate].email = vm.project.email;
                    vm.projectsList[vm.indexToUpdate].role = vm.project.role;
                    vm.project = {};
                    vm.createSuccess(res.data.message);
                    // document.getElementById("closeCreateEditModal").click();
                } else {
                    vm.createError(res.data.message);
                }
            });
        }
        
        // delete machine
        vm.getProjectToDelete = function (project, index) {
            vm.indexToDelete = index;
            vm.projectToDelete = project;
        }

        vm.deleteProjectFn = function () {
            $http.post('/project/delete', {
                "project": vm.projectToDelete
            }).then(function (res) {
                if (res.data.success) {
                    vm.createSuccess(res.data.message);
                    vm.projectsList.splice(vm.indexToDelete, 1);
                } else {
                    vm.createError(res.data.message);
                }
            });
        }

        vm.showCrossForFilter = function (data) {
            if (data == 'project') {
                vm.showCrossForProject = true;
            }
        }

        vm.clearDropdown = function (data) {
            if (data == 'project') {
                vm.selectedRoleForFilter.selected = ""
                vm.showCrossForProject = false;
                vm.search = "";
                vm.getAllProjects(1, vm.sortBy, vm.sortForm);
            }
        }
        
    }
})();
