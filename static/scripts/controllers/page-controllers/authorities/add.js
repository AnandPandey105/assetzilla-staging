(function () {
  "use strict";
  angular
    .module("app", ["summernote", "ui.bootstrap"])
    .controller("AddAuthorityCtrl", AddAuthorityCtrl)
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

  AddAuthorityCtrl.$inject = [
    "$scope",
    "$http",
    "$rootScope",
    "$compile",
    "$location",
  ];

  function AddAuthorityCtrl($scope, $http, $rootScope, $compile, $location) {
    var vm = $scope;
    vm.typeaheadEditable = false;
    var image_mapping = [
      "master_plan_with_years",
      "area_covered",
      "metro_routes",
    ];
    var uploaded_images = [false, false, false];
    vm.set_default = function () {
      vm.data = {};
      vm.data.images = {};
      vm.data.images.Authorities = ["", "", ""];
      vm.data.country = "india";
      vm.data.master_plan_with_years_image = [];
      vm.data.area_covered_image = [];
      vm.data.metro_routes_image = [];
      vm.tempCount = 0;
    };
    vm.loader = false;
    vm.$watch("tempCount", function (newValue, oldValue) {
      // console.log('newvalue', newValue)
      // console.log('oldValue', oldValue)
      if (newValue == 4) {
        console.log("inside if before api call add");
        console.log("vm.data before adding", vm.data);
        $http.post("/api/authority/add", vm.data).then(
          function (res) {
            vm.loader = false;
            alert(res.data.message);
            if (res.data.success) {
              window.location = "/admin-panel#/app/authority/view";
            }
          },
          function (error) {
            vm.loader = false;
            $rootScope.createError(
              "Some error occured while adding Authority .."
            );
          }
        );
      }
    });

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
      console.log("imageUpload",vm.isPasting, files.toString(), files);
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
                // vm.data[field] += `<img src='https://assetzilla-bucket.s3.amazonaws.com/dyn-res/authority/${i}' style="width:100%"/>`
                let url = `https://d13ir9awo5x8gl.cloudfront.net/dyn-res/authority/${i}`;
                let image = $("<img>").attr("src", url).css("max-width", "100%");
                console.log(image[0]);
                console.log($(`#${field}`))
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

    function getId(url) {
      // function convert youtube link into embeded one
      const regExp =
        /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);

      return match && match[2].length === 11 ? match[2] : null;
    }

    vm.add = function () {
      console.log("add called");

      if (vm.data.video_url) {
        // convert youtube link into embeded one
        const videoId = getId(vm.data.video_url);
        const embedLink = "https://www.youtube.com/embed/" + videoId;
        vm.data.video_url = embedLink;
        console.log("link", embedLink);
      }

      vm.loader = true;
      if (vm.data.name == undefined) {
        alert("Please enter a name");
        vm.loader = false;
        return;
      }
      if (vm.data.state == undefined) {
        alert("Please Select an Option for state from Dropdown");
        vm.loader = false;
        return;
      }
      // if (vm.data.district == undefined) { alert("Please Select an Option for district from Dropdown"); vm.loader = false; return }
      if (vm.data.website == undefined) {
        alert("Please enter website");
        vm.loader = false;
        return;
      }
      if (vm.data.logo == undefined) {
        alert("Please Select a Logo");
        vm.loader = false;
        return;
      }
      console.log(vm.data.email);
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
      if (vm.data.phone) {
        const phones = vm.data.phone.replaceAll(/\s/g, "").split(",");
        const regExp =
          /((\+*)((0[ -]*)*|((91 )*))((\d{12})+|(\d{10})+))|\d{5}([- ]*)\d{6}/g;
        let match = true;
        console.log(phones);
        for (let phone of phones) {
          const valid = phone.match(regExp);
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

      vm.tempCount = 0;
      // master_plan_with_years_image
      var fd = new FormData();
      let counter = 0;
      vm.data.master_plan_with_years_image.forEach((image) => {
        if ("name" in image) {
          if (image.type === "image/jpeg" || image.type === "image/png") {
            counter += 1;
            fd.append("file", image);
          } else {
            vm.loader = false;
            alert("Please upload only image files");
            return;
          }
        }
      });
      if (counter > 0) {
        console.log("fd is:", fd);
        console.log("calling multer");
        $http
          .post("/api/authority/multer", fd, {
            headers: { "Content-Type": undefined },
            transformRequest: angular.identity,
          })
          .then(
            function (res) {
              vm.data.master_plan_with_years_image = [];
              res.data.results.forEach((element) => {
                vm.data.master_plan_with_years_image.push(element);
              });
              vm.tempCount += 1;
            },
            function (error) {
              vm.loader = false;
              $rootScope.createError(
                "Some error occurred while uploading Master plan images .."
              );
            }
          );
      } else {
        vm.tempCount += 1;
      }
      // area_covered_image
      var fd = new FormData();
      counter = 0;
      vm.data.area_covered_image.forEach((image) => {
        if ("name" in image) {
          if (image.type === "image/jpeg" || image.type === "image/png") {
            counter += 1;
            fd.append("file", image);
          } else {
            vm.loader = false;
            alert("Please upload only image files");
            return;
          }
        }
      });
      if (counter > 0) {
        $http
          .post("/api/authority/multer", fd, {
            headers: { "Content-Type": undefined },
            transformRequest: angular.identity,
          })
          .then(
            function (res) {
              vm.data.area_covered_image = [];
              res.data.results.forEach((element) => {
                vm.data.area_covered_image.push(element);
              });
              vm.tempCount += 1;
            },
            function (error) {
              vm.loader = false;
              $rootScope.createError(
                "Some error occured while uploading Area covered images .."
              );
            }
          );
      } else {
        vm.tempCount += 1;
      }
      // metro_routes_image
      var fd = new FormData();
      counter = 0;
      vm.data.metro_routes_image.forEach((image) => {
        if ("name" in image) {
          if (image.type === "image/jpeg" || image.type === "image/png") {
            counter += 1;
            fd.append("file", image);
            console.log("fd is", fd);
          } else {
            vm.loader = false;
            alert("Please upload only image files");
            return;
          }
        }
      });
      if (counter > 0) {
        $http
          .post("/api/authority/multer", fd, {
            headers: { "Content-Type": undefined },
            transformRequest: angular.identity,
          })
          .then(
            function (res) {
              vm.data.metro_routes_image = [];
              console.log(
                "vm.data.metro_routes_image",
                vm.data.metro_routes_image
              );
              res.data.results.forEach((element) => {
                vm.data.metro_routes_image.push(element);
              });
              vm.tempCount += 1;
            },
            function (error) {
              vm.loader = false;
              $rootScope.createError(
                "Some error occured while uploading Metro routes images .."
              );
            }
          );
      } else {
        vm.tempCount += 1;
      }
      // Authority Logo
      var fd = new FormData();
      counter = 0;
      var image = vm.data.logo;
      console.log(image);
      if ("name" in image) {
        if (image.type === "image/jpeg" || image.type === "image/png") {
          counter += 1;
          console.log(fd);
          fd.append("file", image);
          console.info(counter);
        } else {
          vm.loader = false;
          alert("Please upload only image files");
          return;
        }
      }
      if (counter > 0) {
        console.dir(fd, "hello");
        $http
          .post("/api/authority/multer", fd, {
            headers: { "Content-Type": undefined },
            transformRequest: angular.identity,
          })
          .then(
            function (res) {
              vm.data.logo = res.data.results[0];
              console.log("vm.data.logo", vm.data.logo);
              vm.tempCount += 1;
            },
            function (error) {
              vm.loader = false;
              $rootScope.createError(
                "Some error occured while uploading Authority logo .."
              );
            }
          );
      } else {
        vm.tempCount += 1;
      }
    };

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
    vm.set_default();
  }
})();
