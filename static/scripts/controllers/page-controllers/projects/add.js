(function () {
  "use strict";
  angular
    .module("app", ["summernote", "ui.bootstrap"])
    .controller("AddProjectCtrl", AddProjectCtrl)
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

  AddProjectCtrl.$inject = [
    "$scope",
    "$http",
    "$rootScope",
    "$compile",
    "$location",
  ];

  function AddProjectCtrl(
    $scope,
    $http,
    $rootScope,
    $compile,
    $location,
    fileService
  ) {
    var vm = $scope;
    vm.coordinates = [];
    vm.typeaheadEditable = false;
    vm.amenities_green_list = [
      { value: "Park", mod: false },
      { value: "Meditation Area", mod: false },
      { value: "Morning walk Garden", mod: false },
    ];
    vm.amenities_health_list = [
      { value: "IN House Hospital", mod: false },
      { value: "Clean area", mod: false },
      { value: "Swimming Pool", mod: false },
      { value: "Gym/Fitness center", mod: false },
    ];
    vm.amenities_kid_list = [
      { value: "Play areas", mod: false },
      { value: "Cricket Ground", mod: false },
      { value: "Indoor gamesarea", mod: false },
    ];
    vm.amenities_connectivity_list = [
      { value: "Bus Staion @1Km", mod: false },
      { value: "Train Station @3KM", mod: false },
      { value: "Nearby Metro", mod: false },
    ];
    vm.amenities_other_list = [
      { value: "24*7 Water", mod: false },
      { value: "Electricity Backup", mod: false },
      { value: "Security", mod: false },
    ];
    vm.projectTypesList = [
      "Residential Plots",
      "Villas",
      "Apartments",
      "Floors",
      "Commercial Land",
      "Commercial Office",
      "Retail Shop",
      "Serviced Apartments",
      "Industrial Land",
      "Penthouse",
      "Duplex",
      "Farm house",
    ];
    vm.loader = false;
    vm.set_default = function () {
      vm.data = {};
      vm.data.details = [{}];
      vm.data.health_amenites_json = [];
      vm.data.connectivity_amenites_json = [];
      vm.data.kid_amenites_json = [];
      vm.data.other_amenites_json = [];
      vm.data.green_amenites_json = [];
      vm.data.images = {};
      vm.data.banner_image = 0;
      vm.data.images.Projects = [{}];
      vm.data.floor_plan = [{}];
      vm.data.site_plan = [{}];
      vm.data.brochure = [{}];
      vm.data.price_list = [{}];
      vm.data.specification = [{}];
      vm.data.other_document = [{}];
      vm.data.price = {};
    };
    vm.set_default();
    vm.property_type_selected = function () {
      let property_type = vm.data.property_type;
      vm.data.details = [{}];
      if (
        property_type == "Residential Plots" ||
        property_type == "Villas" ||
        property_type == "Floors" ||
        property_type == "Commercial Land" ||
        property_type == "Commercial Office" ||
        property_type == "Retail Shop" ||
        property_type == "Industrial Land" ||
        property_type == "Duplex" ||
        property_type == "Farm house"
      ) {
        vm.data.area = { area: 0, unit: "acres" };
        vm.data.road_width = { width: 0, unit: "feet" };
      }
      if (
        property_type == "Apartments" ||
        property_type == "Serviced Apartments" ||
        property_type == "Penthouse"
      ) {
        vm.data.area = { area: 0, unit: "acres" };
      }
    };
    vm.remove = function (index) {
      vm.data.details.splice(index, 1);
    };
    vm.handle_checkboxes = function (field, value) {
      if (value.mod) {
        vm.data[field].push(value.value);
      } else {
        vm.data[field].splice(vm.data[field].indexOf(value.value), 1);
      }
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
          .post("/api/project/summernoteMulter", fds, {
            headers: { "Content-Type": undefined },
            transformRequest: angular.identity,
          })
          .then(
            function (res) {
              console.log(res);
              res.data.results.forEach((i) => {
                // vm.data[field] += `<img src='https://assetzilla-bucket.s3.amazonaws.com/dyn-res/project/image/${i}' style="width:100%"/>`
                let url = `https://d13ir9awo5x8gl.cloudfront.net/dyn-res/project/image/${i}`;
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

    // Auto Suggests
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
    vm.getCities = function (val) {
      return $http
        .post("/api/city/typeahead", {
          data: val,
          state: vm.data.state,
          district: vm.data.district,
        })
        .then(function (response) {
          return response.data.results.map(function (item) {
            return item.name;
          });
        });
    };
    vm.getSubcities = function (val) {
      return $http
        .post("/api/subcity/typeahead", {
          data: val,
          state: vm.data.state,
          district: vm.data.district,
          city: vm.data.city,
        })
        .then(function (response) {
          return response.data.results.map(function (item) {
            return item.name;
          });
        });
    };
    vm.getBuilders = function (val) {
      return $http
        .post("/api/builder/typeahead", {
          data: val,
        })
        .then(function (response) {
          return response.data.results.map(function (item) {
            return item.name;
          });
        });
    };
    vm.getAuthorities = function (val) {
      return $http
        .post("/api/authority/typeahead", {
          data: val,
        })
        .then(function (response) {
          return response.data.results.map(function (item) {
            return item.name;
          });
        });
    };
    vm.getBanks = function () {
      return $http
        .post("/api/bank/get", {
          limit: 100,
        })
        .then(function (response) {
          vm.banksList = response.data.results;
        });
    };
    vm.getBanks();
    // vm.get_caseid = function () {
    //     return $http.get('/api/customer/get_caseid').then(function (response) {
    //         vm.case_ids = response.data.data
    //     });
    // };
    // vm.get_caseid();

    function getId(url) {
      // function convert youtube link into embeded one
      const regExp =
        /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);

      return match && match[2].length === 11 ? match[2] : null;
    }

    vm.add = function () {
      if (vm.data.video_url) {
        // convert youtube link into embeded one
        const videoId = getId(vm.data.video_url);
        const embedLink = "https://www.youtube.com/embed/" + videoId;
        vm.data.video_url = embedLink;
      }

      vm.loader = true;

      // Central Delhi, East Delhi, New Delhi

      if (vm.data.name == undefined) {
        alert("Please enter a name");
        vm.loader = false;
        return;
      }
      if (vm.data.builder == undefined) {
        alert("Please enter a builder");
        vm.loader = false;
        return;
      }
      if (vm.data.authority == undefined) {
        alert("Please enter a authority");
        vm.loader = false;
        return;
      }
      if (vm.data.project_status == undefined) {
        alert("Please select a project status");
        vm.loader = false;
        return;
      }
      if (vm.data.property_type == undefined) {
        alert("Please select a property type");
        vm.loader = false;
        return;
      }
      if (vm.data.state == undefined) {
        alert("Please Select an Option for state from Dropdown");
        vm.loader = false;
        return;
      }
      if (vm.data.district == undefined) {
        alert("Please Select an Option for district from Dropdown");
        vm.loader = false;
        return;
      }
      if (vm.data.city == undefined) {
        alert("Please Select an Option for city from Dropdown");
        vm.loader = false;
        return;
      }
      if (vm.data.subcity == undefined) {
        alert("Please Select an Option for subcity from Dropdown");
        vm.loader = false;
        return;
      }
      if (vm.data.expected_completion == undefined) {
        alert("Please select expected completion date.");
        vm.loader = false;
        return;
      }
      if (vm.data.pincode) {
        const regExp = /^\d\d\d\d\d\d$/g;
        const match = vm.data.pincode.toString().match(regExp);
        if (!match) {
          alert("Incorrect pincode");
          vm.loader = false;
          return;
        }
      }

      // if (vm.data.details && vm.data.details.length > 0) {
      //     console.log("details ", vm.data.details)
      //     for (let z = 0; z < vm.data.details.length; z++) {

      //         console.log('vm.data.details[z].unit_size ', vm.data.property_type)
      //         if (vm.data.property_type = "")
      //         if (vm.data.details[z] &&
      //             !vm.data.details[z].hasOwnProperty('unit_size') &&
      //             !vm.data.details[z].hasOwnProperty('name') &&
      //             !vm.data.details[z].hasOwnProperty('shop_type')) {
      //             console.log('please fill first')
      //         }
      //     }

      //     vm.loader = false; return
      // }

      vm.data.location = {};
      vm.data.location.location = {};
      vm.data.location.location.lat = document.getElementById("lat").value;
      vm.data.location.location.lng = document.getElementById("lng").value;
      var fd = new FormData();
      vm.data.images.Projects.forEach((image) => {
        if (typeof image === "object" && "name" in image) {
          if (image.type === "image/jpeg" || image.type === "image/png") {
            fd.append("file", image);
          } else {
            vm.loader = false;
            alert("Please upload only image files");
            return;
          }
        }
      });
      $http
        .post("/api/project/multer", fd, {
          headers: { "Content-Type": undefined },
          transformRequest: angular.identity,
        })
        .then(
          function (res) {
            if (res.data.success) {
              vm.data.images.Projects = res.data.results;
              vm.data.banner_image = [
                "Projects",
                vm.data.images.Projects[vm.data.banner_image],
              ];
              var fd = new FormData();
              vm.data.floor_plan.forEach((plan) => {
                if (typeof plan === "object" && "name" in plan) {
                  if (plan.type === "application/pdf") {
                    fd.append("file", plan);
                  } else {
                    vm.loader = false;
                    alert("Please upload only pdf files for floor plan");
                    return;
                  }
                }
              });
              $http
                .post("/api/project/multer_doc", fd, {
                  headers: { "Content-Type": undefined },
                  transformRequest: angular.identity,
                })
                .then(
                  function (res) {
                    vm.data.floor_plan = res.data.results;
                    var fd = new FormData();
                    vm.data.site_plan.forEach((plan) => {
                      if (typeof plan === "object" && "name" in plan) {
                        if (plan.type === "application/pdf") {
                          fd.append("file", plan);
                        } else {
                          vm.loader = false;
                          alert("Please upload only pdf files for Site plans");
                          return;
                        }
                      }
                    });
                    $http
                      .post("/api/project/multer_doc", fd, {
                        headers: { "Content-Type": undefined },
                        transformRequest: angular.identity,
                      })
                      .then(
                        function (res) {
                          vm.data.site_plan = res.data.results;
                          var fd = new FormData();
                          vm.data.brochure.forEach((plan) => {
                            if (typeof plan === "object" && "name" in plan) {
                              if (plan.type === "application/pdf") {
                                fd.append("file", plan);
                              } else {
                                vm.loader = false;
                                alert(
                                  "Please upload only pdf files for brochure"
                                );
                                return;
                              }
                            }
                          });
                          $http
                            .post("/api/project/multer_doc", fd, {
                              headers: { "Content-Type": undefined },
                              transformRequest: angular.identity,
                            })
                            .then(
                              function (res) {
                                vm.data.brochure = res.data.results;
                                var fd = new FormData();
                                vm.data.price_list.forEach((plan) => {
                                  if (
                                    typeof plan === "object" &&
                                    "name" in plan
                                  ) {
                                    if (plan.type === "application/pdf") {
                                      fd.append("file", plan);
                                    } else {
                                      vm.loader = false;
                                      alert(
                                        "Please upload only pdf files for Price list"
                                      );
                                      return;
                                    }
                                  }
                                });
                                $http
                                  .post("/api/project/multer_doc", fd, {
                                    headers: { "Content-Type": undefined },
                                    transformRequest: angular.identity,
                                  })
                                  .then(
                                    function (res) {
                                      vm.data.price_list = res.data.results;
                                      var fd = new FormData();
                                      vm.data.specification.forEach((plan) => {
                                        if (
                                          typeof plan === "object" &&
                                          "name" in plan
                                        ) {
                                          if (plan.type === "application/pdf") {
                                            fd.append("file", plan);
                                          } else {
                                            alert(
                                              "Please upload only pdf files for specifications"
                                            );
                                            return;
                                          }
                                        }
                                      });
                                      $http
                                        .post("/api/project/multer_doc", fd, {
                                          headers: {
                                            "Content-Type": undefined,
                                          },
                                          transformRequest: angular.identity,
                                        })
                                        .then(
                                          function (res) {
                                            vm.data.specification =
                                              res.data.results;
                                            var fd = new FormData();
                                            vm.data.other_document.forEach(
                                              (plan) => {
                                                if (
                                                  typeof plan === "object" &&
                                                  "name" in plan
                                                ) {
                                                  if (
                                                    plan.type ===
                                                    "application/pdf"
                                                  ) {
                                                    fd.append("file", plan);
                                                  } else {
                                                    alert(
                                                      "Please upload only pdf files for Other documents"
                                                    );
                                                    return;
                                                  }
                                                }
                                              }
                                            );

                                            $http
                                              .post(
                                                "/api/project/multer_doc",
                                                fd,
                                                {
                                                  headers: {
                                                    "Content-Type": undefined,
                                                  },
                                                  transformRequest:
                                                    angular.identity,
                                                }
                                              )
                                              .then(
                                                function (res) {
                                                  vm.data.other_document =
                                                    res.data.results;
                                                  console.log(
                                                    "vm.data",
                                                    vm.data
                                                  );
                                                  if (
                                                    vm.data &&
                                                    vm.data.road_width &&
                                                    vm.data.road_width.width
                                                  ) {
                                                    vm.data.road_width.width =
                                                      String(
                                                        vm.data.road_width.width
                                                      );
                                                  }
                                                  // vm.data.road_width.width = String(vm.data.road_width.width);{
                                                  if (
                                                    vm.data.property_type ===
                                                    "Floors"
                                                  ) {
                                                    let f = vm.data.floors;
                                                    if (
                                                      typeof f === "string" &&
                                                      typeof Number(f) ===
                                                        "number" &&
                                                      Number(f).toString() !==
                                                        "NaN"
                                                    ) {
                                                      vm.data.total_floors =
                                                        undefined; //Number(f);
                                                    } else if (
                                                      typeof f === "string"
                                                    ) {
                                                      if (f.includes("G+2")) {
                                                        vm.data.total_floors = 2;
                                                      } else if (
                                                        f.includes("G+3")
                                                      ) {
                                                        vm.data.total_floors = 3;
                                                      } else if (
                                                        f.includes("G+4")
                                                      ) {
                                                        vm.data.total_floors = 4;
                                                      } else if (
                                                        f.includes("Stilt+3")
                                                      ) {
                                                        vm.data.total_floors = 3;
                                                      } else if (
                                                        f.includes("Stilt+4")
                                                      ) {
                                                        vm.data.total_floors = 4;
                                                      }
                                                    }
                                                  }
                                                  console.log(
                                                    "vm.data ",
                                                    vm.data
                                                  );

                                                  $http
                                                    .post(
                                                      "/api/project/add",
                                                      vm.data
                                                    )
                                                    .then(
                                                      function (res) {
                                                        vm.loader = false;
                                                        alert(res.data.message);
                                                        if (res.data.success) {
                                                          window.location =
                                                            "/admin-panel#/app/project/view";
                                                        }
                                                      },
                                                      function (error) {
                                                        vm.loader = false;
                                                        $rootScope.createError(
                                                          "Some error occured while adding project .."
                                                        );
                                                      }
                                                    );
                                                },
                                                function (error) {
                                                  vm.loader = false;
                                                  $rootScope.createError(
                                                    "Some error occured while uploading Other documents .."
                                                  );
                                                }
                                              );
                                          },
                                          function (error) {
                                            vm.loader = false;
                                            $rootScope.createError(
                                              "Some error occured while uploading Specifications .."
                                            );
                                          }
                                        );
                                    },
                                    function (error) {
                                      vm.loader = false;
                                      $rootScope.createError(
                                        "Some error occured while uploading Price list .."
                                      );
                                    }
                                  );
                              },
                              function (error) {
                                vm.loader = false;
                                $rootScope.createError(
                                  "Some error occured while uploading brochure .."
                                );
                              }
                            );
                        },
                        function (error) {
                          vm.loader = false;
                          $rootScope.createError(
                            "Some error occured while uploading Site plans .."
                          );
                        }
                      );
                  },
                  function (error) {
                    vm.loader = false;
                    $rootScope.createError(
                      "Some error occured while uploading Floor plans .."
                    );
                  }
                );
            }
          },
          function (error) {
            vm.loader = false;
            $rootScope.createError(
              "Some error occured while uploading Project images .."
            );
          }
        );
    };

    vm.removeParameter = function (elementId, variable, index) {
      document.getElementById(elementId).value = null;
      variable[index] = {};
    };
  }
})();
