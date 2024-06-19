(function () {
  "use strict";
  angular.module("app").controller("ViewArticleCtrl", ViewArticleCtrl);

  ViewArticleCtrl.$inject = ["$scope", "$http", "$rootScope"];

  function ViewArticleCtrl($scope, $http, $rootScope) {
    var vm = $scope;
    vm.table = {
      title: "Article",
      limit: "10",
      fields: [
        ["Banner", "img"],
        ["Heading", "heading"],
        ["Publish Date", "publish_date"],
        ["Source Name", "link_name"],
        ["Status", "is_live"],
        ["Modified At", "updated"],
        ["Page Views", "views"],
      ],
      results: [],
      query: "",
      total: 0,
      skip: 1,
      sort: "newest",
      status: "0",
      refresh: 1,
    };
    vm.$watch("table.limit", function (newValue, oldValue) {
      if (newValue != oldValue) {
        vm.getData();
      }
    });
    vm.$watch("table.query", function (newValue, oldValue) {
      if (newValue != oldValue) {
        vm.getData();
      }
    });
    vm.$watch("table.skip", function (newValue, oldValue) {
      if (newValue != oldValue) {
        vm.getData();
      }
    });
    vm.$watch("table.sort", function (newValue, oldValue) {
      console.log("old n new", oldValue, newValue);
      if (newValue != oldValue) {
        vm.table.skip = 1;
        vm.getData();
      }
    });
    vm.$watch("table.status", function (newValue, oldValue) {
      if (newValue != oldValue) {
        vm.getData();
      }
    });
    vm.getData = function () {
      let payload = { limit: parseInt(vm.table.limit) };
      if (vm.table.query.length > 0) {
        payload.query = vm.table.query;
      }
      if (vm.table.skip > 1) {
        payload.skip = vm.table.skip - 1;
      }
      if (vm.table.status != "0") {
        payload.status = vm.table.status;
      }
      if (vm.table.sort.length > 1) {
        payload.sort = vm.table.sort;
      }
      $http.post("/api/news/get", payload).then(function (res) {
        if (res.data.success) {
          vm.table.results = [];
          let bucket = "https://d13ir9awo5x8gl.cloudfront.net"
            // let bucket = "https://s3-application.s3-us-west-2.amazonaws.com"
          res.data.results.forEach((element) => {
            if ("news_banner" in element) {
              element.img =
                bucket+"/dyn-res/news/" +
                element.news_banner;
            } else {
              element.img = "/images/bg.webp";
            }
            if ("publish_date" in element) {
              var eleDate = new Date(element.publish_date);
              // element.publish_date = eleDate.toDateString()
              element.publish_date =
                eleDate.getDate() +
                "-" +
                (eleDate.getMonth() + 1) +
                "-" +
                eleDate.getFullYear();
                // "-" +
                // eleDate.getHours()

            }
            vm.table.results.push(element);
          });
          vm.table.total = res.data.total;
        }
      });
    };
    vm.getData();
  }
})();
