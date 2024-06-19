(function () {
    'use strict';
    angular
        .module('app', ['ui.bootstrap'])
        .controller('AddBuilderCtrl', AddBuilderCtrl)
        .directive('fileModel', ['$parse', function ($parse) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    var model = $parse(attrs.fileModel);
                    var modelSetter = model.assign;

                    element.bind('change', function () {
                        scope.$apply(function () {
                            modelSetter(scope, element[0].files[0]);
                        });
                    });
                }
            };
        }]);



    AddBuilderCtrl.$inject = ['$scope', '$http', '$rootScope', '$compile', '$location'];

    function AddBuilderCtrl($scope, $http, $rootScope, $compile, $location) {
        var vm = $scope;
        vm.typeaheadEditable = false;
        vm.set_default = function () {

            vm.data = {};
            vm.data.is_live = 1;
            vm.data.country = "india"
            vm.data.local_presence = [""]
        }
        vm.set_default();
        vm.loader = false;

        function getId(url) { // function convert youtube link into embeded one
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
            const match = url.match(regExp);

            return (match && match[2].length === 11)
                ? match[2]
                : null;
        }

        vm.add = function () {
            if (vm.data.video_url) { // convert youtube link into embeded one
                const videoId = getId(vm.data.video_url);
                const embedLink = 'https://www.youtube.com/embed/' + videoId;
                vm.data.video_url = embedLink;
                console.log('link', embedLink)
            }

            vm.loader = true;
            if (vm.data.name == undefined) { alert("Please enter a name"); vm.loader = false; return }
            if (vm.data.state == undefined) { alert("Please Select an Option for state from Dropdown"); vm.loader = false; return }
            if (vm.data.website == undefined) { alert("Please enter a website"); vm.loader = false; return }
            // if (vm.data.district == undefined) { alert("Please Select an Option for district from Dropdown"); vm.loader = false; return }
            // if (vm.data.city == undefined) { alert("Please Select an Option for city from Dropdown"); vm.loader = false; return }
            // if (vm.data.subcity == undefined) { alert("Please Select an Option for subcity from Dropdown"); vm.loader = false; return }
            if (vm.data.logo == undefined) { alert("Please Select a Logo"); vm.loader = false; return }
            if (vm.data.phone){
                // const regExp = /((\+*)((0[ -]*)*|((91 )*))((\d{12})+|(\d{10})+))|\d{5}([- ]*)\d{6}/g
                // const match = vm.data.phone.match(regExp);
                // if (!match){
                //   alert("Invalid Phone Number");
                //   vm.loader = false;
                //   return;
                // }
              }
            if (vm.data.email){
                const regExp = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
                const match = vm.data.email.match(regExp);
                console.log(match)
                if (!match){
                    alert("Invalid Email");
                    vm.loader = false;
                    return;
                }else{
                    console.log("valid email");
                }
                
            }
            let local_presence = []
            
            vm.data.local_presence.forEach(element => {
                if (element && element.length > 1) {
                    local_presence.push(element)
                }

            });
            vm.data.local_presence = local_presence;
            var fd = new FormData();
            fd.append("file", vm.data.logo);
            $http.post("/api/builder/multer", fd, {
                headers: { 'Content-Type': undefined },
                transformRequest: angular.identity
            }).then(function (res) {
                if (res.data.success) {
                    vm.data.logo = res.data.results[0];
                    $http.post('/api/builder/add', vm.data).then(function (res) {
                        alert(res.data.message);
                        if (res.data.success) {
                            window.location = ("/admin-panel#/app/builder/view")
                        }
                    }, function(error){
                        vm.loader = false;
                        $rootScope.createError("Some error occured while adding Builder ..")
                    });
                }
            }, function (error) {
                vm.loader = false;
                $rootScope.createError("Some error occured while uploading Builder images ..")
            })
        }

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
        vm.getSubcities = function (val) {
            return $http.post('/api/subcity/typeahead', {
                data: val,
                state: vm.data.state,
                district: vm.data.district,
                city: vm.data.city
            }).then(function (response) {
                return response.data.results.map(function (item) {
                    return item.name;
                });
            });
        };
        vm.getLocalPresence = function (val) {
            return $http.post('/api/city/typeahead', {
                data: val,
            }).then(function (response) {
                return response.data.results.map(function (item) {
                    return item.name;
                });
            });
        }

    }
})();