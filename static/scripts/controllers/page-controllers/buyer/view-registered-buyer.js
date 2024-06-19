(function () {
  "use strict";
  angular
    .module("app", ["ui.bootstrap"])
    .controller("ViewBuyerCtrl", ViewBuyerCtrl)
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

  ViewBuyerCtrl.$inject = [
    "$scope",
    "$http",
    "$rootScope",
    "$compile",
    "$location",
    "$stateParams",
  ];

  function ViewBuyerCtrl(
    $scope,
    $http,
    $rootScope,
    $compile,
    $location,
    $stateParams
  ) {
    var vm = $scope;
    vm.typeaheadEditable = false;

    vm.from_user_submitted_property = undefined;

    vm.bmfilter = "properties"
    vm.selectedTab = 'bookmarks'
    vm.recentLeadsTab = 'booking-inquiries'

    vm.search_history_filter = "All"
    vm.search_history_filtered_data = {};

    vm.view_history_filter = "All"
    vm.view_history_filtered_data = {};

    vm.schedulingAppointmentFor = "";
    vm.scheduleHistory = [];
    vm.userHistoryData = {};
    vm.scheduleHistoryData = {};

    vm.buyer = {};
    vm.bookmark = [];
    vm.viewHistory = {};
    vm.searchHistory = {};
    vm.submitted_property = [];

    console.log("()()()()()()())(");
    console.log($stateParams);

    vm.getBuyer = (un) => {
      $http
        .post("/api/buyer/get-buyer-data", {
          username: un,
        })
        .then(function (res) {
          console.log("data: ", res);
          if (res.data.success && res.data.data) {
            vm.bookmark = res.data.data.bookmark;
            vm.viewHistory = res.data.data.viewHistory;
            vm.searchHistory = res.data.data.searchHistory;
            vm.search_history_filtered_data = res.data.data.searchHistory;
            vm.view_history_filtered_data = res.data.data.viewHistory;
            console.log(vm.search_history_filtered_data);
            vm.submitted_property = res.data.data.submitted_property;
            vm.buyer = res.data.data;
            if(vm.buyer.submitted_property){
              vm.buyer.submitted_property = vm.buyer.submitted_property.map((s)=>{
                s.price = Number(s.price);
                return s;
              })
            }
            
            if (vm.viewHistory){
                if (Object.keys(vm.viewHistory).length > 0){
                    vm.userViewHistory = Object.keys(vm.viewHistory)
                }
                console.log({userViewHistory: vm.userViewHistory, viewHistory: vm.viewHistory })
            }
            if (vm.search_history_filtered_data){
                if (Object.keys(vm.search_history_filtered_data).length > 0){
                    vm.userSearchHistory = Object.keys(vm.search_history_filtered_data)
                }
            }
          }
        });
    };

    vm.filterSearchHistory = function (f) {
      if (f === "All") {
        vm.search_history_filtered_data = vm.searchHistory;
      } else if (f === "Other") {
        vm.search_history_filtered_data = 0
      } else {
        let x = Object.keys(vm.searchHistory);
        vm.search_history_filtered_data = {};
        if (x.length > 0) {
          for (let i = 0; i < x.length; i++) {
            let a = x[i];
            let b = vm.searchHistory[a];
            if (b.length > 0) {
              let dataToPush = [];
              for (let j = 0; j < b.length; j++) {
                let c = b[j];
                if (c && c.doc_type) {
                  if (c.doc_type.toLowerCase() === f.toLowerCase()){
                    dataToPush.push(c)
                  }
                }
              }
              if (dataToPush.length > 0) {
                vm.search_history_filtered_data[a] = dataToPush;
              }
            }
          }
        }
      }
      if (vm.search_history_filtered_data){
        if (Object.keys(vm.search_history_filtered_data).length > 0){
            vm.userSearchHistory = Object.keys(vm.search_history_filtered_data)
        } else {
          vm.userSearchHistory = [];
        }
      } else {
        vm.userSearchHistory = [];
      }
    }

    vm.filterViewHistory = function (f) {
      if (f === "All") {
        vm.view_history_filtered_data = vm.viewHistory;
      } else if (f === "Other") {
        vm.view_history_filtered_data = 0
      } else {
        let search_term = f;
        let search_criteria = "doc_type";
        if (f.includes("Location:")){
          search_term = search_term.substring(9);
          search_criteria = "location_type";
        }
        let x = Object.keys(vm.viewHistory);
        vm.view_history_filtered_data = {};
        if (x.length > 0) {
          for (let i = 0; i < x.length; i++) {
            let a = x[i];
            let b = vm.viewHistory[a];
            if (b.length > 0) {
              let dataToPush = [];
              for (let j = 0; j < b.length; j++) {
                let c = b[j];
                if (c && c[search_criteria]) {
                  if (c[search_criteria].toLowerCase() === search_term.toLowerCase()){
                    dataToPush.push(c)
                  }
                }
              }
              if (dataToPush.length > 0) {
                vm.view_history_filtered_data[a] = dataToPush;
              }
            }
          }
        }
      }
      if (vm.view_history_filtered_data){
        if (Object.keys(vm.view_history_filtered_data).length > 0){
            vm.userViewHistory = Object.keys(vm.view_history_filtered_data)
        } else {
          vm.userViewHistory = [];
        }
      } else {
        vm.userViewHistory = [];
      }
    }

    vm.getLink = function (prop) {
        console.log('case id', prop.case_id_display)
        var caseId = prop.case_id_display;
        $http.post('/api/customer/getLink',
            {
                caseId: caseId,
                caseIdDisplay:prop.case_id_display,
            }
        ).then(function (res) {
            console.log('res', res)
            if (res.data.success) {
                var fullUrl = "www.assetzilla.com" + res.data.url
                console.log('fullurl', fullUrl)
                window.open(res.data.url, '_blank');
            }
            else {
            }    
            // if (res.data.success) {
            //     console.log('res')
            // }
        });
    }

    vm.setTab = (container) => {
        let className = '.'+container+'-container';
        console.log("className:", className);
        $('.'+container+'-container').show()
      }

    if ($stateParams.username) {
        console.log("Calling")
      vm.getBuyer($stateParams.username);
    }

    vm.showHistoryModal = (user, is_usp) => {
      $("#showHistoryModal").modal("show");
      vm.userHistory = user.history;
      vm.userHistoryData = user;
      if (is_usp) {
        vm.from_user_submitted_property = true;
      } else {
        vm.from_user_submitted_property = false;
      }
    };

    vm.showScheduleHistoryModal = async (user) => {
      console.log(user);
      vm.schedulingAppointmentFor = user;
      vm.scheduleHistoryData = user;
      vm.scheduleHistory = user.history;
      console.log(vm.scheduleHistory);
      $("#scheduleHistoryModal").modal("show");
    };
  }
})();
