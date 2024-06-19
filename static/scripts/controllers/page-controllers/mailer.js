(function () {
    'use strict';
    angular
        .module('app', ['ui.bootstrap'])
        .controller('MailerCtrl', MailerCtrl);
    MailerCtrl.$inject = ['$scope', '$http', '$rootScope', '$compile', '$location'];

    function MailerCtrl($scope, $http, $rootScope, $compile, $location) {
        var vm = $scope;
        vm.typeaheadEditable = false;
        vm.projectTypesList = ['Residential Plots', 'Villas', 'Apartments', 'Floors', 'Commercial Land', 'Commercial Office', 'Retail Shop', 'Serviced Apartments', 'Industrial Land', 'Penthouse', 'Duplex', 'Farm house'];
        vm.set_default = function () {
            vm.data = {};
        }
        vm.set_default();
        vm.tableInit = false
        // For Data Table
        vm.table = {
            title: "Property",
            limit: "10",
            fields: [["Property Name", "name"], ["Project's Name", "project"], ["Builder's Name", "builder"], ["Property Type", "property_type"]],
            results: [],
            query: "",
            total: 0,
            sort: "",
            skip: 1,
            refresh: 1,
        }
        vm.$watch('table.limit', function (newValue, oldValue) {
            if (newValue != oldValue) { vm.getData(); }
        });
        vm.$watch('table.query', function (newValue, oldValue) {
            if (newValue != oldValue) { vm.getData(); }
        });
        vm.$watch('table.skip', function (newValue, oldValue) {
            if (newValue != oldValue) { vm.getData(); }
        });
        vm.$watch('table.refresh', function (newValue, oldValue) {
            if (newValue != oldValue) { vm.getData(); }
        });
        vm.$watch('table.sort', function (newValue, oldValue) {
            if (newValue != oldValue) { vm.table.skip = 1; vm.getData(); }
        });
        vm.$watch('data.state', function (newValue, oldValue) {
            if (newValue != oldValue) { delete vm.data.district, delete vm.data.city }
        });
        vm.$watch('data.district', function (newValue, oldValue) {
            if (newValue != oldValue) { delete vm.data.city }
        });

        vm.getBuilders = function (val) {
            return $http.post('/api/builder/typeahead', {
                data: val
            }).then(function (response) {
                return response.data.results.map(function (item) {
                    return item.name;
                });
            });
        };
        vm.getProjects = function (val) {
            return $http.post('/api/project/typeahead', {
                data: val
            }).then(function (response) {
                return response.data.results.map(function (item) {
                    return item.name;
                });
            });
        };
        vm.getStates = function (val) {
            return $http.post('/api/state/typeahead', {
                data: val
            }).then(function (response) {
                return response.data.results.map(function (item) {
                    return item.name;
                });
            });
        };
        vm.getDistricts = function (val) {
            return $http.post('/api/district/typeahead', {
                data: val,
                state: vm.data.state
            }).then(function (response) {
                return response.data.results.map(function (item) {
                    return item.name;
                });
            });
        };
        vm.getCities = function (val) {
            return $http.post('/api/city/typeahead', {
                data: val,
                state: vm.data.state,
                district: vm.data.district
            }).then(function (response) {
                return response.data.results.map(function (item) {
                    return item.name;
                });
            });
        };


        vm.getData = function () {
            Object.keys(vm.data).forEach((key) => (vm.data[key] == null) && delete vm.data[key]);
            vm.tableInit = true
            let payload = { limit: parseInt(vm.table.limit) }
            if (vm.table.query.length > 0) { payload.query = vm.table.query }
            if (vm.table.skip > 1) { payload.skip = vm.table.skip - 1 }
            if (vm.table.sort.length > 1) { payload.sort = vm.table.sort }
            payload.status = "2"
            payload.filter = {};
            Object.assign(payload.filter, vm.data)
            delete payload.filter['name'];
            delete payload.filter['email'];
            delete payload.filter['phone'];
            $http.post('/api/property/get', payload).then(function (res) {
                if (res.data.success) {
                    vm.table.results = res.data.results;
                    vm.table.total = res.data.total;
                }
            });
        }
        vm.saveInquiry = function () {
            $http.post("/api/mailer/add", vm.data).then(function (res) {
                console.log("successfully submitted : ", res)
            }, function (err) {
                console.log("error occured : ", err)
            })
        }

        vm.sendResponse = function () {
            Object.keys(vm.data).forEach((key) => (vm.data[key] == null || vm.data[key] == "") && delete vm.data[key]);
            if(vm.data['name']=== undefined){alert('Please Enter Name'); return;}
            if(vm.data['email']=== undefined){alert('Please Enter Email'); return;}
            if(vm.data['phone']=== undefined){alert('Please Enter Phone'); return;}
            $http.post('/api/mailer/sendResponse',vm.data).then(function(res){
                console.log("response : ", res)
            }, function(err){
                console.log('err : ', err)
            })
        }
    }
})();
