(function () {
  "use strict";
  angular
    .module("app", ["ui.bootstrap", "summernote"])
    .controller("AddArticleCtrl", AddArticleCtrl)
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

  AddArticleCtrl.$inject = ["$scope", "$http", "$rootScope", "$location"];

  function AddArticleCtrl($scope, $http, $rootScope, $location) {
    var vm = $scope;
    vm.typeaheadEditable = false;
    vm.set_default = function () {
      vm.data = {};
      vm.data.approval = "1";
      vm.data.tags = "";
    };

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
          .post("/api/news/summernoteMulter", fds, {
            headers: { "Content-Type": undefined },
            transformRequest: angular.identity,
          })
          .then(
            function (res) {
              console.log(res);
              res.data.results.forEach((i) => {
                // vm.data[
                //   field
                // ] += `<img src='https://assetzilla-bucket.s3.amazonaws.com/dyn-res/news/${i}' style="width:100%"/>`;
                let url = `https://d13ir9awo5x8gl.cloudfront.net/dyn-res/news/${i}`;
                let image = $("<img>").attr("src", url).css("max-width", "100%");
                console.log(image[0], $(`#${field}`, `#content-sm`));
                // $(`#${field}`).summernote("insertNode", image[0]);
                $(`#content-sm`).summernote("insertNode", image[0]);
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
      if (!vm.data || !vm.data.heading || vm.data.heading.length === 0) {
        alert("Please write a heading");
        vm.loader = false;
        return;
      }
      if (!vm.data || !vm.data.images || vm.data.images.length === 0) {
        alert("Please add a banner image");
        vm.loader = false;
        return;
      }
      if (!vm.data || !vm.data.link_name || vm.data.link_name.length === 0) {
        alert("Please add source name");
        vm.loader = false;
        return;
      }
      if (!vm.data || !vm.data.link || vm.data.link.length === 0) {
        alert("Please add source link");
        vm.loader = false;
        return;
      }
      if (!vm.data || !vm.data.publish_date) {
        alert("Please add a publish date");
        vm.loader = false;
        return;
      }
      if (!vm.data || !vm.data.tags || vm.data.tags.length == 0) {
        alert("Please add tags");
        vm.loader = false;
        return;
      }
      if (!vm.data || !vm.data.content || vm.data.content.length == 0) {
        alert("Please add some content");
        vm.loader = false;
        return;
      }
      let tags = [];
      vm.data.tags = vm.data.tags.split(",");
      vm.data.tags.forEach((element) => {
        if (element) {
          // tags.push(element.trim().toLowerCase())
          tags.push(element.trim());
        }
      });
      vm.data.tags = tags;
      var fd = new FormData();
      fd.append("file", vm.data.images);
      $http
        .post("/api/news/multer", fd, {
          headers: { "Content-Type": undefined },
          transformRequest: angular.identity,
        })
        .then(
          function (res) {
            if (res.data.success) {
              vm.data.images = res.data.results[0];
              $http.post("/api/news/add", vm.data).then(
                function (res) {
                  alert(res.data.message);
                  if (res.data.success) {
                    window.location = "/admin-panel#/app/article/view";
                  }
                },
                function (error) {
                  vm.loader = false;
                  $rootScope.createError(
                    "Some error occured while adding Article .."
                  );
                }
              );
            }
          },
          function (error) {
            vm.loader = false;
            $rootScope.createError(
              "Some error occured while uploading Article images .."
            );
          }
        );
    };
    vm.getTags = function () {
      $http.get("/api/news/get-tags").then(
        function (res) {
          vm.tags = res.data.data[0].tags;
        },
        function (error) {}
      );
    };
    vm.getTags();
  }
})();
