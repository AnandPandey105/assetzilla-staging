(function () {
  "use strict";
  angular
    .module("app", ["summernote"])
    .controller("AddBankCtrl", AddBankCtrl)
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
  AddBankCtrl.$inject = [
    "$scope",
    "$http",
    "$rootScope",
    "$location",
    "$parse",
  ];

  function AddBankCtrl($scope, $http, $rootScope, $location, $parse) {
    // Add Bank
    var vm = $scope;
    vm.set_default = function () {
      vm.data = {};
      vm.data.is_live = 1;
    };
    vm.set_default();
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
          .post("/api/bank/summernoteMulter", fds, {
            headers: { "Content-Type": undefined },
            transformRequest: angular.identity,
          })
          .then(
            function (res) {
              console.log(res);
              res.data.results.forEach((i) => {
                // vm.data[field] += `<img src='https://assetzilla-bucket.s3.amazonaws.com/dyn-res/bank/${i}' style="width:100%"/>`
                let url = `https://d13ir9awo5x8gl.cloudfront.net/dyn-res/bank/${i}`;
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
    vm.loader = false;
    vm.add = function () {
      vm.loader = true;
      var fd = new FormData();
      fd.append("file", vm.data.logo);
      $http
        .post("/api/bank/multer", fd, {
          headers: { "Content-Type": undefined },
          transformRequest: angular.identity,
        })
        .then(
          function (res) {
            if (res.data.success) {
              vm.data.logo = res.data.results[0];
              $http.post("/api/bank/add", vm.data).then(
                function (res) {
                  alert(res.data.message);
                  if (res.data.success) {
                    vm.set_default();
                    window.location = "/admin-panel#/app/bank/view";
                  }
                },
                function (error) {
                  vm.loader = false;
                  $rootScope.createError(
                    "Some error occured while adding Bank .."
                  );
                }
              );
            }
          },
          function (error) {
            vm.loader = false;
            $rootScope.createError(
              "Some error occured while uploading Bank images .."
            );
          }
        );
    };
  }
})();
