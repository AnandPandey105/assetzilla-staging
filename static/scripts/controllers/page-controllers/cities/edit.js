(function () {
  "use strict";
  angular
    .module("app", ["summernote", "ui.bootstrap"])
    .controller("EditCityCtrl", EditCityCtrl)
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

  EditCityCtrl.$inject = ["$scope", "$http", "$rootScope", "$location"];

  function EditCityCtrl($scope, $http, $rootScope, $location) {
    var vm = $scope;
    vm.typeaheadEditable = false;
    vm.new_banner_image = 0;
    vm.new_images = [];
    vm.set_data = function () {
      vm.data = {};
      let url = window.location.hash;
      url = url.split("?")[1].split("=")[1];
      $http
        .post("/api/city/get-doc", { url: decodeURIComponent(url) })
        .then(function (res) {
          if (res.data.success) {
            vm.data = res.data.data;
            vm.new_banner_image = vm.data.images.Cities.indexOf(
              vm.data.banner_image[1]
            );
          }
        });
    };
    vm.set_data();
    vm.loader = false;
    vm.bannerValueChanged = function (value) {
      vm.new_banner_image = value;
    };
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
          .post("/api/city/summernoteMulter", fds, {
            headers: { "Content-Type": undefined },
            transformRequest: angular.identity,
          })
          .then(
            function (res) {
              console.log(res);
              res.data.results.forEach((i) => {
                // vm.data[field] += `<img src='https://assetzilla-bucket.s3.amazonaws.com/dyn-res/city/${i}' style="width:100%"/>`
                let url = `https://d13ir9awo5x8gl.cloudfront.net/dyn-res/city/${i}`;
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
      if (vm.data.district == undefined) {
        if (
          vm.data.name == "North Delhi" ||
          vm.data.name == "South Delhi" ||
          vm.data.name == "East Delhi" ||
          vm.data.name == "West Delhi" ||
          vm.data.name == "North East Delhi" ||
          vm.data.name == "North West Delhi" ||
          vm.data.name == "South East Delhi" ||
          vm.data.name == "South West Delhi" ||
          vm.data.name == "New Delhi" ||
          vm.data.name == "Shahdara" ||
          vm.data.name == "Central Delhi" ||
          vm.data.name == "Mumbai" ||
          vm.data.name == "North Mumbai" ||
          vm.data.name == "South Mumbai" ||
          vm.data.name == "East Mumbai" ||
          vm.data.name == "West Mumbai"
        ) {
        } else {
          alert("Please Select an Option for district from Dropdown");
          vm.loader = false;
          return;
        }
      }
      var fd = new FormData();
      let c = 0;
      vm.new_images.forEach((image) => {
        if (image != "") {
          c += 1;
          fd.append("file", image);
        }
      });
      vm.data.area.unit = "sqkm";
      if (vm.new_banner_image > vm.data.images.Cities.length + c - 1) {
        vm.loader = false;
        alert("Please Select a Banner Image");
        return;
      }
      if (c > 0) {
        $http
          .post("/api/city/multer", fd, {
            headers: { "Content-Type": undefined },
            transformRequest: angular.identity,
          })
          .then(
            function (res) {
              if (res.data.success) {
                res.data.results.forEach((element) => {
                  vm.data.images.Cities.push(element);
                });
                vm.data.banner_image = [
                  "Cities",
                  vm.data.images.Cities[vm.new_banner_image],
                ];
                $http.post("/api/city/edit", vm.data).then(
                  function (res) {
                    alert(res.data.message);
                    if (res.data.success) {
                      window.location = "/admin-panel#/app/city/view";
                    }
                  },
                  function (error) {
                    vm.loader = false;
                    $rootScope.createError(
                      "Some error occured while editing City .."
                    );
                  }
                );
              }
            },
            function (error) {
              vm.loader = false;
              $rootScope.createError(
                "Some error occured while uploading City images .."
              );
            }
          );
      } else {
        vm.data.banner_image = [
          "Cities",
          vm.data.images.Cities[vm.new_banner_image],
        ];
        $http.post("/api/city/edit", vm.data).then(
          function (res) {
            alert(res.data.message);
            if (res.data.success) {
              window.location = "/admin-panel#/app/city/view";
            }
          },
          function (error) {
            vm.loader = false;
            $rootScope.createError("Some error occured while editing City ..");
          }
        );
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
  }
})();
