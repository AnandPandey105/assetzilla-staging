angular.module("app", ["ui.bootstrap"]).component("viewTable", {
  templateUrl: "../../../views/components/view-table.html",
  controller: function viewTableController(
    $scope,
    $rootScope,
    $http,
    $element,
    $attrs
  ) {
    $scope.limit = 5;
    $scope.skip = 1;
    $scope.total = 200;
    $scope.refresh = true;
    $scope.rework_reson = {};
    $scope.windowLocation = window.location.hash;
    $scope.goToAdd = function (entity) {
      window.location = "/admin-panel#/app/" + entity.toLowerCase() + "/add";
    };
    $scope.goToEdit = function (url, entity) {
      window.location =
        "/admin-panel#/app/" + entity.toLowerCase() + "/edit?url=" + url;
    };
    $scope.get_reasons = function (entity, id) {
      let payload = {
        entity: entity.toLowerCase(),
        id: id,
      };
      if (payload.entity == "article") {
        payload.entity = "news";
      }
      $http.post("/api/reason/get", payload).then(function (res) {
        if (res.data.success) {
          $scope.reasons = res.data.results;
          var dlgElem = angular.element("#reasonModal");
          if (dlgElem) {
            dlgElem.modal("show");
          }
        }
      });
    };
    $scope.changeStatus = function (
      url,
      entity,
      status,
      index = 0,
      currentStatus = 0
    ) {
      if (entity == "Article") {
        entity = "News";
      }
      let request_url = "/api/" + entity.toLowerCase() + "/set_status";
      let payload = {
        url: url,
        status: status,
      };
      if (status == "3" || (currentStatus == "3" && status == "1")) {
        if ($scope.rework_reson[index] == undefined) {
          alert("Please Enter A Reason");
          return;
        }
        payload.reason = $scope.rework_reson[index];
      }
      $http.post(request_url, payload).then(function (res) {
        console.log(res);
        if (res.data.success) {
          setTimeout(function () {
            location.reload();
          }, 1000);
        }else{
          alert(res.data.message);
        }
      });
    };
  },
  bindings: {
    title: "=",
    limit: "=",
    getdata: "=",
    fields: "=",
    results: "=",
    query: "=",
    skip: "=",
    status: "=",
    total: "=",
    refresh: "=",
    sort: "=",
    filter: "=",
    windowLocation: "="
  },
});
