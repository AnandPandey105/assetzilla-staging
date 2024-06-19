(function () {
  "use strict";
  angular
    .module("app", ["summernote", "ui.bootstrap", "ngSanitize"])
    .controller("EditProjectCtrl", EditProjectCtrl)
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

  EditProjectCtrl.$inject = [
    "$scope",
    "$http",
    "$rootScope",
    "$compile",
    "$location",
    "$sce",
  ];

  function EditProjectCtrl(
    $scope,
    $http,
    $rootScope,
    $compile,
    $location,
    $sce
  ) {
    var vm = $scope;
    vm.new_banner_image = 0;
    vm.new_images = [];
    vm.new_floor_plan = [];
    vm.new_site_plan = [];
    vm.new_brochure = [];
    vm.new_price_list = [];
    vm.new_specification = [];
    vm.new_other_document = [];
    vm.typeaheadEditable = false;
    vm.counter = 0;
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

    vm.bannerValueChanged = function (value) {
      vm.new_banner_image = value;
    };
    vm.trustSrc = function (src) {
      return $sce.trustAsResourceUrl(src);
    };
    vm.set_data = function () {
      vm.data = {};
      vm.new_images = [{}];
      vm.new_floor_plan = [{}];
      vm.new_site_plan = [{}];
      vm.new_brochure = [{}];
      vm.new_price_list = [{}];
      vm.new_specification = [{}];
      vm.new_other_document = [{}];
      vm.project_floor_plan = [];
      vm.project_site_plan = [];
      vm.project_brochure = [];
      vm.project_price_list = [];
      vm.project_specification = [];
      vm.project_other_document = [];
      let url = window.location.hash;
      url = url.split("?")[1].split("=")[1];
      vm.mapInit = 0;

      vm.$watch("mapInit", function (newValue, oldValue) {
        if (newValue == 2) {
          if (vm.data["location"]) {
            if (vm.data.location["location"]) {
              document.getElementById("lat").value =
                vm.data.location.location.lat;
              document.getElementById("lng").value =
                vm.data.location.location.lng;
              drawMap(
                vm.data.location.location.lat,
                vm.data.location.location.lng
              );
            } else {
              drawMap(28.68627380000001, 77.22178310000004);
            }
          } else {
            drawMap(28.68627380000001, 77.22178310000004);
          }
        }
      });
      $http
        .post("/api/project/get-doc", { url: decodeURIComponent(url) })
        .then(function (res) {
          if (res.data.success) {
            console.log("res.data.data", res.data.data);
            vm.data = res.data.data;
            if (vm.data["expected_completion"]) {
              vm.data["expected_completion"] = new Date(
                vm.data["expected_completion"]
              );
            }
            vm.new_banner_image = vm.data.images.Projects.indexOf(
              vm.data.banner_image[1]
            );
            console.log("vm.data.images.Projects", vm.data.images.Projects);
            vm.mapInit = vm.mapInit + 1;
            vm.data.details.forEach((ele) => {
              if (ele) {
                ele.area = parseInt(ele.area);
              }
            });
            vm.amenities_green_list.forEach((ele) => {
              if (vm.data.green_amenites_json.indexOf(ele.value) > -1) {
                ele.mod = true;
              }
            });
            vm.amenities_health_list.forEach((ele) => {
              if (vm.data.health_amenites_json.indexOf(ele.value) > -1) {
                ele.mod = true;
              }
            });
            vm.amenities_kid_list.forEach((ele) => {
              if (vm.data.kid_amenites_json.indexOf(ele.value) > -1) {
                ele.mod = true;
              }
            });
            vm.amenities_connectivity_list.forEach((ele) => {
              if (vm.data.connectivity_amenites_json.indexOf(ele.value) > -1) {
                ele.mod = true;
              }
            });
            vm.amenities_other_list.forEach((ele) => {
              if (vm.data.other_amenites_json.indexOf(ele.value) > -1) {
                ele.mod = true;
              }
            });
            if ("floor_plan" in vm.data) {
              vm.data.floor_plan.forEach((element) => {
                console.log("element is", element);
                vm.project_floor_plan.push(
                  "https://docs.google.com/gview?url=https://d13ir9awo5x8gl.cloudfront.net/dyn-res/project/doc/" +
                    element +
                    "&embedded=true"
                );
              });
            }
            if ("site_plan" in vm.data) {
              vm.data.site_plan.forEach((element) => {
                vm.project_site_plan.push(
                  "https://docs.google.com/gview?url=https://d13ir9awo5x8gl.cloudfront.net/dyn-res/project/doc/" +
                    element +
                    "&embedded=true"
                );
              });
            }
            if ("brochure" in vm.data) {
              vm.data.brochure.forEach((element) => {
                vm.project_brochure.push(
                  "https://docs.google.com/gview?url=https://d13ir9awo5x8gl.cloudfront.net/dyn-res/project/doc/" +
                    element +
                    "&embedded=true"
                );
              });
            }
            if ("price_list" in vm.data) {
              vm.data.price_list.forEach((element) => {
                vm.project_price_list.push(
                  "https://docs.google.com/gview?url=https://d13ir9awo5x8gl.cloudfront.net/dyn-res/project/doc/" +
                    element +
                    "&embedded=true"
                );
              });
            }
            if ("specification" in vm.data) {
              vm.data.specification.forEach((element) => {
                vm.project_specification.push(
                  "https://docs.google.com/gview?url=https://d13ir9awo5x8gl.cloudfront.net/dyn-res/project/doc/" +
                    element +
                    "&embedded=true"
                );
              });
            }
            if ("other_document" in vm.data) {
              vm.data.other_document.forEach((element) => {
                vm.project_other_document.push(
                  "https://docs.google.com/gview?url=https://d13ir9awo5x8gl.cloudfront.net/dyn-res/project/doc/" +
                    element +
                    "&embedded=true"
                );
              });
            }
          }
        });
    };
    vm.set_data();
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
                // vm.data[field] += `<img src='https://d13ir9awo5x8gl.cloudfront.net/dyn-res/project/image/${i}' style="width:100%"/>`
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

    vm.edit = function () {
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

      if (vm.data.video_url && vm.data.video_url.length > 0) {
        // convert youtube link into embeded one
        const videoId = getId(vm.data.video_url);
        const embedLink = "https://www.youtube.com/embed/" + videoId;
        vm.data.video_url = embedLink;
      } else {
        vm.data.video_url = "";
      }
      vm.loader = true;
      if (
        document.getElementById("lat").value != "28.68627380000001" &&
        document.getElementById("lng").value != "77.22178310000004"
      ) {
        vm.data.location = {};
        vm.data.location.location = {};
        vm.data.location.location.lat = document.getElementById("lat").value;
        vm.data.location.location.lng = document.getElementById("lng").value;
      }
      // Floor Plan Docs
      var fd = new FormData();
      let counter = 0;
      vm.new_floor_plan.forEach((plan) => {
        if ("name" in plan) {
          if (plan.type === "application/pdf") {
            counter += 1;
            fd.append("file", plan);
          } else {
            vm.loader = false;
            alert("Please upload only pdf files");
            return;
          }
        }
      });
      if (counter > 0) {
        console.log("counter for floor plans", counter);
        $http
          .post("/api/project/multer_doc", fd, {
            headers: { "Content-Type": undefined },
            transformRequest: angular.identity,
          })
          .then(
            function (res) {
              console.log(
                "res.data.results for newfloor plan",
                res.data.results
              );
              res.data.results.forEach((element) => {
                vm.data.floor_plan.push(element);
              });
              vm.counter += 1;
            },
            function (error) {
              vm.loader = false;
              $rootScope.createError(
                "Some error occured while uploading floor plan docs .."
              );
            }
          );
      } else {
        vm.counter += 1;
      }
      // Site Plan Docs
      var fd = new FormData();
      counter = 0;
      vm.new_site_plan.forEach((plan) => {
        if ("name" in plan) {
          if (plan.type === "application/pdf") {
            counter += 1;
            fd.append("file", plan);
          } else {
            vm.loader = false;
            alert("Please upload only pdf files");
            return;
          }
        }
      });
      if (counter > 0) {
        $http
          .post("/api/project/multer_doc", fd, {
            headers: { "Content-Type": undefined },
            transformRequest: angular.identity,
          })
          .then(
            function (res) {
              res.data.results.forEach((element) => {
                vm.data.site_plan.push(element);
              });
              vm.counter += 1;
            },
            function (error) {
              vm.loader = false;
              $rootScope.createError(
                "Some error occured while site plan docs .."
              );
            }
          );
      } else {
        vm.counter += 1;
      }
      // Brochures Docs
      var fd = new FormData();
      counter = 0;
      vm.new_brochure.forEach((plan) => {
        if ("name" in plan) {
          if (plan.type === "application/pdf") {
            counter += 1;
            fd.append("file", plan);
          } else {
            vm.loader = false;
            alert("Please upload only pdf files");
            return;
          }
        }
      });
      if (counter > 0) {
        $http
          .post("/api/project/multer_doc", fd, {
            headers: { "Content-Type": undefined },
            transformRequest: angular.identity,
          })
          .then(
            function (res) {
              res.data.results.forEach((element) => {
                vm.data.brochure.push(element);
              });
              vm.counter += 1;
            },
            function (error) {
              vm.loader = false;
              $rootScope.createError(
                "Some error occured while uploading brochure doc .."
              );
            }
          );
      } else {
        vm.counter += 1;
      }
      // Price List Docs
      var fd = new FormData();
      counter = 0;
      vm.new_price_list.forEach((plan) => {
        if ("name" in plan) {
          if (plan.type === "application/pdf") {
            counter += 1;
            fd.append("file", plan);
          } else {
            vm.loader = false;
            alert("Please upload only pdf files");
            return;
          }
        }
      });
      if (counter > 0) {
        $http
          .post("/api/project/multer_doc", fd, {
            headers: { "Content-Type": undefined },
            transformRequest: angular.identity,
          })
          .then(
            function (res) {
              res.data.results.forEach((element) => {
                vm.data.price_list.push(element);
              });
              vm.counter += 1;
            },
            function (error) {
              vm.loader = false;
              $rootScope.createError(
                "Some error occured while uploading pricelist doc .."
              );
            }
          );
      } else {
        vm.counter += 1;
      }
      // Specification docs
      var fd = new FormData();
      counter = 0;
      vm.new_specification.forEach((plan) => {
        if ("name" in plan) {
          if (plan.type === "application/pdf") {
            counter += 1;
            fd.append("file", plan);
          } else {
            vm.loader = false;
            alert("Please upload only pdf files");
            return;
          }
        }
      });
      if (counter > 0) {
        $http
          .post("/api/project/multer_doc", fd, {
            headers: { "Content-Type": undefined },
            transformRequest: angular.identity,
          })
          .then(
            function (res) {
              res.data.results.forEach((element) => {
                vm.data.specification.push(element);
              });
              vm.counter += 1;
            },
            function (error) {
              vm.loader = false;
              $rootScope.createError(
                "Some error occured while uploading specification doc .."
              );
            }
          );
      } else {
        vm.counter += 1;
      }
      // Other Documents
      var fd = new FormData();
      counter = 0;
      vm.new_other_document.forEach((plan) => {
        if ("name" in plan) {
          if (plan.type === "application/pdf") {
            counter += 1;
            fd.append("file", plan);
          } else {
            vm.loader = false;
            alert("Please upload only pdf files");
            return;
          }
        }
      });
      if (counter > 0) {
        $http
          .post("/api/project/multer_doc", fd, {
            headers: { "Content-Type": undefined },
            transformRequest: angular.identity,
          })
          .then(
            function (res) {
              res.data.results.forEach((element) => {
                vm.data.other_document.push(element);
              });
              vm.counter += 1;
            },
            function (error) {
              vm.loader = false;
              $rootScope.createError(
                "Some error occured while uploading other docs .."
              );
            }
          );
      } else {
        vm.counter += 1;
      }

      var fd = new FormData();
      counter = 0;
      vm.new_images.forEach((image) => {
        console.log("image from plan is", image);
        if ("name" in image) {
          console.log("inside if image");
          if (image.type === "image/jpeg" || image.type === "image/png") {
            console.log("appending...");
            counter += 1;
            console.log("couter is", counter);
            fd.append("file", image);
          } else {
            console.log("not appending...");
            vm.loader = false;
            alert("Please upload only image files");
            return;
          }
        }
      });

      if (counter > 0) {
        console.log("now will upload...");
        $http
          .post("/api/project/multer", fd, {
            headers: { "Content-Type": undefined },
            transformRequest: angular.identity,
          })
          .then(
            function (res) {
              console.log("res.data.results for newimages", res.data.results);
              res.data.results.forEach((element) => {
                vm.data.images.Projects.push(element);
              });
              vm.counter += 1;
            },
            function (error) {
              vm.loader = false;
              $rootScope.createError(
                "Some error occured while uploading project images .."
              );
            }
          );
      } else {
        vm.counter += 1;
      }
    };
    vm.$watch("counter", function (newValue, oldValue) {
      console.log("newValue is", newValue);
      if (newValue == 7) {
        vm.data.banner_image = [
          "Projects",
          vm.data.images.Projects[vm.new_banner_image],
        ];
        if (vm.data.property_type === "Floors") {
          let f = vm.data.floors;
          if (
            typeof f === "string" &&
            typeof Number(f) === "number" &&
            Number(f).toString() !== "NaN"
          ) {
            vm.data.total_floors = undefined; //Number(f);
          } else if (typeof f === "string") {
            if (f.includes("G+2")) {
              vm.data.total_floors = 2;
            } else if (f.includes("G+3")) {
              vm.data.total_floors = 3;
            } else if (f.includes("G+4")) {
              vm.data.total_floors = 4;
            } else if (f.includes("Stilt+3")) {
              vm.data.total_floors = 3;
            } else if (f.includes("Stilt+4")) {
              vm.data.total_floors = 4;
            }
          }
        }
        console.log("vm.data before uploading", vm.data);
        $http.post("/api/project/edit", vm.data).then(
          function (res) {
            alert(res.data.message);
            if (res.data.success) {
              window.location = "/admin-panel#/app/project/view";
            }
          },
          function (error) {
            vm.loader = false;
            $rootScope.createError(
              "Some error occured while editing project .."
            );
          }
        );
      }
    });
    vm.bannerValueChanged = function (value) {
      vm.new_banner_image = value;
    };
    // Js for google maps
    function drawMap(lat, lng) {
      var currentLocation = {};
      currentLocation["lat"] = parseFloat(lat);
      currentLocation["lng"] = parseFloat(lng);
      var map = new google.maps.Map(document.getElementById("map"), {
        center: currentLocation,
        zoom: 13,
        mapTypeId: "roadmap",
      });
      var marker = new google.maps.Marker({
        position: currentLocation,
        map: map,
        draggable: true,
        title: "Drag me!",
      });
      document.getElementById("lat").value = marker.getPosition().lat();
      document.getElementById("lng").value = marker.getPosition().lng();
      google.maps.event.addListener(marker, "drag", function () {
        document.getElementById("lat").value = marker.getPosition().lat();
        document.getElementById("lng").value = marker.getPosition().lng();
      });
      google.maps.event.addListener(marker, "dragend", function () {
        document.getElementById("lat").value = marker.getPosition().lat();
        document.getElementById("lng").value = marker.getPosition().lng();
      });
      // Create the search box and link it to the UI element.
      var input = document.getElementById("pac-input");
      var searchBox = new google.maps.places.SearchBox(input);
      map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

      // Bias the SearchBox results towards current map's viewport.
      map.addListener("bounds_changed", function () {
        searchBox.setBounds(map.getBounds());
      });

      var markers = [];
      // Listen for the event fired when the user selects a prediction and retrieve
      // more details for that place.
      searchBox.addListener("places_changed", function () {
        var places = searchBox.getPlaces();
        if (places.length == 0) {
          return;
        }

        // Clear out the old markers.
        markers.forEach(function (marker) {
          marker.setMap(null);
        });
        markers = [];

        // For each place, get the icon, name and location.
        var bounds = new google.maps.LatLngBounds();
        var count = 0;
        places.forEach(function (place) {
          if (!place.geometry) {
            console.log("Returned place contains no geometry");
            return;
          }
          count++;
          if (count == 1) {
            var marker = new google.maps.Marker({
              position: place.geometry.location,
              map: map,
              draggable: true,
              title: "Drag me!",
            });
            document.getElementById("lat").value = marker.getPosition().lat();
            document.getElementById("lng").value = marker.getPosition().lng();
            google.maps.event.addListener(marker, "drag", function () {
              document.getElementById("lat").value = marker.getPosition().lat();
              document.getElementById("lng").value = marker.getPosition().lng();
            });
            google.maps.event.addListener(marker, "dragend", function () {
              document.getElementById("lat").value = marker.getPosition().lat();
              document.getElementById("lng").value = marker.getPosition().lng();
            });
            markers.push(marker);
          }
          if (place.geometry.viewport) {
            // Only geocodes have viewport.
            bounds.union(place.geometry.viewport);
          } else {
            bounds.extend(place.geometry.location);
          }
        });
        map.fitBounds(bounds);
      });
    }
    window.initAutocomplete = function () {
      vm.mapInit = vm.mapInit + 1;
    };

    vm.removeParameter = function (elementId, variable, index) {
      document.getElementById(elementId).value = null;
      variable[index] = {};
    };
  }
})();
