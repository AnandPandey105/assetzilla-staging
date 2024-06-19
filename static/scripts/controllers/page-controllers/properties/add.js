(function () {
  "use strict";
  angular
    .module("app", ["summernote", "ui.bootstrap", "ngSanitize"])
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
    .controller("AddPropertyCtrl", AddPropertyCtrl);

  AddPropertyCtrl.$inject = [
    "$scope",
    "$http",
    "$rootScope",
    "$compile",
    "$location",
    "$sce",
  ];

  function AddPropertyCtrl(
    $scope,
    $http,
    $rootScope,
    $compile,
    $location,
    $sce
  ) {
    var vm = $scope;
    vm.typeaheadEditable = false;
    vm.copy_elements = [
      "builder",
      "authority",
      "property_type",
      "project_status",
      "expected_completion",
      "address",
      "pincode",
      "state",
      "district",
      "city",
      "subcity",
    ];
    vm.propertyTypeKeys = [];
    vm.set_default = function () {
      vm.data = {};
      vm.data.images = {};
      vm.new_images = [{}];
      vm.data.banner_image = 0;
      vm.data.images.Properties = [];
      vm.project_floor_plan = [];
      vm.project_site_plan = [];
      vm.project_brochure = [];
      vm.project_price_list = [];
      vm.project_specification = [];
      vm.project_other_document = [];
      vm.project_images = [];
      vm.type_ = [];
      vm.floors = [];
      vm.data.price = {};
      vm.data.price.price = 0;
      vm.data.bhk_space = "";
      vm.data.propertyType = "";
      vm.data.userEnteredCity = "";
    };
    vm.loader = false;
    vm.trustSrc = function (src) {
      return $sce.trustAsResourceUrl(src);
    };
    vm.$watch("data.project", function (newValue, oldValue) {
      if (newValue != oldValue && newValue != undefined) {
        vm.getProjectData();
      }
    });
    vm.$watch("data.propertyType", function (newValue, oldValue) {
      console.log();
      if (newValue != oldValue && newValue != undefined) {
        if (newValue != "") {
          vm.propertyTypeKeys = Object.keys(
            vm.projectOptions[vm.data.propertyType]
          );
          vm.propertyTypeKeys.forEach(
            (key) =>
              (vm.data[key] = vm.projectOptions[vm.data.propertyType][key])
          );
          console.log(
            "vm.projectOptions[vm.data.propertyType]",
            vm.projectOptions[vm.data.propertyType]
          );
          if ("area" in vm.projectOptions[vm.data.propertyType]) {
            vm.data.area = {};
            vm.data.area.area = vm.projectOptions[vm.data.propertyType]["area"];
            vm.data.area.unit = "sqft";
          }
          vm.data.bhk_space =
            vm.projectOptions[vm.data.propertyType][vm.optionsKey];
        } else {
          vm.data.bhk_space = "";
          vm.propertyTypeKeys.forEach((key) => delete vm.data[key]);
          vm.data.area = {};
          vm.data.area.area = 0;
          vm.data.area.unit = "sqft";
        }
      }
    });
    vm.$watch("data.price.type", function (newValue, oldValue) {
      if (newValue != oldValue && newValue != undefined) {
        vm.data.price = {};
        vm.data.price.type = newValue;
        vm.data.price.price = 0;
      }
    });
    vm.$watch("data.price.rent", function (newValue, oldValue) {
      if (newValue != oldValue && newValue != undefined) {
        vm.data.price.rentalYield = parseFloat(
          (((vm.data.price.rent * 12) / vm.data.price.price) * 100).toFixed(2)
        );
      }
    });
    vm.$watch("data.price.price", function (newValue, oldValue) {
      if (newValue != oldValue && newValue != undefined) {
        vm.data.price.rentalYield = parseFloat(
          (((vm.data.price.rent * 12) / vm.data.price.price) * 100).toFixed(2)
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
          .post("/api/property/summernoteMulter", fds, {
            headers: { "Content-Type": undefined },
            transformRequest: angular.identity,
          })
          .then(
            function (res) {
              console.log(res);
              res.data.results.forEach((i) => {
                // vm.data[field] += `<img src='https://assetzilla-bucket.s3.amazonaws.com/dyn-res/property/image/${i}' style="width:100%"/>`
                let url = `https://d13ir9awo5x8gl.cloudfront.net/dyn-res/property/image/${i}`;
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

    vm.getProjectData = function () {
      console.log("project is ", vm.data.project);

      if (vm.data.project && vm.data.project.url) {
        $http
          .post("/api/project/get-one", { data: vm.data.project.url })
          .then(function (res) {
            if (res.data.success) {
              console.log("project details", res.data);
              let project_data = res.data.results[0];
              vm.data.construction_years =
                res.data.results[0].expected_completion;
              vm.data.project_url = res.data.results[0].url;
              vm.data.project = res.data.results[0].name;
              vm.project_floor_plan = [];
              vm.project_site_plan = [];
              vm.project_brochure = [];
              vm.project_price_list = [];
              vm.project_specification = [];
              vm.project_other_document = [];
              vm.project_images = [];
              vm.type_ = [];
              vm.floors = [];
              vm.location = {};
              vm.data.total_floors = project_data.total_floors;
              vm.data.floors = project_data.floors;

              if (!project_data.total_floors) {
                console.log("lj");
                if (
                  project_data.floors &&
                  project_data.property_type === "Villas"
                ) {
                  let f = project_data.floors;
                  console.log("==>", f);
                  if (
                    typeof f === "string" &&
                    typeof Number(f) === "number" &&
                    Number(f).toString() !== "NaN"
                  ) {
                    vm.data.total_floors = Number(f);
                  } else if (typeof f === "string") {
                    if (f.includes("G+1")) {
                      vm.data["total_floors"] = 1;
                    } else if (f.includes("G+2")) {
                      console.log("j");
                      vm.data.total_floors = 2;
                      console.log(vm.data);
                    } else if (f.includes("G+3")) {
                      vm.data.total_floors = 3;
                    } else if (f.includes("G+4")) {
                      vm.data.total_floors = 4;
                    } else if (f.includes("Ground Floor")) {
                      vm.data.total_floors = 0;
                    }
                  }
                } else if (
                  project_data.floors &&
                  project_data.property_type === "Floors"
                ) {
                  let f = project_data.floors;
                  console.log("Floors");
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
              }

              console.log("vm.data", vm.data);
              if ("total_floors" in vm.data) {
                console.log("hey", vm.data.floors && !vm.data.floors.includes("Stilt+"), vm.data.property_type === "Apartments", "property_type" in vm.data, Object.keys(vm.data), project_data.property_type)
                if (vm.data.floors && !vm.data.floors.includes("Stilt+")) {
                  vm.floors.push("Ground Floor");
                } else if (project_data.property_type === "Apartments"){
                  vm.floors.push("Ground Floor");
                }
                for (
                  let index = 1;
                  index <= Number(vm.data["total_floors"]);
                  index++
                ) {
                  console.log("total_floors" in vm.data);
                  vm.floors.push(index);
                }
              }

              vm.projectOptions = project_data["details"];
              vm.copy_elements.forEach((element) => {
                if (element in project_data) {
                  vm.data[element] = project_data[element];
                  if (
                    element !== "city" &&
                    vm.case_id_details.userSubmittedCity
                  ) {
                    vm.case_id_details.city = vm.data["city"];
                    console.log(vm.case_id_details.city);
                  }
                }
              });
              if (
                project_data["property_type"] == "Residential Plots" ||
                project_data["property_type"] == "Commercial Land" ||
                project_data["property_type"] == "Industrial Land" ||
                project_data["property_type"] == "Farm house"
              ) {
                vm.optionsKey = "name";
              } else if (
                project_data["property_type"] == "Villas" ||
                project_data["property_type"] == "Apartments" ||
                project_data["property_type"] == "Floors" ||
                project_data["property_type"] == "Commercial Office" ||
                project_data["property_type"] == "Serviced Apartments" ||
                project_data["property_type"] == "Penthouse" ||
                project_data["property_type"] == "Duplex"
              ) {
                vm.optionsKey = "unit_size";
              } else if (project_data["property_type"] == "Retail Shop") {
                vm.optionsKey = "shop_type";
              }
              if ("images" in project_data) {
                project_data.images.Projects.forEach((element) => {
                  vm.project_images.push({
                    selected: true,
                    name:
                      "https://d13ir9awo5x8gl.cloudfront.net/dyn-res/project/image/" +
                      element,
                    file_name: element,
                  });
                });
              }
              if ("floor_plan" in project_data) {
                project_data.floor_plan.forEach((element) => {
                  vm.project_floor_plan.push({
                    selected: true,
                    name:
                      "https://docs.google.com/gview?url=https://d13ir9awo5x8gl.cloudfront.net/dyn-res/project/doc/" +
                      element +
                      "&embedded=true",
                    file_name: element,
                  });
                });
              }
              if ("site_plan" in project_data) {
                project_data.site_plan.forEach((element) => {
                  vm.project_site_plan.push({
                    selected: true,
                    name:
                      "https://docs.google.com/gview?url=https://d13ir9awo5x8gl.cloudfront.net/dyn-res/project/doc/" +
                      element +
                      "&embedded=true",
                    file_name: element,
                  });
                });
              }
              if ("brochure" in project_data) {
                project_data.brochure.forEach((element) => {
                  vm.project_brochure.push({
                    selected: true,
                    name:
                      "https://docs.google.com/gview?url=https://d13ir9awo5x8gl.cloudfront.net/dyn-res/project/doc/" +
                      element +
                      "&embedded=true",
                    file_name: element,
                  });
                });
              }
              if ("price_list" in project_data) {
                project_data.price_list.forEach((element) => {
                  vm.project_price_list.push({
                    selected: true,
                    name:
                      "https://docs.google.com/gview?url=https://d13ir9awo5x8gl.cloudfront.net/dyn-res/project/doc/" +
                      element +
                      "&embedded=true",
                    file_name: element,
                  });
                });
              }
              if ("specification" in project_data) {
                project_data.specification.forEach((element) => {
                  vm.project_specification.push({
                    selected: true,
                    name:
                      "https://docs.google.com/gview?url=https://d13ir9awo5x8gl.cloudfront.net/dyn-res/project/doc/" +
                      element +
                      "&embedded=true",
                    file_name: element,
                  });
                });
              }
              if ("other_document" in project_data) {
                project_data.other_document.forEach((element) => {
                  vm.project_other_document.push({
                    selected: true,
                    name:
                      "https://docs.google.com/gview?url=https://d13ir9awo5x8gl.cloudfront.net/dyn-res/project/doc/" +
                      element +
                      "&embedded=true",
                    file_name: element,
                  });
                });
              }
              if ("location" in project_data) {
                vm.data.location = project_data.location;
              }
            }
          });
      }
    };
    vm.get_caseid = function () {
      return $http.get("/api/usp/get_caseid").then(function (response) {
        vm.case_ids = response.data.data;
      });
    };
    vm.getPropertyImages = function () {
      vm.caseId = $location.search()["case_id"];
      if (vm.caseId) {
        $http
          .get(`/api/usp/getSubmittedPropertyDetails/${vm.caseId}`)
          .then(function (res) {
            let property_data = res.data;
            // vm.copy_elements.forEach(element => {
            //     if (element in project_data) { vm.data[element] = project_data[element] }
            // });

            vm.property_images = [];
            if ("property_images" in property_data) {
              property_data.property_images.forEach((element) => {
                vm.property_images.push({
                  selected: true,
                  name:
                    "https://d13ir9awo5x8gl.cloudfront.net/dyn-res/property/image/" +
                    element,
                  file_name: element,
                });
                console.log("yyyyy", vm.property_images);
              });
            }
          });
      }
    };
    vm.getPropertyImages();
    vm.get_caseid();
    vm.getProjects = function (val) {
      return $http
        .post("/api/project/typeahead", {
          data: val,
        })
        .then(function (response) {
          return response.data.results.map(function (item) {
            // console.log("item ", item);
            return { name: item.name, type: item.property_type, url: item.url };
          });
        });
    };

    vm.getBanks = function (val) {
      return $http
        .post("/api/bank/typeahead", {
          data: val,
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

    function getId(url) {
      // function convert youtube link into embeded one
      const regExp =
        /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);

      return match && match[2].length === 11 ? match[2] : null;
    }

    vm.add = function () {
      console.log("data is", vm.data);
      if (vm.data.video_url) {
        // convert youtube link into embeded one
        const videoId = getId(vm.data.video_url);
        const embedLink = "https://www.youtube.com/embed/" + videoId;
        vm.data.video_url = embedLink;
      }

      // if (vm.data.bhk_space == "") {
      //     alert('Please select Property type')
      //     return;
      // }
      vm.loader = true;
      //if (vm.data.propertyType == undefined) { alert("Please select a Property Type/Size"); vm.loader = false; return }
      if (vm.data.condition == undefined) {
        alert("Please select a Deal Type");
        vm.loader = false;
        return;
      }
      if (vm.data.unit_number == undefined) {
        alert("Please select a Unit Number");
        vm.loader = false;
        return;
      }

      if (
        vm.data.property_type !== "Villas" &&
        vm.data.property_type !== "Residential Plots" &&
        vm.data.tower_number == undefined
      ) {
        alert("Please select a Tower Number");
        vm.loader = false;
        return;
      }
      if (
        vm.data.property_type !== "Villas" &&
        vm.data.property_type !== "Residential Plots" &&
        vm.data.property_type !== "Commercial Land" &&
        vm.data.floor == undefined
      ) {
        alert("Please select a Floor");
        vm.loader = false;
        return;
      }
      if (!vm.data.price.type) {
        alert("Please select a cost calculation type");
        vm.loader = false;
        return;
      }
      if (
        vm.data.price.type == "fc" &&
        (vm.data.price.price == undefined || vm.data.price.price == 0)
      ) {
        alert("Please enter cost");
        vm.loader = false;
        return;
      }
      if (
        vm.data.price.type == "cc" &&
        (vm.data.price.price == undefined || vm.data.price.price == 0)
      ) {
        alert("Please enter cost");
        vm.loader = false;
        return;
      }
      if (vm.data.owner_phone) {
        const regExp =
          /((\+*)((0[ -]*)*|((91 )*))((\d{12})+|(\d{10})+))|\d{5}([- ]*)\d{6}/g;
        const match = vm.data.owner_phone.match(regExp);
        if (!match) {
          alert("Invalid Owner Phone Number");
          vm.loader = false;
          return;
        }
      }

      delete vm.data.propertyType;
      var fd = new FormData();
      console.log("vm.data : ", vm.data);
      // vm.data.images.Properties.forEach(image => {
      //     if (typeof (image) === 'object' && 'name' in image) {
      //         if (image.type === 'image/jpeg' || image.type === 'image/png') {
      //             fd.append("file", image);
      //         } else {
      //             vm.loader = false;
      //             alert('Please upload only image files')
      //             return;
      //         }
      //     }
      // });
      vm.new_images.forEach((image) => {
        if ("name" in image) {
          if (image.type === "image/jpeg" || image.type === "image/png") {
            fd.append("file", image);
          } else {
            vm.loader = false;
            alert("Please upload only image files");
            return;
          }
        }
      });
      let property_images = [];
      if (vm.property_images && vm.property_images.length > 0) {
        vm.property_images.forEach((element) => {
          if (element.selected) {
            property_images.push(element.file_name);
          }
        });
      }
      if (property_images.length > 0) {
        vm.data.images.Properties = property_images;
      }
      let project_images = [];
      vm.project_images.forEach((element) => {
        if (element.selected) {
          project_images.push(element.file_name);
        }
      });
      if (project_images.length > 0) {
        vm.data.images.Projects = project_images;
      }
      let floor_plan = [];
      vm.project_floor_plan.forEach((element) => {
        if (element.selected) {
          floor_plan.push(element.file_name);
        }
      });
      if (floor_plan.length > 0) {
        vm.data.floor_plan = floor_plan;
      }
      let site_plan = [];
      vm.project_site_plan.forEach((element) => {
        if (element.selected) {
          site_plan.push(element.file_name);
        }
      });
      if (site_plan.length > 0) {
        vm.data.site_plan = site_plan;
      }
      let brochure = [];
      vm.project_brochure.forEach((element) => {
        if (element.selected) {
          brochure.push(element.file_name);
        }
      });
      if (brochure.length > 0) {
        vm.data.brochure = brochure;
      }
      let price_list = [];
      vm.project_price_list.forEach((element) => {
        if (element.selected) {
          price_list.push(element.file_name);
        }
      });
      if (price_list.length > 0) {
        vm.data.price_list = price_list;
      }
      let specification = [];
      vm.project_specification.forEach((element) => {
        if (element.selected) {
          specification.push(element.file_name);
        }
      });
      if (specification.length > 0) {
        vm.data.specification = specification;
      }
      let other_document = [];
      vm.project_other_document.forEach((element) => {
        if (element.selected) {
          other_document.push(element.file_name);
        }
      });
      if (other_document.length > 0) {
        vm.data.other_document = other_document;
      }
      console.log("fd properties is:", fd);
      $http
        .post("/api/property/multer", fd, {
          headers: { "Content-Type": undefined },
          transformRequest: angular.identity,
        })
        .then(
          function (res) {
            if (res.data.success) {
              // vm.data.images.Properties = res.data.results;
              // vm.data.banner_image = ["Properties", vm.data.images.Properties[vm.data.banner_image]]
              // console.log('chcking for caseid-----------', vm.data)
              // // vm.data.project_url = vm.data.project.url
              // // vm.data.construction_years = vm.
              if (res.data.results && res.data.results.length > 0) {
                res.data.results.forEach((element) => {
                  vm.data.images.Properties.push(element);
                });
              }
              if (vm.data.images.Properties.length > 0) {
                vm.data.banner_image = [
                  "Properties",
                  vm.data.images.Properties[0],
                ];
              } else {
                vm.data.banner_image = ["Properties", undefined];
              }
              if (vm.data.floor === "Ground Floor") {
                vm.data.floor = "0";
              }
              console.log("before saving, data is ", vm.data);
              $http.post("/api/property/add", vm.data).then(
                function (res) {
                  alert(res.data.message);
                  if (res.data.success) {
                    console.log("username:", vm.case_id_details.realUsername);
                    $http
                      .post("/api/usp/addmappedcity", {
                        username: vm.case_id_details.realUsername,
                        caseid: vm.case_id_details.case_id,
                        city: vm.data["city"],
                      })
                      .then(function (res) {
                        console.log("res :", res);
                        if (res.data.success) {
                          console.log("Saved!");
                        } else {
                          console.log("not saved!");
                        }
                      })
                      .catch((addMappedCityError) => {
                        console.log(
                          "Error while hitting /api/usp/addmappedcity",
                          addMappedCityError
                        );
                      });
                    window.location = "/admin-panel#/app/property/view";
                  }
                },
                function (error) {
                  vm.loader = false;
                  $rootScope.createError(
                    "Some error occured while addng Property .."
                  );
                }
              );
            }
          },
          function (error) {
            vm.loader = false;
            $rootScope.createError(
              "Some error occured while uploading Property images .."
            );
          }
        );
    };
    vm.set_default();

    vm.calculatePrice = function (field, value) {
      if (value) {
        var newfield = "calculated_" + field;
        if (vm.data.price[newfield]) {
          vm.data.price.price = vm.data.price.price - vm.data.price[newfield];
        }
        vm.data.price[newfield] = vm.data.price[field] * value;
        vm.data.price.price = vm.data.price.price + vm.data.price[newfield];
      }
    };

    vm.removeParameter = function (elementId, variable, index) {
      document.getElementById(elementId).value = null;
      variable[index] = {};
    };

    // Add check for caseId
    vm.case_id = $location.search()["case_id"];
    vm.case_id_details = {};
    vm.show_case_id_details = false;
    vm.get_caseid_details = function () {
      return $http
        .get(`/api/usp/getSubmittedPropertyDetails/${vm.case_id}`)
        .then(function (response) {
          console.log("response.data", response.data);
          if (response.data && response.data.success) {
            vm.show_case_id_details = true;
            vm.case_id_details = response.data.data;
            vm.data.case_id = vm.case_id;
          }
        });
    };
    if (vm.case_id) {
      vm.get_caseid_details();
    }
  }
})();
