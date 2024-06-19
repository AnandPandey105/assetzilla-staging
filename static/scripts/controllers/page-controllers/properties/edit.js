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
    .controller("EditPropertyCtrl", EditPropertyCtrl);

  EditPropertyCtrl.$inject = [
    "$scope",
    "$http",
    "$rootScope",
    "$compile",
    "$location",
    "$sce",
  ];

  function EditPropertyCtrl(
    $scope,
    $http,
    $rootScope,
    $compile,
    $location,
    $sce
  ) {
    var vm = $scope;
    vm.new_images = [{}];
    vm.new_banner_image = 0;
    vm.propType = "";
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
    vm.set_data = function () {
      vm.data = {};
      vm.floors = [];
      let url = window.location.hash;
      url = url.split("?")[1].split("=")[1];
      $http
        .post("/api/property/get-doc", { url: decodeURIComponent(url) })
        .then(function (res) {
          if (res.data.success) {
            vm.data = res.data.data;
            vm.case_id = vm.data.case_id;

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

            console.log("========", vm.data);

            if (vm.data.floor === 0) {
              console.log("hi");
              vm.data.floor = "Ground Floor";
            } else if (typeof vm.data.floor === "number") {
              vm.data.floor = String(vm.data.floor);
            }

            console.log("Floor is", typeof vm.data.floor, vm.data.floor);

            vm.new_banner_image = vm.data.images.Properties.indexOf(
              vm.data.banner_image[1]
            );

            console.log("vm.floors :", vm.floors);
            console.log(vm.data);
            vm.data.construction_years = new Date(vm.data.construction_years);
            if (vm.data["price"] == undefined || vm.data["price"] == null) {
              vm.data.price = {};
              vm.data.price.price = 0;
            }
            vm.getProjectData();
          }
        });
    };
    vm.set_data();
    vm.loader = false;
    vm.trustSrc = function (src) {
      return $sce.trustAsResourceUrl(src);
    };
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
      if (vm.data && vm.data.project_url) {
        $http
          .post("/api/project/get-one", { data: vm.data.project_url })
          .then(function (res) {
            if (res.data.success) {
              let project_data = res.data.results[0];
              vm.project_floor_plan = [];
              vm.project_site_plan = [];
              vm.project_brochure = [];
              vm.project_price_list = [];
              vm.project_specification = [];
              vm.project_other_document = [];
              vm.project_images = [];
              vm.type_ = [];
              vm.projectOptions = project_data["details"];
              // console.log('project options', vm.projectOptions)
              vm.copy_elements.forEach((element) => {
                if (element in project_data) {
                  vm.data[element] = project_data[element];
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

              // console.log(vm.data['bhk_space'] + " | "+ vm.data.area.area )
              for (let i = 0; i < vm.projectOptions.length; i++) {
                if (
                  vm.projectOptions[i][vm.optionsKey] == vm.data["bhk_space"] &&
                  vm.projectOptions[i]["area"] == vm.data.area.area
                ) {
                  console.log(
                    " i is ",
                    i,
                    vm.projectOptions[i][vm.optionsKey],
                    vm.projectOptions[i]["area"]
                  );

                  vm.data.propertyType = i;
                  vm.data.propertyType = "" + vm.data.propertyType;
                  console.log(
                    "vm.data.propertyType ",
                    typeof vm.data.propertyType
                  );
                }
              }

              if ("images" in project_data) {
                project_data.images.Projects.forEach((element) => {
                  let does_exist = false;
                  if (
                    "Projects" in vm.data.images &&
                    vm.data.images.Projects.indexOf(element) > -1
                  ) {
                    does_exist = true;
                  }
                  vm.project_images.push({
                    selected: does_exist,
                    name:
                      "https://d13ir9awo5x8gl.cloudfront.net/dyn-res/project/image/" +
                      element,
                    file_name: element,
                  });
                });
              }
              if ("floor_plan" in project_data) {
                project_data.floor_plan.forEach((element) => {
                  let does_exist = false;
                  if (
                    "floor_plan" in vm.data &&
                    vm.data.floor_plan.indexOf(element) > -1
                  ) {
                    does_exist = true;
                  }
                  vm.project_floor_plan.push({
                    selected: does_exist,
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
                  let does_exist = false;
                  if (
                    "site_plan" in vm.data &&
                    vm.data.site_plan.indexOf(element) > -1
                  ) {
                    does_exist = true;
                  }
                  vm.project_site_plan.push({
                    selected: does_exist,
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
                  let does_exist = false;
                  if (
                    "brochure" in vm.data &&
                    vm.data.brochure.indexOf(element) > -1
                  ) {
                    does_exist = true;
                  }
                  vm.project_brochure.push({
                    selected: does_exist,
                    name:
                      "https://docs.google.com/gview?url=https://d13ir9awo5x8gl.cloudfront.net/dyn-res/project/doc/" +
                      element +
                      "&embedded=true",
                    file_name: element,
                  });
                });
              }
              console.log("project_data", project_data);

              if ("floors" in project_data) {
                if (project_data.property_type === "Villas") {
                  let f = project_data.floors;
                  if (
                    typeof f === "string" &&
                    typeof Number(f) === "number" &&
                    Number(f).toString() !== "NaN"
                  ) {
                    project_data.total_floors = undefined; //Number(f);
                  } else if (typeof f === "string") {
                    if (f.includes("G+1")) {
                      project_data.total_floors = 1;
                    } else if (f.includes("G+2")) {
                      console.log(f);
                      project_data.total_floors = 2;
                      console.log("total_floors" in project_data);
                    } else if (f.includes("G+3")) {
                      project_data.total_floors = 3;
                    } else if (f.includes("G+4")) {
                      project_data.total_floors = 4;
                    } else if (f.includes("Ground Floor")) {
                      project_data.total_floors = 0;
                    }
                  }
                } else if (project_data.property_type === "Floors") {
                  let f = project_data.floors;
                  if (
                    typeof f === "string" &&
                    typeof Number(f) === "number" &&
                    Number(f).toString() !== "NaN"
                  ) {
                    project_data.total_floors = undefined; //Number(f);
                  } else if (typeof f === "string") {
                    if (f.includes("G+2")) {
                      project_data.total_floors = 2;
                    } else if (f.includes("G+3")) {
                      project_data.total_floors = 3;
                    } else if (f.includes("G+4")) {
                      project_data.total_floors = 4;
                    } else if (f.includes("Stilt+3")) {
                      project_data.total_floors = 3;
                    } else if (f.includes("Stilt+4")) {
                      project_data.total_floors = 4;
                    }
                  }
                }
              }
              if ("total_floors" in project_data) {
                if (
                  project_data.floors &&
                  !project_data.floors.includes("Stilt+")
                ) {
                  vm.floors.push("Ground Floor");
                } else if (project_data.property_type === "Apartments"){
                  vm.floors.push("Ground Floor");
                }
                for (
                  let index = 1;
                  index <= Number(project_data["total_floors"]);
                  index++
                ) {
                  vm.floors.push(index);
                }
              }
              // if ("total_floors" in vm.data){
              //   vm.floors = vm.data.total_floors
              // }
              if ("price_list" in project_data) {
                project_data.price_list.forEach((element) => {
                  let does_exist = false;
                  if (
                    "price_list" in vm.data &&
                    vm.data.price_list.indexOf(element) > -1
                  ) {
                    does_exist = true;
                  }
                  vm.project_price_list.push({
                    selected: does_exist,
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
                  let does_exist = false;
                  if (
                    "specification" in vm.data &&
                    vm.data.specification.indexOf(element) > -1
                  ) {
                    does_exist = true;
                  }
                  vm.project_specification.push({
                    selected: does_exist,
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
                  let does_exist = false;
                  if (
                    "other_document" in vm.data &&
                    vm.data.other_document.indexOf(element) > -1
                  ) {
                    does_exist = true;
                  }
                  vm.project_other_document.push({
                    selected: does_exist,
                    name:
                      "https://docs.google.com/gview?url=https://d13ir9awo5x8gl.cloudfront.net/dyn-res/project/doc/" +
                      element +
                      "&embedded=true",
                    file_name: element,
                  });
                });
              }
            }
          });
      }
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

    vm.get_caseid = function () {
      return $http.get("/api/customer/get_caseid").then(function (response) {
        vm.case_ids = response.data.data;
      });
    };
    vm.get_caseid();

    function getId(url) {
      // function convert youtube link into embeded one
      const regExp =
        /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);

      return match && match[2].length === 11 ? match[2] : null;
    }

    vm.$watch("data.propertyType", function (newValue, oldValue) {
      // console.log()
      if (newValue != oldValue && newValue != undefined) {
        if (newValue != "") {
          vm.propertyTypeKeys = Object.keys(
            vm.projectOptions[vm.data.propertyType]
          );
          vm.propertyTypeKeys.forEach(
            (key) =>
              (vm.data[key] = vm.projectOptions[vm.data.propertyType][key])
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

    vm.edit = function () {
      // console.log('property Type is :', vm.data.propertyType)
      vm.data.floor =
        vm.data.floor === "Ground Floor" ? 0 : Number(vm.data.floor);
      if (vm.data.video_url && vm.data.video_url.length > 0) {
        // convert youtube link into embeded one
        const videoId = getId(vm.data.video_url);
        const embedLink = "https://www.youtube.com/embed/" + videoId;
        vm.data.video_url = embedLink;
        // console.log(vm.data.video_url);
      } else {
        vm.data.video_url = "";
      }
      vm.loader = true;

      if (vm.data.propertyType == undefined) {
        alert("Please select a Property Type/Size");
        vm.loader = false;
        return;
      }
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

      var fd = new FormData();
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
      let project_images = [];
      vm.project_images.forEach((element) => {
        if (element.selected) {
          project_images.push(element.file_name);
        }
      });
      if (project_images.length > 0) {
        vm.data.images.Projects = project_images;
      } else if ("Projects" in vm.data) {
        delete vm.data.images.Projects;
      }

      let floor_plan = [];
      vm.project_floor_plan.forEach((element) => {
        if (element.selected) {
          floor_plan.push(element.file_name);
        }
      });
      if (floor_plan.length > 0) {
        vm.data.floor_plan = floor_plan;
      } else if ("floor_plan" in vm.data) {
        delete vm.data.floor_plan;
      }

      let site_plan = [];
      vm.project_site_plan.forEach((element) => {
        if (element.selected) {
          site_plan.push(element.file_name);
        }
      });
      if (site_plan.length > 0) {
        vm.data.site_plan = site_plan;
      } else if ("site_plan" in vm.data) {
        delete vm.data.site_plan;
      }

      let brochure = [];
      vm.project_brochure.forEach((element) => {
        if (element.selected) {
          brochure.push(element.file_name);
        }
      });
      if (brochure.length > 0) {
        vm.data.brochure = brochure;
      } else if ("brochure" in vm.data) {
        delete vm.data.brochure;
      }

      let price_list = [];
      vm.project_price_list.forEach((element) => {
        if (element.selected) {
          price_list.push(element.file_name);
        }
      });
      if (price_list.length > 0) {
        vm.data.price_list = price_list;
      } else if ("price_list" in vm.data) {
        delete vm.data.price_list;
      }

      let specification = [];
      vm.project_specification.forEach((element) => {
        if (element.selected) {
          specification.push(element.file_name);
        }
      });
      if (specification.length > 0) {
        vm.data.specification = specification;
      } else if ("specification" in vm.data) {
        delete vm.data.specification;
      }

      let other_document = [];
      vm.project_other_document.forEach((element) => {
        if (element.selected) {
          other_document.push(element.file_name);
        }
      });
      if (other_document.length > 0) {
        vm.data.other_document = other_document;
      } else if ("other_document" in vm.data) {
        delete vm.data.other_document;
      }

      $http
        .post("/api/property/multer", fd, {
          headers: { "Content-Type": undefined },
          transformRequest: angular.identity,
        })
        .then(
          function (res) {
            if (res.data.success) {
              res.data.results.forEach((element) => {
                vm.data.images.Properties.push(element);
              });
              vm.data.banner_image = [
                "Properties",
                vm.data.images.Properties[vm.new_banner_image],
              ];
              console.log(" data before editing", vm.data.name);
              if (vm.data.floor === "Ground Floor") {
                vm.data.floor = "0";
              }
              $http.post("/api/property/edit", vm.data).then(
                function (res) {
                  alert(res.data.message);
                  if (res.data.success) {
                    window.location = "/admin-panel#/app/property/view";
                  }
                },
                function (err) {
                  vm.loader = false;
                  $rootScope.createError(
                    "Some error occured editing property .."
                  );
                }
              );
            }
          },
          function (err) {
            vm.loader = false;
            $rootScope.createError("Some error occured uploading images ..");
          }
        );
    };
    vm.bannerValueChanged = function (value) {
      vm.new_banner_image = value;
    };
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
    vm.changePriceType = function () {
      var type = vm.data.price.type;
      vm.data.price = {};
      vm.data.price.type = type;
      vm.data.price.price = 0;
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
