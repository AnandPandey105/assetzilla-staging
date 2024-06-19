/**
 * @ngdoc function
 * @name app.config:uiRouter
 * @description
 * # Config
 * Config for the router
 */
(function () {
  "use strict";
  angular
    .module("app")
    .run(runBlock)
    .constant("USER_ROLES", {
      all: "*",
      Admin: "Admin",
      Manager: "Manager",
      Employee: "Employee",
      Misc: "Misc",
    })
    .config(config);

  runBlock.$inject = ["$rootScope", "$state", "$stateParams"];
  function runBlock($rootScope, $state, $stateParams) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
  }

  config.$inject = ["$stateProvider", "$urlRouterProvider", "MODULE_CONFIG"];
  function config($stateProvider, $urlRouterProvider, MODULE_CONFIG) {
    var p = getParams("layout"),
      l = p ? p + "." : "",
      layout = "../views/layout/layout." + l + "html",
      dashboard = "../views/pages/overview.html";

    $urlRouterProvider.otherwise("/app/dashboard");
    $stateProvider
      .state("app", {
        abstract: true,
        url: "/app",
        views: {
          "": {
            templateUrl: layout,
          },
        },
      })
      .state("app.dashboard", {
        url: "/dashboard",
        templateUrl: dashboard,
        data: {
          title: "overview",
          authorizedRoles: [
            "Super Admin",
            "Moderator",
            "Deo",
            "Sales Marketing",
          ],
        },
        controller: "OverviewCtrl",
        resolve: load([
          "scripts/controllers/page-controllers/overview.js",
          "ui.select",
        ]),
      })

      // applications

      // PROPERTY
      .state("app.add-property", {
        url: "/property/add",
        templateUrl: "../views/pages/properties/add.html",
        data: {
          title: "Add Property",
          hideFooter: true,
          authorizedRoles: [
            "Super Admin",
            "Moderator",
            "Deo",
            "Sales Marketing",
          ],
        },
        controller: "AddPropertyCtrl",
        resolve: load([
          "scripts/controllers/page-controllers/properties/add.js",
          "ui.select",
          "mgcrea.ngStrap",
        ]),
      })
      .state("app.edit-property", {
        url: "/property/edit",
        templateUrl: "../views/pages/properties/edit.html",
        data: {
          title: "Edit Property",
          hideFooter: true,
          authorizedRoles: [
            "Super Admin",
            "Moderator",
            "Deo",
            "Sales Marketing",
          ],
        },
        controller: "EditPropertyCtrl",
        resolve: load([
          "scripts/controllers/page-controllers/properties/edit.js",
          "ui.select",
          "mgcrea.ngStrap",
        ]),
      })

      .state("app.view-property", {
        url: "/property/view",
        templateUrl: "../views/pages/properties/view.html",
        data: {
          title: "View Properties",
          hideFooter: true,
          authorizedRoles: [
            "Super Admin",
            "Moderator",
            "Deo",
            "Sales Marketing",
          ],
        },
        controller: "ViewPropertyCtrl",
        resolve: load([
          "scripts/controllers/page-controllers/properties/view.js",
          "scripts/controllers/components/view-table.js",
        ]),
      })

      // PROJECT
      .state("app.add-project", {
        url: "/project/add",
        templateUrl: "../views/pages/projects/add.html",
        data: {
          title: "Add Project",
          hideFooter: true,
          authorizedRoles: [
            "Super Admin",
            "Moderator",
            "Deo",
            "Sales Marketing",
          ],
        },
        controller: "AddProjectCtrl",
        resolve: load([
          "scripts/controllers/page-controllers/projects/add.js",
          "ui.select",
        ]),
      })

      .state("app.view-project", {
        url: "/project/view",
        templateUrl: "../views/pages/projects/view.html",
        data: {
          title: "View Projects",
          hideFooter: true,
          authorizedRoles: [
            "Super Admin",
            "Moderator",
            "Deo",
            "Sales Marketing",
          ],
        },
        controller: "ViewProjectCtrl",
        resolve: load([
          "scripts/controllers/page-controllers/projects/view.js",
          "scripts/controllers/components/view-table.js",
        ]),
      })
      .state("app.edit-project", {
        url: "/project/edit",
        templateUrl: "../views/pages/projects/edit.html",
        data: {
          title: "Edit Projects",
          hideFooter: true,
          authorizedRoles: [
            "Super Admin",
            "Moderator",
            "Deo",
            "Sales Marketing",
          ],
        },
        controller: "EditProjectCtrl",
        resolve: load([
          "scripts/controllers/page-controllers/projects/edit.js",
        ]),
      })

      // BUILDER
      .state("app.add-builder", {
        url: "/builder/add",
        templateUrl: "../views/pages/builders/add.html",
        data: {
          title: "Add Builder",
          hideFooter: true,
          authorizedRoles: [
            "Super Admin",
            "Moderator",
            "Deo",
            "Sales Marketing",
          ],
        },
        controller: "AddBuilderCtrl",
        resolve: load([
          "scripts/controllers/page-controllers/builders/add.js",
          "ui.select",
        ]),
      })

      .state("app.view-builder", {
        url: "/builder/view",
        templateUrl: "../views/pages/builders/view.html",
        data: {
          title: "View Builders",
          hideFooter: true,
          authorizedRoles: [
            "Super Admin",
            "Moderator",
            "Deo",
            "Sales Marketing",
          ],
        },
        controller: "ViewBuilderCtrl",
        resolve: load([
          "scripts/controllers/page-controllers/builders/view.js",
          "scripts/controllers/components/view-table.js",
        ]),
      })
      .state("app.edit-builder", {
        url: "/builder/edit",
        templateUrl: "../views/pages/builders/edit.html",
        data: {
          title: "Edit Builders",
          hideFooter: true,
          authorizedRoles: [
            "Super Admin",
            "Moderator",
            "Deo",
            "Sales Marketing",
          ],
        },
        controller: "EditBuilderCtrl",
        resolve: load([
          "scripts/controllers/page-controllers/builders/edit.js",
        ]),
      })

      // AUTHORTIY
      .state("app.add-authority", {
        url: "/authority/add",
        templateUrl: "../views/pages/authorities/add.html",
        data: {
          title: "Add Authority",
          hideFooter: true,
          authorizedRoles: [
            "Super Admin",
            "Moderator",
            "Deo",
            "Sales Marketing",
          ],
        },
        controller: "AddAuthorityCtrl",
        resolve: load([
          "scripts/controllers/page-controllers/authorities/add.js",
          "ui.select",
        ]),
      })

      .state("app.view-authority", {
        url: "/authority/view",
        templateUrl: "../views/pages/authorities/view.html",
        data: {
          title: "View Authorities",
          hideFooter: true,
          authorizedRoles: [
            "Super Admin",
            "Moderator",
            "Deo",
            "Sales Marketing",
          ],
        },
        controller: "ViewAuthorityCtrl",
        resolve: load([
          "scripts/controllers/page-controllers/authorities/view.js",
          "scripts/controllers/components/view-table.js",
        ]),
      })
      .state("app.edit-authority", {
        url: "/authority/edit",
        templateUrl: "../views/pages/authorities/edit.html",
        data: {
          title: "Edit Authorities",
          hideFooter: true,
          authorizedRoles: [
            "Super Admin",
            "Moderator",
            "Deo",
            "Sales Marketing",
          ],
        },
        controller: "EditAuthorityCtrl",
        resolve: load([
          "scripts/controllers/page-controllers/authorities/edit.js",
        ]),
      })

      // SUBCITY
      .state("app.add-subcity", {
        url: "/subcity/add",
        templateUrl: "../views/pages/subcities/add.html",
        data: {
          title: "Add Subcity",
          hideFooter: true,
          authorizedRoles: [
            "Super Admin",
            "Moderator",
            "Deo",
            "Sales Marketing",
          ],
        },
        controller: "AddSubCityCtrl",
        resolve: load([
          "scripts/controllers/page-controllers/subcities/add.js",
          "ui.select",
        ]),
      })

      .state("app.view-subcity", {
        url: "/subcity/view",
        templateUrl: "../views/pages/subcities/view.html",
        data: {
          title: "View Subcities",
          hideFooter: true,
          authorizedRoles: [
            "Super Admin",
            "Moderator",
            "Deo",
            "Sales Marketing",
          ],
        },
        controller: "ViewSubcityCtrl",
        resolve: load([
          "scripts/controllers/page-controllers/subcities/view.js",
          "scripts/controllers/components/view-table.js",
        ]),
      })
      .state("app.edit-subcity", {
        url: "/subcity/edit",
        templateUrl: "../views/pages/subcities/edit.html",
        data: {
          title: "Edit Subcities",
          hideFooter: true,
          authorizedRoles: [
            "Super Admin",
            "Moderator",
            "Deo",
            "Sales Marketing",
          ],
        },
        controller: "EditSubcityCtrl",
        resolve: load([
          "scripts/controllers/page-controllers/subcities/edit.js",
        ]),
      })

      // CITY
      .state("app.add-city", {
        url: "/city/add",
        templateUrl: "../views/pages/cities/add.html",
        data: {
          title: "Add City",
          hideFooter: true,
          authorizedRoles: [
            "Super Admin",
            "Moderator",
            "Deo",
            "Sales Marketing",
          ],
        },
        controller: "AddCityCtrl",
        resolve: load([
          "scripts/controllers/page-controllers/cities/add.js",
          "ui.select",
        ]),
      })

      .state("app.view-city", {
        url: "/city/view",
        templateUrl: "../views/pages/cities/view.html",
        data: {
          title: "View Cities",
          hideFooter: true,
          authorizedRoles: [
            "Super Admin",
            "Moderator",
            "Deo",
            "Sales Marketing",
          ],
        },
        controller: "ViewCityCtrl",
        resolve: load([
          "scripts/controllers/page-controllers/cities/view.js",
          "scripts/controllers/components/view-table.js",
        ]),
      })

      .state("app.edit-city", {
        url: "/city/edit",
        templateUrl: "../views/pages/cities/edit.html",
        data: {
          title: "Edit City",
          hideFooter: true,
          authorizedRoles: [
            "Super Admin",
            "Moderator",
            "Deo",
            "Sales Marketing",
          ],
        },
        controller: "EditCityCtrl",
        resolve: load([
          "scripts/controllers/page-controllers/cities/edit.js",
          "ui.select",
        ]),
      })
      // district
      .state("app.add-district", {
        url: "/district/add",
        templateUrl: "../views/pages/districts/add.html",
        data: {
          title: "Add District",
          hideFooter: true,
          authorizedRoles: [
            "Super Admin",
            "Moderator",
            "Deo",
            "Sales Marketing",
          ],
        },
        controller: "AddDistrictCtrl",
        resolve: load([
          "scripts/controllers/page-controllers/districts/add.js",
        ]),
      })

      .state("app.view-district", {
        url: "/district/view",
        templateUrl: "../views/pages/districts/view.html",
        data: {
          title: "View Districts",
          hideFooter: true,
          authorizedRoles: [
            "Super Admin",
            "Moderator",
            "Deo",
            "Sales Marketing",
          ],
        },
        controller: "ViewDistrictCtrl",
        resolve: load([
          "scripts/controllers/page-controllers/districts/view.js",
          "scripts/controllers/components/view-table.js",
        ]),
      })
      .state("app.edit-district", {
        url: "/district/edit",
        templateUrl: "../views/pages/districts/edit.html",
        data: {
          title: "Edit District",
          hideFooter: true,
          authorizedRoles: [
            "Super Admin",
            "Moderator",
            "Deo",
            "Sales Marketing",
          ],
        },
        controller: "EditDistrictCtrl",
        resolve: load([
          "scripts/controllers/page-controllers/districts/edit.js",
        ]),
      })
      // STATE
      .state("app.add-state", {
        url: "/state/add",
        templateUrl: "../views/pages/states/add.html",
        data: {
          title: "Add State",
          hideFooter: true,
          authorizedRoles: [
            "Super Admin",
            "Moderator",
            "Deo",
            "Sales Marketing",
          ],
        },
        controller: "AddStateCtrl",
        resolve: load(["scripts/controllers/page-controllers/states/add.js"]),
      })

      .state("app.view-state", {
        url: "/state/view",
        templateUrl: "../views/pages/states/view.html",
        data: {
          title: "View States",
          hideFooter: true,
          authorizedRoles: [
            "Super Admin",
            "Moderator",
            "Deo",
            "Sales Marketing",
          ],
        },
        controller: "ViewStateCtrl",
        resolve: load([
          "scripts/controllers/page-controllers/states/view.js",
          "scripts/controllers/components/view-table.js",
        ]),
      })
      .state("app.edit-state", {
        url: "/state/edit",
        templateUrl: "../views/pages/states/edit.html",
        data: {
          title: "Edit State",
          hideFooter: true,
          authorizedRoles: [
            "Super Admin",
            "Moderator",
            "Deo",
            "Sales Marketing",
          ],
        },
        controller: "EditStateCtrl",
        resolve: load(["scripts/controllers/page-controllers/states/edit.js"]),
      })
      // GRAPH
      .state("app.add-graph", {
        url: "/add-graph",
        templateUrl: "../views/pages/add-graph.html",
        data: {
          title: "Graph",
          hideFooter: true,
          authorizedRoles: ["Super Admin", "Moderator"],
        },
        controller: "AddGraphCtrl",
        resolve: load([
          "scripts/controllers/page-controllers/add-graph.js",
          "ui.select",
        ]),
      })

      .state("app.view-graph", {
        url: "/view-graph",
        templateUrl: "../views/pages/view-graph.html",
        data: {
          title: "View Graph",
          hideFooter: true,
          authorizedRoles: ["Super Admin", "Moderator"],
        },
        controller: "ViewGraphCtrl",
        resolve: load([
          "scripts/controllers/page-controllers/view-graph.js",
          "ui.select",
        ]),
      })

      // Article
      .state("app.add-article", {
        url: "/article/add",
        templateUrl: "../views/pages/articles/add.html",
        data: {
          title: "article",
          hideFooter: true,
          authorizedRoles: [
            "Super Admin",
            "Moderator",
            "Deo",
            "Sales Marketing",
          ],
        },
        controller: "AddArticleCtrl",
        resolve: load(["scripts/controllers/page-controllers/articles/add.js"]),
      })

      .state("app.view-article", {
        url: "/article/view",
        templateUrl: "../views/pages/articles/view.html",
        data: {
          title: "View Article",
          hideFooter: true,
          authorizedRoles: [
            "Super Admin",
            "Moderator",
            "Deo",
            "Sales Marketing",
          ],
        },
        controller: "ViewArticleCtrl",
        resolve: load([
          "scripts/controllers/page-controllers/articles/view.js",
          "scripts/controllers/components/view-table.js",
        ]),
      })
      .state("app.edit-article", {
        url: "/article/edit",
        templateUrl: "../views/pages/articles/edit.html",
        data: {
          title: "Edit Article",
          hideFooter: true,
          authorizedRoles: [
            "Super Admin",
            "Moderator",
            "Deo",
            "Sales Marketing",
          ],
        },
        controller: "EditArticleCtrl",
        resolve: load([
          "scripts/controllers/page-controllers/articles/edit.js",
        ]),
      })

      // BANK
      .state("app.add-bank", {
        url: "/bank/add",
        templateUrl: "../views/pages/banks/add.html",
        data: {
          title: "Bank",
          hideFooter: true,
          authorizedRoles: [
            "Super Admin",
            "Moderator",
            "Deo",
            "Sales Marketing",
          ],
        },
        controller: "AddBankCtrl",
        resolve: load(["scripts/controllers/page-controllers/banks/add.js"]),
      })
      .state("app.view-bank", {
        url: "/bank/view",
        templateUrl: "../views/pages/banks/view.html",
        data: {
          title: "Bank",
          hideFooter: true,
          authorizedRoles: [
            "Super Admin",
            "Moderator",
            "Deo",
            "Sales Marketing",
          ],
        },
        controller: "ViewBankCtrl",
        resolve: load([
          "scripts/controllers/page-controllers/banks/view.js",
          "scripts/controllers/components/view-table.js",
        ]),
      })
      .state("app.edit-bank", {
        url: "/bank/edit",
        templateUrl: "../views/pages/banks/edit.html",
        data: {
          title: "Edit Bank",
          hideFooter: true,
          authorizedRoles: [
            "Super Admin",
            "Moderator",
            "Deo",
            "Sales Marketing",
          ],
        },
        controller: "EditBankCtrl",
        resolve: load([
          "scripts/controllers/page-controllers/banks/edit.js",
          "scripts/controllers/components/view-table.js",
        ]),
      })

      .state("app.interested_buyer", {
        url: "/interested-buyer",
        templateUrl: "../views/pages/buyer/interested_buyer.html",
        data: {
          title: "Interested Buyers",
          hideFooter: true,
          authorizedRoles: ["Super Admin", "Sales Marketing", "Deo"],
        },
        controller: "InterestedBuyerCtrl",
        resolve: load([
          "scripts/controllers/page-controllers/buyer/interested_buyer.js",
          "ui.select",
        ]),
      })

      .state("app.booking_property", {
        url: "/booking_property",
        templateUrl: "../views/pages/buyer/booking_property.html",
        data: {
          title: "Booked Properties",
          hideFooter: true,
          authorizedRoles: ["Super Admin", "Sales Marketing"],
        },
        controller: "BookingPropertyCtrl",
        resolve: load([
          "scripts/controllers/page-controllers/buyer/booking_property.js",
          "ui.select",
        ]),
      })

      // BUYER
      .state("app.leads-buyer", {
        url: "/leads-buyer",
        templateUrl: "../views/pages/buyer/leads-buyer.html",
        data: {
          title: "Leads Buyer",
          hideFooter: true,
          authorizedRoles: ["Super Admin", "Sales Marketing"],
        },
        controller: "LeadsBuyerCtrl",
        resolve: load([
          "scripts/controllers/page-controllers/buyer/leads-buyer.js",
          "ui.select",
        ]),
      })
      .state("app.consultation", {
        url: "/consultation",
        templateUrl: "../views/pages/buyer/consultation.html",
        data: {
          title: "Consultations",
          hideFooter: true,
          authorizedRoles: ["Super Admin", "Sales Marketing"],
        },
        controller: "ConsultationCtrl",
        resolve: load([
          "scripts/controllers/page-controllers/buyer/consultation.js",
          "ui.select",
        ]),
      })
      .state("app.schedule", {
        url: "/schedule",
        templateUrl: "../views/pages/buyer/schedule.html",
        data: {
          title: "Appointments",
          hideFooter: true,
          authorizedRoles: ["Super Admin", "Sales Marketing"],
        },
        controller: "ScheduleCtrl",
        resolve: load([
          "scripts/controllers/page-controllers/buyer/schedule.js",
          "ui.select",
        ]),
      })
      // .state("app.userSubmittedProperties", {
      //   url: "/customer",
      //   templateUrl: "../views/pages/buyer/user-submitted-properties.html",
      //   data: {
      //     title: "Submitted Properties",
      //     hideFooter: true,
      //     authorizedRoles: [
      //       "Super Admin",
      //     ],
      //   },
      //   controller: "SubmittedPropertyCtrl",
      //   resolve: load([
      //     "scripts/controllers/page-controllers/buyer/user-submitted-properties.js",
      //     "ui.select",
      //   ]),
      // })
      .state("app.userSubmittedProperties_", {
        url: "/userSubmittedProperties",
        templateUrl: "../views/pages/seller/user-submitted-properties.html",
        data: {
          title: "Submitted Properties",
          hideFooter: true,
          authorizedRoles: [
            "Super Admin",
            "Moderator",
            "Deo",
            "Sales Marketing",
          ],
        },
        controller: "UserSubmittedPropertyCtrl",
        resolve: load([
          "scripts/controllers/page-controllers/seller/user-submitted-properties.js",
          "ui.select",
        ]),
      })
      .state("app.newsletter", {
        url: "/newsletter",
        templateUrl: "../views/pages/buyer/newsletter.html",
        data: {
          title: "Newsletter",
          hideFooter: true,
          authorizedRoles: ["Super Admin", "Sales Marketing"],
        },
        controller: "NewsletterCtrl",
        resolve: load([
          "scripts/controllers/page-controllers/buyer/newsletter.js",
          "ui.select",
        ]),
      })
      .state("app.registered-buyer", {
        url: "/registered-buyer",
        templateUrl: "../views/pages/buyer/registered-buyer.html",
        data: {
          title: "Registered Buyer",
          hideFooter: true,
          authorizedRoles: ["Super Admin", "Sales Marketing", "Deo"],
        },
        controller: "RegisteredBuyerCtrl",
        resolve: load([
          "scripts/controllers/page-controllers/buyer/registered-buyer.js",
          "ui.select",
        ]),
      })
      .state("app.view-buyer", {
        url: "/registered-buyer/buyer/:username",
        templateUrl: "../views/pages/buyer/view-registered-buyer.html",
        data: {
          title: "View Buyer",
          hideFooter: true,
          authorizedRoles: ["Super Admin", "Sales Marketing", "Deo"],
        },
        controller: "ViewBuyerCtrl",
        resolve: load([
          "scripts/controllers/page-controllers/buyer/view-registered-buyer.js",
        ]),
      })

      .state("app.country", {
        url: "/country",
        templateUrl: "../views/pages/country.html",
        data: {
          title: "My Tickets",
          hideFooter: true,
          authorizedRoles: [
            "Super Admin",
            "Moderator",
            "Deo",
            "Sales Marketing",
          ],
        },
        controller: "CountryCtrl",
        resolve: load([
          "scripts/controllers/page-controllers/country.js",
          "ui.select",
        ]),
      })
      .state("app.mailer", {
        url: "/mailer",
        templateUrl: "../views/pages/mailer.html",
        data: {
          title: "Mailer",
          hideFooter: true,
          authorizedRoles: ["Super Admin", "Sales Marketing"],
        },
        controller: "MailerCtrl",
        resolve: load([
          "scripts/controllers/page-controllers/mailer.js",
          "ui.select",
          "scripts/controllers/components/view-table.js",
        ]),
      })

      .state("app.buyer", {
        url: "/buyer",
        templateUrl: "../views/pages/buyer.html",
        data: {
          title: "buyer",
          hideFooter: true,
          authorizedRoles: ["Super Admin", "Sales Marketing"],
        },
        controller: "BuyerCtrl",
        resolve: load("scripts/controllers/page-controllers/buyer.js"),
      })

      .state("app.user", {
        url: "/user",
        templateUrl: "../views/pages/user.html",
        data: {
          title: "User",
          hideFooter: true,
          authorizedRoles: ["Super Admin"],
        },
        controller: "UserCtrl",
        resolve: load([
          "scripts/controllers/page-controllers/user.js",
          "ui.select",
        ]),
      })

      .state("app.emi", {
        url: "/emi",
        templateUrl: "../views/pages/emi.html",
        data: {
          title: "EMI",
          hideFooter: true,
          authorizedRoles: ["Super Admin"],
        },
        controller: "EmiCtrl",
        resolve: load([
          "scripts/controllers/page-controllers/emi.js",
          "ui.select",
        ]),
      })

      .state("access", {
        url: "/access",
        template:
          '<div class="dark bg-auto w-full"><div ui-view class="fade-in-right-big smooth pos-rlt">hkhkhkh</div></div>',
      })
      .state("access.signin", {
        url: "/signin",
        templateUrl: "../views/misc/signin.html",
        controller: "authCtrl",
        resolve: load("scripts/controllers/page-controllers/authentication.js"),
      })
      .state("access.signup", {
        url: "/signup",
        templateUrl: "../views/misc/signup.html",
      })
      .state("access.forgot-password", {
        url: "/forgot-password",
        templateUrl: "../views/misc/forgot-password.html",
      })
      .state("access.lockme", {
        url: "/lockme",
        templateUrl: "../views/misc/lockme.html",
      });
    function load(srcs, callback) {
      return {
        deps: [
          "$ocLazyLoad",
          "$q",
          function ($ocLazyLoad, $q) {
            var deferred = $q.defer();
            var promise = false;
            srcs = angular.isArray(srcs) ? srcs : srcs.split(/\s+/);
            if (!promise) {
              promise = deferred.promise;
            }
            angular.forEach(srcs, function (src) {
              promise = promise.then(function () {
                angular.forEach(MODULE_CONFIG, function (module) {
                  if (module.name == src) {
                    src = module.module ? module.name : module.files;
                  }
                });
                return $ocLazyLoad.load(src);
              });
            });
            deferred.resolve();
            return callback
              ? promise.then(function () {
                  return callback();
                })
              : promise;
          },
        ],
      };
    }

    function getParams(name) {
      name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
      var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
      return results === null
        ? ""
        : decodeURIComponent(results[1].replace(/\+/g, " "));
    }
  }
})();
