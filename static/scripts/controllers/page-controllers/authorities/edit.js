(function () {
  "use strict";
  angular
    .module("app", ["summernote", "ui.bootstrap"])
    .controller("EditAuthorityCtrl", EditAuthorityCtrl)
    .directive("fileModel", [
      "$parse",
      function ($parse) {
        return {
          restrict: "A",
          link: function (scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;

            element.bind("change", function () {
              scope.$apply(function () {
                modelSetter(scope, element[0].files[0]);
              });
            });
          },
        };
      },
    ]);

  EditAuthorityCtrl.$inject = [
    "$scope",
    "$http",
    "$rootScope",
    "$compile",
    "$location",
  ];

  function EditAuthorityCtrl($scope, $http, $rootScope, $compile, $location) {
    var vm = $scope;
    vm.typeaheadEditable = false;
    vm.change_images = [false, false, false, false]; // 0- master_plan_with_years_image, 1- area_covered_image, 2- metro_routes_image, 3- logo
    vm.new_logo = [{}];
    vm.new_master_plan_with_years_image = [{}];
    vm.new_area_covered_image = [{}];
    vm.new_metro_routes_image = [{}];
    vm.count = 0;
    vm.set_data = function () {
      vm.data = {};
      let url = window.location.hash;
      url = url.split("?")[1].split("=")[1];
      $http
        .post("/api/authority/get-doc", { url: decodeURIComponent(url) })
        .then(function (res) {
          if (res.data.success) {
            vm.data = res.data.data;
            console.log("vm.data", vm.data);
          }
        });
    };
    vm.loader = false;

    vm.$watch("count", function (newValue, oldValue) {
      if (newValue == 4) {
        $http.post("/api/authority/edit", vm.data).then(
          function (res) {
            alert(res.data.message);
            if (res.data.success) {
              window.location = "/admin-panel#/app/authority/view";
            }
          },
          function (error) {
            vm.loader = false;
            $rootScope.createError(
              "Some error occured while editing authorities .."
            );
          }
        );
      }
    });

    function getId(url) {
      // function convert youtube link into embeded one
      const regExp =
        /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);

      return match && match[2].length === 11 ? match[2] : null;
    }
    vm.isPasting = false;
    vm.onPasting = (evt) => {
      if (!evt.originalEvent.clipboardData.getData('text')){
        vm.isPasting = true;
        console.log("pasting image");
      } else {
        vm.isPasting = false;
        console.log("not pasting image");
      }
    };
    vm.imageUpload = (files, field) => {
      console.log(vm.isPasting);
      if (vm.isPasting && false) {
        vm.isPasting = false;
        console.log(vm.isPasting);
      } else if (files.toString() === "[object FileList]") {
        console.log("Hi", files, field);
        // console.log(vm.data[field]);
        vm.loader = true;
        let fds = new FormData();
        for (const image of files) {
          if ("name" in image) {
            if (image.type === "image/jpeg" || image.type === "image/png") {
              fds.append("file", image);
            } else {
              vm.loader = false;
              alert("Please upload only image files");
              return;
            }
          }
        }

        $http
          .post("/api/authority/summernoteMulter", fds, {
            headers: { "Content-Type": undefined },
            transformRequest: angular.identity,
          })
          .then(
            function (res) {
              console.log(res);
              res.data.results.forEach((i) => {
                // vm.data[field] += `<img src='https://assetzilla-bucket.s3.amazonaws.com/dyn-res/authority/${i}' style="width:100%"/>`;
                let url = `https://d13ir9awo5x8gl.cloudfront.net/dyn-res/authority/${i}`;
                let image = $("<img>").attr("src", url).css("max-width", "100%");
                console.log(image[0]);
                $(`#${field}`).summernote("insertNode", image[0]);
              });
              vm.loader = false;
            },
            function (error) {
              vm.loader = false;
              $rootScope.createError(
                "Some error occurred while uploading Area covered images .."
              );
            }
          );
      }
    };

    vm.edit = function () {
      if (vm.data.video_url && vm.data.video_url.length > 0) {
        // convert youtube link into embeded one
        const videoId = getId(vm.data.video_url);
        const embedLink = "https://www.youtube.com/embed/" + videoId;
        vm.data.video_url = embedLink;
        console.log(vm.data.video_url);
      } else {
        vm.data.video_url = "";
      }
      vm.loader = true;
      if (vm.data.name === undefined) {
        alert("Please enter a name");
        vm.loader = false;
        return;
      }
      if (vm.data.state === undefined) {
        alert("Please Select an Option for state from Dropdown");
        vm.loader = false;
        return;
      }
      // if (vm.data.district == undefined) { alert("Please Select an Option for district from Dropdown"); vm.loader = false; return }
      if (vm.data.website === undefined) {
        alert("Please enter website");
        vm.loader = false;
        return;
      }
      console.log(vm);
      if (vm.new_logo[0] === undefined) {
        alert("Please Select a Logo");
        vm.loader = false;
        return;
      }
      if (vm.data.phone) {
        const phones = vm.data.phone.replaceAll(/\s/g, "").split(",");
        const regExp =
          /((\+*)((0[ -]*)*|((91 )*))((\d{12})+|(\d{10})+))|\d{5}([- ]*)\d{6}/g;
        let match = true;
        console.log(phones);
        for (let phone of phones) {
          const valid = true; //phone.match(regExp);
          if (!valid) {
            alert(`${phone} is an invalid Phone Number`);
            match = false;
            break;
          }
        }
        if (!match) {
          vm.loader = false;
          return;
        }
      }
      if (vm.data.email) {
        const regExp = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
        const match = vm.data.email.match(regExp);
        console.log(match);
        if (!match) {
          alert("Invalid Email");
          vm.loader = false;
          return;
        } else {
          console.log("valid email");
        }
      }
      vm.count = 0;
      if (vm.change_images.includes(true)) {
        // logo
        if (vm.change_images[3] && "name" in vm.new_logo[0]) {
          var fd = new FormData();
          if (
            vm.new_logo[0].type === "image/jpeg" ||
            vm.new_logo[0].type === "image/png"
          ) {
            fd.append("file", vm.new_logo[0]);
          } else {
            vm.loader = false;
            alert("Please upload only image files");
            return;
          }

          fd.append("file", vm.new_logo[0]);
          $http
            .post("/api/authority/multer", fd, {
              headers: { "Content-Type": undefined },
              transformRequest: angular.identity,
            })
            .then(
              function (res) {
                if (res.data.success) {
                  vm.data.new_logo = res.data.results[0];
                  vm.count = vm.count + 1;
                }
              },
              function (error) {
                vm.loader = false;
                $rootScope.createError(
                  "Some error occured while uploading logo .."
                );
              }
            );
        } else {
          vm.count = vm.count + 1;
        }
        // master_plan_with_years_image
        if (
          vm.change_images[0] &&
          "name" in vm.new_master_plan_with_years_image[0]
        ) {
          var fd = new FormData();
          // console.log('vm.new_master_plan_with_years_image', vm.new_master_plan_with_years_image)
          if (
            vm.new_master_plan_with_years_image[0].type === "image/jpeg" ||
            vm.new_master_plan_with_years_image[0].type === "image/png"
          ) {
            fd.append("file", vm.new_master_plan_with_years_image[0]);
          } else {
            vm.loader = false;
            alert("Please upload only image files");
            return;
          }

          fd.append("file", vm.new_master_plan_with_years_image[0]);
          $http
            .post("/api/authority/multer", fd, {
              headers: { "Content-Type": undefined },
              transformRequest: angular.identity,
            })
            .then(
              function (res) {
                if (res.data.success) {
                  vm.data.master_plan_with_years_image[0] = res.data.results[0];
                  vm.count = vm.count + 1;
                }
              },
              function (error) {
                vm.loader = false;
                $rootScope.createError(
                  "Some error occured while uploading Master plan images .."
                );
              }
            );
        } else {
          vm.count = vm.count + 1;
        }
        // area_covered_image
        if (vm.change_images[1] && "name" in vm.new_area_covered_image[0]) {
          var fd = new FormData();
          if (
            vm.new_area_covered_image[0].type === "image/jpeg" ||
            vm.new_area_covered_image[0].type === "image/png"
          ) {
            fd.append("file", vm.new_area_covered_image[0]);
          } else {
            vm.loader = false;
            alert("Please upload only image files");
            return;
          }

          fd.append("file", vm.new_area_covered_image[0]);
          $http
            .post("/api/authority/multer", fd, {
              headers: { "Content-Type": undefined },
              transformRequest: angular.identity,
            })
            .then(
              function (res) {
                if (res.data.success) {
                  vm.data.area_covered_image[0] = res.data.results[0];
                  vm.count = vm.count + 1;
                }
              },
              function (error) {
                vm.loader = false;
                $rootScope.createError(
                  "Some error occured while uploading area covered images .."
                );
              }
            );
        } else {
          vm.count = vm.count + 1;
        }
        // new_metro_routes_image
        if (vm.change_images[2] && "name" in vm.new_metro_routes_image[0]) {
          var fd = new FormData();
          if (
            vm.new_metro_routes_image[0].type === "image/jpeg" ||
            vm.new_metro_routes_image[0].type === "image/png"
          ) {
            fd.append("file", vm.new_metro_routes_image[0]);
          } else {
            vm.loader = false;
            alert("Please upload only image files");
            return;
          }

          fd.append("file", vm.new_metro_routes_image[0]);
          $http
            .post("/api/authority/multer", fd, {
              headers: { "Content-Type": undefined },
              transformRequest: angular.identity,
            })
            .then(
              function (res) {
                if (res.data.success) {
                  vm.data.metro_routes_image[0] = res.data.results[0];
                  vm.count = vm.count + 1;
                }
              },
              function (error) {
                vm.loader = false;
                $rootScope.createError(
                  "Some error occured while uploading metro routes images .."
                );
              }
            );
        } else {
          vm.count = vm.count + 1;
        }
      } else {
        vm.count = 4;
      }
    };

    vm.uploadFiles = function (fileObject, variable) {};

    vm.set_data();
    vm.getStates = function (val) {
      return $http
        .post("/api/state/typeahead", {
          data: val,
        })
        .then(function (response) {
          return response.data.results.map(function (item) {
            return item.name;
          });
        });
    };
    vm.getDistricts = function (val) {
      return $http
        .post("/api/district/typeahead", {
          data: val,
          state: vm.data.state,
        })
        .then(function (response) {
          return response.data.results.map(function (item) {
            return item.name;
          });
        });
    };
  }
})();
