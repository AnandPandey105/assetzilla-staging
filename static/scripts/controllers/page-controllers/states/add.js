(function () {
  "use strict";
  angular
    .module("app", ["summernote"])
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
    ])
    .controller("AddStateCtrl", AddStateCtrl);

  AddStateCtrl.$inject = ["$scope", "$http", "$rootScope", "$location"];

  function AddStateCtrl($scope, $http, $rootScope, $location) {
    var vm = $scope;

    vm.set_default = function () {
      vm.data = {};
      vm.data.is_live = 1;
      vm.data.images = {};
      vm.data.banner_image = 0;
      vm.data.images.States = [""];
      vm.data.country = "india";
      vm.data.area = { area: 0, unit: "sqkm" };
    };
    vm.loader = false;
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
          .post("/api/state/summernoteMulter", fds, {
            headers: { "Content-Type": undefined },
            transformRequest: angular.identity,
          })
          .then(
            function (res) {
              console.log(res);
              res.data.results.forEach((i) => {
                // vm.data[field] += `<img src='https://assetzilla-bucket.s3.amazonaws.com/dyn-res/state/${i}' style="width:100%"/>`
                let url = `/dyn-res/state/${i}`;
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
    vm.add = function () {
      if (vm.data.video_url) {
        // convert youtube link into embeded one
        const videoId = getId(vm.data.video_url);
        const embedLink = "https://www.youtube.com/embed/" + videoId;
        vm.data.video_url = embedLink;
      }
      vm.loader = true;
      // if ((vm.data.images.States[0] == "")) { vm.loader = false; alert("Please Add atleast 1 Image");return; }
      if (!vm.data.name) {
        vm.loader = false;
        alert("Please Add State name");
        return;
      }
      if (vm.data.images.States.length > 0) {
        var fd = new FormData();
        vm.data.images.States.forEach((image) => {
          fd.append("file", image);
        });
        $http
          .post("/api/state/multer", fd, {
            headers: { "Content-Type": undefined },
            transformRequest: angular.identity,
          })
          .then(
            function (res) {
              if (res.data.success) {
                vm.data.images.States = res.data.results;
                vm.data.banner_image = [
                  "States",
                  vm.data.images.States[vm.data.banner_image],
                ];
                $http.post("/api/state/add", vm.data).then(
                  function (res) {
                    alert(res.data.message);
                    if (res.data.success) {
                      window.location = "/admin-panel#/app/state/view";
                    }
                  },
                  function (error) {
                    vm.loader = false;
                    $rootScope.createError(
                      "Some error occured while adding State .."
                    );
                  }
                );
              }
            },
            function (error) {
              vm.loader = false;
              $rootScope.createError(
                "Some error occured while uploading State images .."
              );
            }
          );
      }
    };
    vm.set_default();
  }
})();
