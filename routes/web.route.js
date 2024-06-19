const path = require("path");
Elastic = require("../classes/elasticsearch");
Filters = require("../classes/filters");
Images = require("../classes/images");
Similar = require("../classes/similar");
const Builder = require("../models/builder.model");
const CustomerSchema = require("../models/customer.model");
const Bank = require("../models/bank.model");
const Project = require("../models/project.model");
const Property = require("../models/property.model");
const Authority = require("../models/authority.model");
const Boundary = require("../models/boundary.model");
const Customer = require("../models/customer.model");
const Newsletter = require("../models/newsletter");
const {urlToName} = require("../_helpers/urlToName");
const { groupArray } = require("../utilities/groupArray");
const axios = require("axios");
const { BASE_URL } = require("../classes/images");
const {fetchLeadsData, getEmiPerLac} = require("./api/__helper");
const {parsePhoneNumber} = require('libphonenumber-js');
var axiosInstance = axios.create({
  baseURL: process.env.AXIOS_BASE_URL,
  maxContentLength:Infinity,
  maxBodyLength:Infinity,
  // timeout: 1000,
});

const property_fields = [
  "name",
  "url",
  "subcity",
  "city",
  "property_type",
  "bhk_space",
  "furnished",
  "banner_image",
  "location.location",
  "id",
  "condition",
  "images",
  "price",
  "builder",
  "area",
  "sq_fit_cost",
  "views",
];
const builder_fields = [
  "id",
  "name",
  "url",
  "subcity",
  "city",
  "logo",
  "phone",
  "email",
  "address",
  "total_projects",
  "local_presence",
  "project_status_count",
  "price",
  "views",
];
const bank_fields = [
  "name",
  "url",
  "logo",
  "description",
  "type",
  "total_projects",
  "id",
  "views",
];
const project_fields = [
  "name",
  "url",
  "subcity",
  "city",
  "district",
  "property_type",
  "project_status",
  "banner_image",
  "lease_rent",
  "location.location",
  "id",
  "price",
  "builder",
  "total_floors",
  "area",
  "facing",
  "images",
  "sq_fit_cost",
  "details_area",
  "total_properties",
  "views",
];
const location_fields = [
  "name",
  "url",
  "capital_income",
  "gdp",
  "population",
  "location_type",
  "banner_image",
  "total_projects",
  "area",
  "price",
  "project_status_count",
  "id",
  "state",
  "subcity",
  "district",
  "city",
  "views",
];
const authority_fields = [
  "name",
  "url",
  "phone",
  "email",
  "address",
  "district",
  "total_projects",
  "city",
  "state",
  "district",
  "url",
  "logo",
  "price",
  "project_status_count",
  "id",
  "views",
];
const {
  changeNumberFormat,
  numberWithCommas,
} = require("../classes/numberFormatter");
const { is_bookmarked, is_bookmarked_list } = require("../classes/bookmark");
const { InterestedBuyerSchema } = require("../models/interested_buyer.model");

const updateSearchHistory = async (urlToStore, req) => {
  let returnObj = {};
  console.log("Saving this search if the user is logged in ....");
  try {
    returnObj = await axiosInstance.post(
      "/api/customer/add_to_search_history",
      {
        url: urlToStore,
        user:
          req.session.user && req.session.user.username
            ? req.session.user.username
            : undefined,
      }
    );
  } catch (err) {
    console.log("Couldnot update history", err);
  } finally {
    return returnObj;
  }
};

const updateViewHistory = async (urlToStore, req) => {
  try {
    // let urlToStore = `/${entity}/` + req.params.url_name;
    await axiosInstance.post("/api/customer/add_to_view_history", {
      url: urlToStore,
      user:
        req.session.user && req.session.user.username
          ? req.session.user.username
          : undefined,
    });
  } catch (err) {
    console.log("Could not update history", err);
  }
};

module.exports = function (app, express) {
  console.log("MAINTENANCE MODE = ", process.env.MAINTENANCE_MODE);
  console.log("STAGING = ", process.env.STAGING)
  if (process.env.MAINTENANCE_MODE === "true") {
    app.get("*", (req, res) => {
      res.render("pages/v1/maintenance");
    });
  } else {
    app.get("/sellyourproperty/thankyou-sell", (req, res) => {
      let data = req.query;
      data.hasOtherPage = true;
      data.title = "Thank you for Sharing your property details with us.";
      data.screenName = "Thank You!";
      data.results = {};
      if (!data.backTo){
        // res.redirect("/");
        data.backTo = "/";
      } else {
        // data.name = urlToName(data.backTo);
      }
      return res.render("pages/v1/sellyourproperty_thankyou_sell.ejs", data)
    });
    app.get("/schedulevisit/thankyou-buy", (req, res) => {
      let data = req.query;
      data.hasOtherPage = true;
      data.title = "Thank you for Scheduling the visit!";
      data.screenName = "Thank You!";
      data.results = {};
      if (!data.backTo){
        res.redirect("/");
      } else {
        // data.name = urlToName(data.backTo);
      }
      return res.render("pages/v1/schedulevisit_thankyou_buy.ejs", data)
    });
    app.get("/bookproperty/thankyou-buy", (req, res) => {
      let data = req.query;
      data.hasOtherPage = true;
      data.title = "Thank you for Booking this Property";
      data.screenName = "Thank You!";
      data.results = {};
      if (!data.backTo){
        res.redirect("/");
      } else {
        // data.name = urlToName(data.backTo);
      }
      return res.render("pages/v1/bookproperty_thankyou_buy.ejs", data)
    });
    app.get("/sellyourproperty", (req, res) => {
      if (req.session.user && false) {
        let data = { title: "Real Estate | Sell your property" };
        data.hasOtherPage = true;
        data.screenName = "Sell your Property";
        data.url = req.url;
        data.results = {};
        return res.redirect("/profile#sellyourproperty");
      } else {
        let data = { title: "Real Estate | Sell your property" };
        data.hasOtherPage = true;
        data.screenName = "Sell your Property";
        data.url = req.url;
        data.results = {};
        return res.render("pages/v1/sellyourproperty.ejs", data);
      }
    });

    app.get("/properties", async (req, res) => {
      let filters = await Filters.property_filters(req.query);
      // console.log("user = ", req.session.user)
      console.log("filters = ", filters);
      console.log("req.query = ", req.query);
      filters.must.push({ term: { is_live: "2" } });
      let query = req.query.q;
      if (query) {
        var data = {
          title: "Real Estate | Search " + query,
          query: query,
          search_entity: "Properties",
        };
      } else {
        query = "";
        var data = {
          title: "Real Estate | Search ",
          search_entity: "Properties",
        };
      }
      var sort = Filters.property_sort(req.query.sort);

      await updateSearchHistory(req.originalUrl, req);

      await Elastic.get_entities(
        query,
        "property",
        12,
        property_fields,
        filters,
        0,
        sort
      )
        .then(async (resp) => {
          data.results = resp;
          data.results.results = await Images.banner_img_url_list(
            data.results.results
          );
          data.results.table_data = data.results.results.slice(0, 10);
          data.results.view = req.query.view;
          await Elastic.get_top_entities(
            [{ term: { doc_type: "property" } }, { term: { is_live: "2" } }],
            "property_type"
          )
            .then(async (response) => {
              data.results.results.per_count = response;

              data.results.results = await is_bookmarked_list(
                data.results.results,
                req
              );
              if ("view" in req.query) {
                data.results.view = req.query.view;
              }
              // res.render('pages/property-listing', data);

              // Add different class for other pages than home
              data.hasOtherPage = true;
              data.screenName = "Properties";
              data.changeNumberFormat = changeNumberFormat;
              data.filter = req.query;
              let emi_per_lac = await getEmiPerLac();
              if (emi_per_lac.success){
                data.emi_per_lac = emi_per_lac.emi_per_lac;
              } else {
                data.emi_per_lac = 0;
              }
              res.render("pages/v1/property-listing", data);
            })
            .catch((e) => {
              console.log(e);
            });
        })
        .catch((e) => {
          console.log(e);
        });
    });

    app.get("/projects", async (req, res) => {
      let filters = await Filters.project_filters(req.query);
      filters.must.push({ term: { is_live: "2" } });
      let query = req.query.q;
      if (query) {
        var data = {
          title: "Real Estate | Search " + query,
          query: query,
          search_entity: "Projects",
        };
      } else {
        query = "";
        var data = {
          title: "Real Estate | Search ",
          search_entity: "Projects",
        };
      }

      // console.log("=-=-=-=-=-=-=-=-=-",req.query.sort)
      var sort = Filters.project_sort(req.query.sort);
      //console.log("wwww1", sort);
      await updateSearchHistory(req.originalUrl, req);


      await Elastic.get_entities(
        query,
        "project",
        12,
        project_fields,
        filters,
        0,
        sort
      )
        .then(async (resp) => {
          // console.log(resp)
          data.results = resp;
          data.results.results = await Images.banner_img_url_list(
            data.results.results
          );
          data.results.results = await Images.get_image_url_list(
            data.results.results
          );
          data.results.results = await is_bookmarked_list(
            data.results.results,
            req
          );
          // console.log(data.results.results[0])
          data.results.table_data = data.results.results.slice(0, 10);
          if ("view" in req.query) {
            data.results.view = req.query.view;
          }
          // res.render('pages/project-listing', data);
          // Add different class for other pages than home
          data.hasOtherPage = true;
          data.screenName = "Projects";
          data.changeNumberFormat = changeNumberFormat;
          let emi_per_lac = await getEmiPerLac();
          if (emi_per_lac.success){
            data.emi_per_lac = emi_per_lac.emi_per_lac;
          }else {
            data.emi_per_lac = 0;
          }
          //console.log("data", data.results.results[0])
          // console.log(data.results.table_data[0])
          // console.log("-0--0-0-0-0-0-0")
          res.render("pages/v1/project-listing", data);
        })
        .catch((e) => {
          console.log(e);
        });
    });

    app.get("/projects/v1", async (req, res) => {
      let filters = await Filters.project_filters(req.query);
      filters.must.push({ term: { is_live: "2" } });
      let query = req.query.q;
      await updateSearchHistory(req.originalUrl, req);

      if (query) {
        var data = {
          title: "Real Estate | Search " + query,
          query: query,
          search_entity: "Projects",
        };
      } else {
        query = "";
        var data = {
          title: "Real Estate | Search ",
          search_entity: "Projects",
        };
      }
      var sort = Filters.project_sort(req.query.sort);
      // console.log("wwww", query);

      Elastic.get_entities(
        query,
        "project",
        12,
        project_fields,
        filters,
        0,
        sort
      )
        .then((resp) => {
          data.results = resp;
          data.results.results = Images.banner_img_url_list(
            data.results.results
          );
          data.results.results = Images.get_image_url_list(
            data.results.results
          );
          data.results.results = is_bookmarked_list(data.results.results, req);
          data.results.table_data = data.results.results.slice(0, 10);
          if ("view" in req.query) {
            data.results.view = req.query.view;
          }
          res.render("pages/project-listing", data);
          // Add different class for other pages than home
          // data.hasOtherPage = true
          // data.screenName = "Projects"
          // data.changeNumberFormat = changeNumberFormat
          // console.log("data", JSON.stringify(data))
          // res.render('pages/v1/project-listing', data);
        })
        .catch((e) => {
          console.log(e);
        });
    });

    app.get("/builders", async (req, res) => {
      let filters = Filters.builder_filters(req.query);
      filters.must.push({ term: { is_live: "2" } });
      let query = req.query.q;
      if (query) {
        var data = {
          title: "Real Estate | Search " + query,
          query: query,
          search_entity: "Builders",
        };
      } else {
        query = "";
        var data = {
          title: "Real Estate | Search ",
          search_entity: "Builders",
        };
      }
      if ("sort" in req.query) {
        var sort = Filters.builder_sort(req.query.sort);
      } else {
        var sort = Filters.builder_sort(undefined);
      }
      await updateSearchHistory(req.originalUrl, req);
      Elastic.get_entities(
        query,
        "builder",
        12,
        builder_fields,
        filters,
        0,
        sort
      )
        .then((resp) => {
          data.results = resp;
          data.results.results = Images.logo_img_url_list(
            data.results.results,
            "Builders"
          );
          data.results.table_data = data.results.results.slice(0, 10);
          if ("view" in req.query) {
            data.results.view = req.query.view;
          }

          data.hasOtherPage = true;
          data.screenName = "Builders";
          data.changeNumberFormat = changeNumberFormat;
          data.results.results = is_bookmarked_list(data.results.results, req);
          // res.render('pages/builder-listing', data);
          res.render("pages/v1/builder-listing", data);
        })
        .catch((e) => {
          console.log(e);
        });
    });
    app.get("/locations", async (req, res) => {
      let filters = Filters.location_filters(req.query);
      filters.must.push({ term: { is_live: "2" } });
      let query = req.query.q;
      if (query) {
        var data = {
          title: "Real Estate | Search " + query,
          query: query,
          search_entity: "Locations",
        };
      } else {
        query = "";
        var data = {
          title: "Real Estate | Search ",
          search_entity: "Locations",
        };
      }
      // if ("sort" in req.query) { var sort = Filters.location_sort(req.query.sort); }
      // else { var sort = Filters.location_sort(undefined) }
      var sort = Filters.location_sort(req.query.sort);
      // console.log("------------------> filters => ", JSON.stringify(filters));
      await updateSearchHistory(req.originalUrl, req);

      await Elastic.get_entities(
        query,
        "location",
        12,
        location_fields,
        filters,
        0,
        sort
      )
        .then(async (resp) => {
          data.results = resp;
          data.results.results = await Images.banner_img_url_list(
            data.results.results
          );
          data.results.table_data = data.results.results.slice(0, 10);
          if ("view" in req.query) {
            data.results.view = req.query.view;
          }

          data.hasOtherPage = true;
          data.screenName = "Locations";
          data.changeNumberFormat = changeNumberFormat;
          data.results.results = await is_bookmarked_list(
            data.results.results,
            req
          );
          // console.log("data", JSON.stringify(data));
          res.render("pages/v1/location-listing", data);
          // res.render('pages/location-listing', data);
        })
        .catch((e) => {
          console.log(e);
        });
    });
    app.get("/authorities", async (req, res) => {
      let filters = Filters.authority_filters(req.query);
      filters.must.push({ term: { is_live: "2" } });
      let query = req.query.q;
      if (query) {
        var data = {
          title: "Real Estate | Search " + query,
          query: query,
          search_entity: "Authorities",
        };
      } else {
        query = "";
        var data = {
          title: "Real Estate | Search ",
          search_entity: "Authorities",
        };
      }
      if ("sort" in req.query) {
        var sort = Filters.authority_sort(req.query.sort);
      } else {
        var sort = Filters.authority_sort(undefined);
      }
      await updateSearchHistory(req.originalUrl, req);

      await Elastic.get_entities(
        query,
        "authority",
        12,
        authority_fields,
        filters,
        0,
        sort
      )
        .then(async (resp) => {
          data.results = resp;
          data.results.results = await Images.logo_img_url_list(
            data.results.results,
            "Authorities"
          );
          data.results.table_data = data.results.results.slice(0, 10);
          if ("view" in req.query) {
            data.results.view = req.query.view;
          }

          data.hasOtherPage = true;
          data.screenName = "Authorities";
          data.changeNumberFormat = changeNumberFormat;
          data.results.results = await is_bookmarked_list(
            data.results.results,
            req
          );
          res.render("pages/v1/authority-listing", data);
          // res.render('pages/authority-listing', data);
        })
        .catch((e) => {
          console.log(e);
        });
    });
    app.get("/banks", async (req, res) => {
      let filters = Filters.bank_filters(req.query);
      filters.must.push({ term: { is_live: "2" } });
      let query = req.query.q;
      if (query) {
        var data = {
          title: "Real Estate | Search " + query,
          query: query,
          search_entity: "Banks",
        };
      } else {
        query = "";
        var data = { title: "Real Estate | Search ", search_entity: "Banks" };
      }
      var sort = Filters.bank_sort(req.query.sort);
      await updateSearchHistory(req.originalUrl, req);

      await Elastic.get_entities(
        query,
        "bank",
        12,
        bank_fields,
        filters,
        0,
        sort
      )
        .then(async (resp) => {
          data.results = resp;
          data.results.results = await Images.logo_img_url_list(
            data.results.results,
            "Banks"
          );
          data.results.table_data = data.results.results.slice(0, 10);
          if ("view" in req.query) {
            data.results.view = req.query.view;
          }

          // Add different class for other pages than home
          data.hasOtherPage = true;
          data.screenName = "Banks";
          data.results.results = await is_bookmarked_list(
            data.results.results,
            req
          );
          res.render("pages/v1/bank-listing", data);
          // res.render('pages/bank-listing', data);
        })
        .catch((e) => {
          console.log(e);
        });
    });

    //random entities
    //  app.get("/ra/properties/", async (req, res) => {
    //   var data = {
    //     title: "Real Estate | " + req.params.url_name.split("-").join(" "),
    //   };
    //   // Get the count of all properties
    //   Property.count().exec(function (err, count) {

    //     // Get a random entry
    //     var random = Math.floor(Math.random() * count)

    //     // Again query all users but only fetch one offset by our random #
    //     Property.findOne().skip(random).exec(
    //       function (err, result) {
    //         // Tada! random user
    //         console.log(result._doc.url.split('/')[2])
    //         req.params.url_name = result._doc.url.split('/')[2];
    //       })
    //   })

    //   const success = await axiosInstance.post("/api/property/update_views", {
    //     url: "/properties/" + req.params.url_name,
    //   });
    //   console.log(success.data);
    //   if (success.data.success) {
    //     Property.findOne({ url: "/properties/" + req.params.url_name })
    //       .then(async (doc) => {
    //         if (doc) {
    //           doc.banner_image = await Images.banner_img_url(doc.banner_image);
    //           // console.log("doc.ba", doc.banner_image);
    //           data.data = doc._doc;
    //           data.is_bookmarked = is_bookmarked(data.data.url, req);
    //           // console.log("images images images images", data.data.images);
    //           data.data = Images.get_image_url(data.data);
    //           // console.log(doc);

    //           let matchingImage = data.data.images.find(
    //             (element) => element == doc.banner_image[0]
    //           );

    //           if (
    //             !matchingImage &&
    //             doc.banner_image.length !== 0 &&
    //             doc.banner_image[0] !== "/images/placeholder_bg.jpg" &&
    //             doc.banner_image[0] !== "" &&
    //             doc.banner_image[0] !==
    //               "https://s3-application.s3-us-west-2.amazonaws.com/dyn-res/property/image/"
    //           ) {
    //             data.data.images.unshift(doc.banner_image[0]);
    //           } else if (matchingImage && matchingImage !== undefined) {
    //             data.data.images = data.data.images.filter(
    //               (item) => item !== matchingImage
    //             );
    //             data.data.images.unshift(matchingImage);
    //           }

    //           Elastic.get_entities(
    //             "",
    //             "project",
    //             1,
    //             [
    //               "name",
    //               "url",
    //               "banks",
    //               "project_status",
    //               "floors",
    //               "parking_details",
    //               "amenities_json",
    //               "connectivity_amenites_json",
    //               "other_amenites_json",
    //               "kid_amenites_json",
    //               "health_amenites_json",
    //               "green_amenites_json",
    //               "authority",
    //               "township",
    //               "location.location",
    //             ],
    //             {
    //               should: [],
    //               must: [
    //                 { match_phrase: { name: doc.project } },
    //                 ,
    //                 { term: { is_live: "2" } },
    //               ],
    //             }
    //           ).then((resp) => {
    //             if (resp.results.length > 0) {
    //               data.project = resp.results[0];
    //             } else {
    //               data.project = {};
    //             }
    //             Elastic.get_entities("", "builder", 1, ["name", "url", "logo"], {
    //               should: [],
    //               must: [{ match_phrase: { name: doc.builder } }],
    //             }).then((resp) => {
    //               data.builder = resp.results;
    //               Elastic.get_entities("", "authority", 1, ["name", "url"], {
    //                 should: [],
    //                 must: [{ match_phrase: { name: doc.authority } }],
    //               }).then((resp) => {
    //                 data.authority = resp.results;

    //                 Elastic.get_location_details(data.data).then((resp) => {
    //                   data.location = resp;
    //                   Similar.property.by_location(data.data).then((resp) => {
    //                     data.similar = Images.banner_img_url_list(resp);
    //                     data.similar = Images.get_image_url_list(data.similar);
    //                     Similar.property
    //                       .by_builder(
    //                         data.builder[0].name,
    //                         data.data.property_type,
    //                         data.data.id
    //                       )
    //                       .then((resp) => {
    //                         data.by_builder = Images.banner_img_url_list(resp);
    //                         data.by_builder = Images.get_image_url_list(
    //                           data.by_builder
    //                         );
    //                         // Add this class baed on a variable
    //                         data.hasOtherPage = true;
    //                         data.changeNumberFormat = changeNumberFormat;
    //                         data.viewer_images = data.data.video_url
    //                           ? data.data.images.slice(0, 4)
    //                           : data.data.images.slice(0, 5);
    //                         data.viewer_images = data.viewer_images.map((i) => {
    //                           return {
    //                             type: "image",
    //                             url: i,
    //                           };
    //                         });
    //                         if (data.data.video_url) {
    //                           data.viewer_images.push({
    //                             type: "video",
    //                             url: data.data.video_url,
    //                           });
    //                         }
    //                         // console.log(
    //                         //   "------------------------------------>Data\n",
    //                         //   data.project
    //                         // );

    //                         // res.render('pages/property', data);
    //                         console.log("---------------------")
    //                         console.log(data.by_builder)
    //                         res.render("pages/v1/property", data);
    //                       });
    //                   });
    //                 });
    //               });
    //             });
    //           });
    //         } else {
    //           res.redirect("/page-not-found");
    //         }
    //       })
    //       .catch((e) => {
    //         console.log(e);
    //       });
    //   }
    // });

    // Main Pages
    // app.get("/profilev1", async (req, res) => {
    //   try {
    //     var data = { title: "Real Estate | Profile ", url: req.body.url };
    //     // console.log("req ========> ", req);

    //     if (req.session.user) {
    //       var userData = await CustomerSchema.findOne({
    //         _id: req.session.user._id,
    //       });

    //       req.session.user = userData._doc;
    //       req.session.user.leadsData = await fetchLeadsData(req.session.user.username);

    //       if (userData.submitted_property) {
    //         req.session.user.submitted_property =
    //           userData.submitted_property.map((p) => {
    //             if (!p.isApproved) p.isApproved = false;
    //             return p;
    //           });
    //       }

    //       if (userData.viewHistory && userData.viewHistory.length > 0) {
    //         let loadedViewHistory = [];
    //         userData.viewHistory = userData.viewHistory.filter(
    //           (a) => typeof a === "object"
    //         );
    //         // console.log(userData.viewHistory);
    //         userData.viewHistory.sort((a, b) => (a.date < b.date ? 1 : -1));
    //         for (const history of userData.viewHistory) {
    //           try {
    //             console.log(history.url);
    //             const doc = await Elastic.get_entity_url(history.url);
    //             console.log("Elastic success");
    //             if (doc.success) {
    //               doc.data.dateOfViewing = history.date.toDateString();
    //               loadedViewHistory.push(doc.data);
    //             }
    //           } catch (err) {
    //             console.log(
    //               "Error occurred while processing user data => ",
    //               err
    //             );
    //           }
    //         }
    //         const groupedViewHistory = groupArray(loadedViewHistory, "dateOfViewing");
    //         // console.log("<<<<<<<<<<<<", groupedViewHistory);
    //         // req.session.user.viewHistory = loadedViewHistory;
    //         req.session.user.viewHistory = groupedViewHistory;
    //         // console.log(req.session.user.viewHistory)
    //       }
          
    //       if (userData.searchHistory && userData.searchHistory.length > 0) {
    //         let loadedSearchHistory = [];
    //         userData.searchHistory.sort((a, b) => (a.date < b.date ? 1 : -1));
    //         for (const history of userData.searchHistory) {
    //           try {
    //             // console.log(history.url);
    //             loadedSearchHistory.push({
    //               url: history.url,
    //               dateOfViewing: history.date.toDateString(),
    //               date: history.date,
    //               name: urlToName(history.url),
    //             });
    //           } catch (err) {
    //             console.log(
    //               "Error occurred while processing user data => ",
    //               err
    //             );
    //           }
    //         }
    //         const groupedSearchHistory = groupArray(
    //           loadedSearchHistory,
    //           "dateOfViewing"
    //         );
    //         // console.log(">>>>>>", groupedSearchHistory);

    //         // req.session.user.searchHistory = loadedSearchHistory;
    //         req.session.user.searchHistory = groupedSearchHistory;
    //       }
    //       if (userData.bookmark.length > 0) {
    //         const total_bookmarks = userData.bookmark.length;
    //         var BASE_URL =
    //           "<%=locals.CURRENT_IMAGE_BASE_URL%>";
    //         var mapping_images = {
    //           Properties: "/property/image/",
    //           Projects: "/project/image/",
    //           Builders: "/builder/",
    //           Banks: "/bank/",
    //           Authorities: "/authority/",
    //           Cities: "/city/",
    //           Districts: "/district/",
    //           Subcities: "/subcity/",
    //           States: "/state/",
    //           News: "/news/",
    //         };
    //         await req.session.user.bookmark.map(async (bm, index) => {
    //           await Elastic.get_entity_bookmark(bm)
    //             .then(async (doc) => {
    //               // console.log(bm);
    //               // doc.resp = await Images.banner_img_url_list([doc.resp])[0];
    //               if (doc.resp.banner_image) {
    //                 if (
    //                   doc.resp.banner_image &&
    //                   doc.resp.banner_image[1] === null
    //                 ) {
    //                   doc.resp.banner_image = "/images/placeholder_bg.webp";
    //                 } else if (doc.resp.banner_image[0] in mapping_images) {
    //                   doc.resp.banner_image =
    //                     BASE_URL +
    //                     mapping_images[doc.resp.banner_image[0]] +
    //                     doc.resp.banner_image[1];
    //                 } else {
    //                   doc.resp.banner_image = "/images/placeholder_bg.webp";
    //                 }
    //               } else {
    //                 doc.resp.banner_image = "/images/placeholder_bg.webp";
    //               }

    //               doc.resp = await is_bookmarked_list([doc.resp], req)[0];
    //               doc.resp.custSkip = 1 * 12;
    //               // if (doc.resp.price)
    //               //   doc.resp.price.str = changeNumberFormat(doc.resp.price.price);
    //               // console.log(doc);
    //               bm.data = doc;
    //               // console.log(bm);
    //               // console.log("==================================================>");
    //             })
    //             .catch((error) => {
    //               console.log(
    //                 "Ran into error while trying to get bookmarks: ",
    //                 error
    //               );
    //             });
    //           if (index === total_bookmarks - 1) {
    //             // req.session.user.bookmark = newBookmarks;
    //             // console.log("newBookmarks\n");
    //             // req.session.user.bookmark.forEach((i)=>{console.log(i.data)})
    //             // console.log(req.session.user.bookmark);
    //             // res.status(200).json({
    //             //   success: true,
    //             // });
    //             data.hasOtherPage = true;
    //             data.changeNumberFormat = changeNumberFormat;
    //             data.url = req.url;
    //             res.render("pages/v1/profile", data);
    //           }
    //         });
    //       } else {
    //         // req.session.user.bookmark = [];
    //         // res.locals.user.bookmark = [];
    //         data.hasOtherPage = true;
    //         data.changeNumberFormat = changeNumberFormat;
    //         data.url = req.url;
    //         res.render("pages/v1/profile", data);
    //       }
    //     } else {
    //       req.session.openLogInModal = true;
    //       res.redirect("/");
    //     }
    //   } catch (err) {
    //     console.log(err);
    //   }
    //   // if (req.session.user) {
    //   // 	if (req.session.user.submitted_property) {
    //   // 		req.session.user.submitted_property = req.session.user.submitted_property.map((p) => {
    //   // 			if (!p.isApproved) p.isApproved = false;
    //   // 			return p
    //   // 		})
    //   // 	}
    //   // 	data.hasOtherPage = true;
    //   // 	res.render('pages/v1/profile', data);
    //   // 	// res.render('pages/profile', data);
    //   // }

    //   // else {
    //   // 	req.session.openLogInModal = true;
    //   // 	res.redirect('/');
    //   // }
    // });
    app.get("/profile", async (req, res) => {
      try {
        var data = { title: "Real Estate | Profile ", url: req.body.url };
        // console.log("req ========> ", req);

        if (req.session.user) {
          var userData = await CustomerSchema.findOne({
            _id: req.session.user._id,
          });
          req.session.user = userData._doc;
          req.session.user.leadsData = await fetchLeadsData(req.session.user.username);
          delete req.session.user.submitted_property
          try{
            let result = await axiosInstance.post("/api/usp/get", {filter:{user:userData._id}});
            if (result){
              req.session.user.submitted_property = result.data.docs
            }
          } catch(e){
            console.log(e);
          }

          // if (userData.submitted_property) {
          //   req.session.user.submitted_property =
          //     userData.submitted_property.map((p) => {
          //       if (!p.isApproved) p.isApproved = false;
          //       return p;
          //     });
          // }

          if (userData.viewHistory && userData.viewHistory.length > 0) {
            let loadedViewHistory = [];
            userData.viewHistory = userData.viewHistory.filter(
              (a) => typeof a === "object"
            );
            // console.log(userData.viewHistory);
            userData.viewHistory.sort((a, b) => (a.date < b.date ? 1 : -1));
            for (const history of userData.viewHistory) {
              try {
                console.log(history.url);
                const doc = await Elastic.get_entity_url(history.url);
                console.log("Elastic success");
                if (doc.success) {
                  let requiredData = {};
                  requiredData.url = doc.data.url;
                  requiredData.doc_type = doc.data.doc_type;
                  if (doc.data.price) requiredData.price = doc.data.price;
                  if (doc.data.heading) requiredData.heading = doc.data.heading;
                  if (doc.data.name) requiredData.name = doc.data.name;
                  if (doc.data.images) requiredData.images = doc.data.images;
                  if (doc.data.banner_image) requiredData.banner_image = doc.data.banner_image;
                  if (doc.data.news_banner) requiredData.news_banner = doc.data.news_banner;
                  if (doc.data.logo) requiredData.logo = doc.data.logo;
                  requiredData.dateOfViewing = history.date.toDateString();
                  loadedViewHistory.push(requiredData);
                }
              } catch (err) {
                console.log(
                  "Error occurred while processing user data => ",
                  err
                );
              }
            }
            const groupedViewHistory = groupArray(loadedViewHistory, "dateOfViewing");
            // console.log("<<<<<<<<<<<<", groupedViewHistory);
            // req.session.user.viewHistory = loadedViewHistory;
            req.session.user.viewHistory = groupedViewHistory;
            // console.log(req.session.user.viewHistory)
          }
          
          if (userData.searchHistory && userData.searchHistory.length > 0) {
            let loadedSearchHistory = [];
            userData.searchHistory.sort((a, b) => (a.date < b.date ? 1 : -1));
            for (const history of userData.searchHistory) {
              try {
                // console.log(history.url);
                loadedSearchHistory.push({
                  url: history.url,
                  dateOfViewing: history.date.toDateString(),
                  date: history.date,
                  name: urlToName(history.url),
                });
              } catch (err) {
                console.log(
                  "Error occurred while processing user data => ",
                  err
                );
              }
            }
            const groupedSearchHistory = groupArray(
              loadedSearchHistory,
              "dateOfViewing"
            );
            // console.log(">>>>>>", groupedSearchHistory);

            // req.session.user.searchHistory = loadedSearchHistory;
            req.session.user.searchHistory = groupedSearchHistory;
          }
          if (userData.bookmark.length > 0) {
            const total_bookmarks = userData.bookmark.length;
            var mapping_images = {
              Properties: "/property/image/",
              Projects: "/project/image/",
              Builders: "/builder/",
              Banks: "/bank/",
              Authorities: "/authority/",
              Cities: "/city/",
              Districts: "/district/",
              Subcities: "/subcity/",
              States: "/state/",
              News: "/news/",
            };
            let bmNew = [];
            for (const bm of req.session.user.bookmark){
              await Elastic.get_entity_bookmark(bm)
                .then(async (doc) => {
                  // console.log(bm);
                  // doc.resp = await Images.banner_img_url_list([doc.resp])[0];
                  if (doc.resp.banner_image) {
                    if (
                      doc.resp.banner_image &&
                      doc.resp.banner_image[1] === null
                    ) {
                      doc.resp.banner_image = "/images/placeholder_bg.webp";
                    } else if (doc.resp.banner_image[0] in mapping_images) {
                      doc.resp.banner_image =
                        BASE_URL +
                        mapping_images[doc.resp.banner_image[0]] +
                        doc.resp.banner_image[1];
                    } else {
                      doc.resp.banner_image = "/images/placeholder_bg.webp";
                    }
                  } else {
                    doc.resp.banner_image = "/images/placeholder_bg.webp";
                  }

                  doc.resp = await is_bookmarked_list([doc.resp], req)[0];
                  doc.resp.custSkip = 1 * 12;
                  // if (doc.resp.price)
                  //   doc.resp.price.str = changeNumberFormat(doc.resp.price.price);
                  // console.log(doc);
                  bm.data = doc;
                  bmNew.push(bm)
                  // console.log(bm);
                  // console.log("==================================================>");
                })
                .catch((error) => {
                  console.log(
                    "Ran into error while trying to get bookmarks: ",
                    error
                  );
                });
              // if (index === total_bookmarks - 1) {
              //   // // req.session.user.bookmark = newBookmarks;
              //   // // console.log("newBookmarks\n");
              //   // // req.session.user.bookmark.forEach((i)=>{console.log(i.data)})
              //   // // console.log(req.session.user.bookmark);
              //   // // res.status(200).json({
              //   // //   success: true,
              //   // // });
              //   // data.hasOtherPage = true;
              //   // data.changeNumberFormat = changeNumberFormat;
              //   // data.url = req.url;
              //   // res.render("pages/v1/profile_v2", data);
              // }
            };
            req.session.user.bookmark = bmNew;
            await req.session.save((err)=>{
              if(err){
                console.log(err)
              }
            })
            // req.session.user.bookmark = newBookmarks;
            // console.log("newBookmarks\n");
            // req.session.user.bookmark.forEach((i)=>{console.log(i.data)})
            // console.log(req.session.user.bookmark);
            // res.status(200).json({
            //   success: true,
            // });
            data.hasOtherPage = true;
            data.changeNumberFormat = changeNumberFormat;
            data.url = req.url;
            data.userData = req.session.user;
            res.render("pages/v1/profile_v2", data);
          } else {
            // req.session.user.bookmark = [];
            // res.locals.user.bookmark = [];
            data.hasOtherPage = true;
            data.changeNumberFormat = changeNumberFormat;
            data.url = req.url;
            data.userData = req.session.user;
            res.render("pages/v1/profile_v2", data);
          }
        } else {
          req.session.openLogInModal = true;
          req.session.comeToProfilePage = true;
          res.redirect("/");
        }
      } catch (err) {
        console.log(err);
      }
    });
    app.get("/page-not-found", (req, res) => {
      let data = { title: "Real Estate | Page Not Found" };
      data.hasOtherPage = true;
      res.render("pages/v1/404", data);
      // res.render("pages/404", data);
    });
    app.get("/faq", (req, res) => {
      let data = { title: "Real Estate | FAQ's" };
      data.hasOtherPage = true;
      data.screenName = "FAQ";
      data.results = {};
      res.render("pages/v1/faq", data);
      // res.render("pages/faq", data);
    });
    app.get("/about", (req, res) => {
      let data = { title: "Real Estate | About Us" };
      data.hasOtherPage = true;
      data.screenName = "About Us";
      data.results = {};
      res.render("pages/v1/about", data);
      // res.render("pages/about", data);
    });
    app.get("/privacy-policy", (req, res) => {
      let data = { title: "Real Estate | Privacy Policy" };
      data.hasOtherPage = true;
      data.screenName = "Privacy Policy";
      data.results = {};
      res.render("pages/v1/privacy-policy", data);
      // res.render("pages/privacy-policy", data);
    });
    app.get("/terms-of-use", (req, res) => {
      let data = { title: "Real Estate | Terms of Use" };
      data.hasOtherPage = true;
      data.screenName = "Terms of Use";
      data.results = {};
      res.render("pages/v1/terms-of-use", data);
      // res.render("pages/terms-of-use", data);
    });
    app.get("/my-account", (req, res) => {
      let data = { title: "Real Estate | My Account" };
      res.render("pages/my-account", data);
    });

    // Main Pages
    app.get("/admin-panel", (req, res) => {
      res.sendFile(path.join(__dirname + "/../views/admin/index.html"));
    });
    app.get("/logout", function (req, res) {
      let {referer} = req.headers;
      referer = referer.split(req.headers.host)[1]
      if (req.session.user) {
        req.session.destroy(function () {
          res.redirect(referer);
        });
      } else {
        res.redirect(referer);
      }
    });
    app.get("/results", async (req, res) => {
      let query = req.query.q;
      if (query) {
        var data = {
          title: "Real Estate | Search " + query,
          query: query,
          results: { count: 0, results: {}, search_phrase: query },
        };
      } else {
        query = "";
        var data = {
          title: "Real Estate | Search ",
          results: { count: 0, results: {} },
        };
      }
      await updateSearchHistory(req.originalUrl, req);
      let readyToMoveProperties = [];

      const project_with_total_properties = {
        size: 6,
        sort: [
          {
            total_properties: {
              order: "desc",
            },
          },
        ],
        query: {
          bool: {
            must: [
              {
                term: {
                  is_live: {
                    value: "2",
                  },
                },
              },
              {
                term: {
                  doc_type: {
                    value: "project",
                  },
                },
              },
              {
                term: {
                  project_status: {
                    value: "Ready To Move",
                  },
                },
              },
              {
                bool: {
                  filter: {
                    range: {
                      total_properties: {
                        gte: 0,
                        lte: 20000,
                      },
                    },
                  },
                },
              },
            ],
            should: [{}],
          },
        },
      };

      // console.log(
      //   "#########################################################################"
      // );
      await axios
        .get("http://localhost:9200/assetzilla/entities/_search", {
          data: project_with_total_properties,
        })
        .then((result) => {
          console.log("I was fetched and brought the following with myself");
          // console.log(result.data.hits.hits.length);
          readyToMoveProperties = result.data.hits.hits;
          let temp = readyToMoveProperties;
          temp.forEach((project, index) => {
            readyToMoveProperties[index] = temp[index]._source;
          });
          console.log("*************");
          // console.log(readyToMoveProperties);
          readyToMoveProperties = Images.banner_img_url_list(
            readyToMoveProperties
          );
          // console.log(readyToMoveProperties);
          // console.log(
          //   "#########################################################################"
          // );
        })
        .catch((e) => {
          console.log(e);
          console.log(
            "#########################################################################"
          );
        });
      Elastic.get_entities(query, "property", 6, property_fields, {
        should: [],
        must: [{ term: { is_live: "2" } }],
      }, 0, Filters.property_sort())
        .then(async (resp) => {
          data.results.count += resp.count;
          data.results.results.properties = Images.banner_img_url_list(
            resp.results
          );
          if(!data.query){
            data.results.results.properties = readyToMoveProperties;
          }
          Elastic.get_entities(query, "project", 6, project_fields, {
            should: [],
            must: [{ term: { is_live: "2" } }]
          }, 0, Filters.project_sort()).then(async (resp) => {
            data.results.count += resp.count;
            data.results.results.projects = Images.banner_img_url_list(
              resp.results
            );
            data.results.results.projects = Images.get_image_url_list(
              data.results.results.projects
            );
            Elastic.get_entities(query, "builder", 6, builder_fields, {
              should: [],
              must: [{ term: { is_live: "2" } }],
            }, 0, Filters.builder_sort()).then(async (resp) => {
              data.results.count += resp.count;
              data.results.results.builders = Images.logo_img_url_list(
                resp.results,
                "Builders"
              );
              let so = Filters.location_sort(req.query.sort);
              Elastic.get_entities(query, "location", 6, location_fields, {
                should: [],
                must: [{ term: { is_live: "2" } }],
              },0,so).then(async (resp) => {
                data.results.count += resp.count;
                data.results.results.locations = Images.banner_img_url_list(
                  resp.results
                );
                Elastic.get_entities(query, "authority", 6, authority_fields, {
                  should: [],
                  must: [{ term: { is_live: "2" } }],
                },0, Filters.authority_sort()).then(async (resp) => {
                  data.results.count += resp.count;
                  data.results.results.authorities = Images.banner_img_url_list(
                    resp.results
                  );

                  data.hasOtherPage = true;
                  data.screenName = "Results";
                  data.changeNumberFormat = changeNumberFormat;
                  data.rootPath = process.cwd() + "/views/";
                  
                  if (data.results.count === 0){
                    let cities = undefined;
                    let city_filters = {
                      should: [],
                      must: [
                        { bool: { should: [{ match_phrase: { location_type: "city" } }] } },
                        { term: { is_live: "2" } },
                      ],
                    };

                    Elastic.get_entities(
                      "",
                      "location",
                      100,
                      location_fields,
                      city_filters,
                      0,
                      {}
                    )
                      .then(async (resp) => {
                        cities = resp;
                        cities.results = Images.banner_img_url_list(cities.results);
                        // console.log(cities);
                        cities.results.sort((a, b) => {
                          if (a.total_projects > b.total_projects) {
                            return -1;
                          }
                          if (a.total_projects < b.total_projects) {
                            return 1;
                          }
                          return 0;
                        });
                        data.results.cities = cities;
                        data.results.showCities = true;
                        data.changeNumberFormat = changeNumberFormat;
                        let emi_per_lac = await getEmiPerLac();
                        if (emi_per_lac.success){
                          data.emi_per_lac = emi_per_lac.emi_per_lac;
                        } else {
                          data.emi_per_lac = 0;
                        }
                        res.render("pages/v1/results", data);
                      })
                      .catch(async (e) => {
                        console.log(e);
                        data.results.showCities = false;
                        let emi_per_lac = await getEmiPerLac();
                        if (emi_per_lac.success){
                          data.emi_per_lac = emi_per_lac.emi_per_lac;
                        } else {
                          data.emi_per_lac = 0;
                        }
                        res.render("pages/v1/results", data);
                      });
                  } else {
                    data.results.showCities = false;
                    let emi_per_lac = await getEmiPerLac();
                    if (emi_per_lac.success){
                      data.emi_per_lac = emi_per_lac.emi_per_lac;
                    } else {
                      data.emi_per_lac = 0;
                    }
                    res.render("pages/v1/results", data);
                  }
                  // console.log("JOS", JSON.stringify(data));
                  // res.render('pages/results', data);
                });
              });
            });
          });
        })
        .catch((e) => {
          console.log(e);
        });
    });

    app.get("/", async (req, res) => {
      let property_filters = await Filters.property_filters(req.query);
      property_filters.must.push({ term: { is_live: "2" } });
      let project_filters = await Filters.project_filters(req.query);
      project_filters.must.push({ term: { is_live: "2" } });

      let builder_filters = Filters.builder_filters(req.query);
      builder_filters.must.push({ term: { is_live: "2" } });

      var property_sort = Filters.property_sort(req.query.sort);
      var project_sort = Filters.project_sort(req.query.sort);
      console.log(project_sort);
      var builder_sort = Filters.builder_sort(req.query.sort);

      let cities = undefined;
      let city_filters = {
        should: [],
        must: [
          { bool: { should: [{ match_phrase: { location_type: "city" } }] } },
          { term: { is_live: "2" } },
        ],
      };

      Elastic.get_entities(
        "",
        "location",
        100,
        location_fields,
        city_filters,
        0,
        {}
      )
        .then((resp) => {
          cities = resp;
          cities.results = Images.banner_img_url_list(cities.results);
          // console.log(cities);
          cities.results.sort((a, b) => {
            if (a.total_projects > b.total_projects) {
              return -1;
            }
            if (a.total_projects < b.total_projects) {
              return 1;
            }
            return 0;
          });
        })
        .catch((e) => {
          console.log(e);
        });

      let readyToMoveProperties = [];

      const project_with_total_properties = {
        size: 5,
        sort: [
          {
            total_properties: {
              order: "desc",
            },
          },
        ],
        query: {
          bool: {
            must: [
              {
                term: {
                  is_live: {
                    value: "2",
                  },
                },
              },
              {
                term: {
                  doc_type: {
                    value: "project",
                  },
                },
              },
              {
                term: {
                  project_status: {
                    value: "Ready To Move",
                  },
                },
              },
              {
                bool: {
                  filter: {
                    range: {
                      total_properties: {
                        gte: 0,
                        lte: 20000,
                      },
                    },
                  },
                },
              },
            ],
            should: [{}],
          },
        },
      };

      console.log(
        "#########################################################################"
      );
      await axios
      .get("http://localhost:9200/assetzilla/entities/_search", {
          params: project_with_total_properties // Pass data as params
      })
      .then((result) => {
          console.log("I was fetched and brought the following with myself");
          readyToMoveProperties = result.data.hits.hits;
          let temp = readyToMoveProperties;
          temp.forEach((project, index) => {
              readyToMoveProperties[index] = temp[index]._source;
          });
          console.log("*************");
          readyToMoveProperties = Images.banner_img_url_list(
              readyToMoveProperties
          );
      })
      .catch((e) => {
          console.log(e);
          console.log(
              "#########################################################################"
          );
      });

      // Elastic.get_entities(
      //   "",
      //   "project",
      //   5,
      //   project_fields,
      //   projects_with_highest_number_of_ready_to_move_in_properties,
      //   0,
      //   {"project_status_count.ReadyToMove":{"order": "desc"}}
      // ).then((result)=>{
      //   console.log("I was fetched and brought the following with myself");
      //   console.log(result)
      //   data.trending.properties = Images.banner_img_url_list(
      //     result.results
      //   );
      // }).catch((e)=>{
      //   console.log(e)
      // });
      const searchIn3EasyWaysData = {
        projectsCovered: 0,
        presenceInCities: 0,
        readyPropertiesForSale: 0,
      };

      let projectsCoveredCriteria = {
        size: 2000,
        query: {
          bool: {
            must: [
              {
                term: {
                  is_live: {
                    value: "2",
                  },
                },
              },
              {
                term: {
                  doc_type: {
                    value: "project",
                  },
                },
              },
            ],
            should: [{}],
          },
        },
      };

      //following query finds out projects which have city field in them and projects are live
      // let citiesCoveredCriteria = {
      //   query: {
      //     bool: {
      //       must: [
      //         {
      //           term: {
      //             doc_type: {
      //               value: "project",
      //             },
      //           },
      //         },
      //         {
      //           term: {
      //             is_live: {
      //               value: "2",
      //             },
      //           },
      //         },
      //       ],
      //       should: [{}],
      //     },
      //   },
      //   size:1000,
      //   aggs: {
      //     total_count: {
      //       cardinality: {
      //         field: "city",
      //       },
      //     },
      //   },
      // };

      let citiesCoveredCriteria = {
        "query": {
          "bool": {
            "must": [{"term": {
              "doc_type": {
                "value": "location"
              }
            }},{"term": {
            "is_live": {
              "value": "2"
            }
          }},{"term": {
            "location_type": {
              "value": "city"
            }
          }}],
            "should": [
              {}
            ]
          }
        }
      }

      let propertiesReadyForSaleCriteria = {
        query: {
          bool: {
            must: [
              {
                term: {
                  doc_type: {
                    value: "property",
                  },
                },
              },
              {
                term: {
                  is_live: {
                    value: "2",
                  },
                },
              },
            ],
            should: [{}],
          },
        },
      };

      await axios
        .get("http://localhost:9200/assetzilla/entities/_search", {
          data: projectsCoveredCriteria,
        })
        .then(async (projectsCoveredResponse) => {
          console.log(
            "%%%%%%Projects Covered%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%"
          );
          // console.log(projectsCoveredResponse.data);
          searchIn3EasyWaysData.projectsCovered =
            projectsCoveredResponse.data.hits.total;
        })
        .catch((e) => {
          console.log("Error while fetching projects covered data: ", e);
          searchIn3EasyWaysData.projectsCovered = undefined;
        });

      await axios
        .get("http://localhost:9200/assetzilla/entities/_search", {
          data: citiesCoveredCriteria,
        })
        .then(async (citiesCoveredResponse) => {
          console.log(
            "%%%%%%Cities Covered%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%"
          );
          // console.log(citiesCoveredResponse.data);
          // searchIn3EasyWaysData.presenceInCities =
          //   citiesCoveredResponse.data.aggregations.total_count.value;
          searchIn3EasyWaysData.presenceInCities = citiesCoveredResponse.data.hits.total;
        })
        .catch((e) => {
          console.log("Error while fetching projects covered data: ", e);
          searchIn3EasyWaysData.presenceInCities = undefined;
        });

      await axios
        .get("http://localhost:9200/assetzilla/entities/_search", {
          data: propertiesReadyForSaleCriteria,
        })
        .then(async (propertiesReadyForSaleResponse) => {
          console.log(
            "%%%%%%Properties For Sale%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%"
          );
          // console.log(propertiesReadyForSaleResponse.data);
          searchIn3EasyWaysData.readyPropertiesForSale =
            propertiesReadyForSaleResponse.data.hits.total;
        })
        .catch((e) => {
          console.log("Error while fetching projects covered data: ", e);
          searchIn3EasyWaysData.readyPropertiesForSale = undefined;
        });

      // console.log(searchIn3EasyWaysData);

      console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%");

      let data = { title: "Real Estate | Home", top: {}, trending: {} };
      Elastic.get_entities("", "property", 4, ["name", "url"], {
        should: [],
        must: [{ term: { is_live: "2" } }],
      })
        .then((resp) => {
          data.top.properties = resp.results;
          Elastic.get_entities("", "project", 4, ["name", "url"], {
            should: [],
            must: [{ term: { is_live: "2" } }],
          })
            .then((resp) => {
              data.top.projects = resp.results;
              Elastic.get_entities("", "builder", 4, ["name", "url", "logo"], {
                should: [],
                must: [{ term: { is_live: "2" } }],
              })
                .then((resp) => {
                  data.top.builders = resp.results;
                  Elastic.get_entities(
                    "",
                    "project",
                    6,
                    project_fields,
                    project_filters,
                    0,
                    project_sort
                  ).then((respProj) => {
                    // console.log(respProj);
                    data.trending.projects = Images.banner_img_url_list(
                      respProj.results
                    );
                    // console.log(data.trending.projects);
                    Elastic.get_entities(
                      "",
                      "property",
                      6,
                      property_fields,
                      property_filters,
                      0,
                      property_sort
                    ).then((respProp) => {
                      data.trending.properties = Images.banner_img_url_list(
                        respProp.results
                      );
                      if (readyToMoveProperties)
                        data.readyToMoveProperties = readyToMoveProperties;
                      Elastic.get_entities(
                        "",
                        "builder",
                        6,
                        builder_fields,
                        builder_filters,
                        0,
                        builder_sort
                      ).then(async (respBuild) => {
                        data.trending.builders = Images.banner_img_url_list(
                          respBuild.results
                        );
                        if (req.session.openLogInModal) {
                          data.openLogInModal = true;
                          req.session.openLogInModal = false;
                        } else {
                          data.openLogInModal = false;
                        }
                        if (req.session.comeToProfilePage){
                          data.comeToProfilePage = true;
                          req.session.comeToProfilePage = false;
                        } else {
                          data.comeToProfilePage = false;
                        }
                        data.searchIn3EasyWaysData = searchIn3EasyWaysData;
                        data.hasOtherPage = false;
                        // res.render('pages/index', data);
                        data.changeNumberFormat = changeNumberFormat;
                        data.cities = cities;
                        data.BASE_URL = BASE_URL;
                        let emi_per_lac = await getEmiPerLac();
                        if (emi_per_lac.success){
                          data.emi_per_lac = emi_per_lac.emi_per_lac;
                        } else {
                          data.emi_per_lac = 0;
                        }
                        res.render("pages/v1/index", data);
                      });
                    });
                  });
                })
                .catch((e) => {
                  console.log(e);
                });
            })
            .catch((e) => {
              console.log(e);
            });
        })
        .catch((e) => {
          console.log(e);
        });
    });
    app.get("/builders/:url_name", async (req, res) => {
      var data = {
        title:
          "Real Estate | Builders " + req.params.url_name.split("-").join(" "),
      };

      const success = await axiosInstance.post("/api/builder/update_views", {
        url: "/builders/" + req.params.url_name,
      });
      // console.log(success.data);
      if (success.data.success) {
        await updateViewHistory(req.originalUrl, req);

        Builder.findOne({ url: "/builders/" + req.params.url_name })
          .then((doc) => {
            if (doc) {
              doc = Images.logo_img_url_list([doc], "Builders")[0];
              data.data = doc._doc;
              data.is_bookmarked = is_bookmarked(data.data.url, req);
              Elastic.get_entities(
                "",
                "project",
                5,
                [
                  "area",
                  "price",
                  "images",
                  "banner_image",
                  "name",
                  "url",
                  "city",
                  "subcity",
                  "project_status",
                  "property_type",
                  "lease_rent",
                  "location.location",
                  "builder",
                  "sq_fit_cost",
                ],
                {
                  should: [],
                  must: [
                    { match_phrase: { builder: doc.name } },
                    { term: { is_live: "2" } },
                  ],
                },
                0,
                { "price.min": { order: "asc" } }
              )
                .then((resp) => {
                  data.top_projects = Images.banner_img_url_list(resp.results);
                  data.top_projects = Images.get_image_url_list(resp.results);
                  data.top_projects = is_bookmarked_list(resp.results, req);
                  data.top_project_count = resp.count;
                  Elastic.get_location_details(data.data)
                    .then((resp) => {
                      data.location = resp;
                      Elastic.get_top_entities(
                        [
                          { term: { doc_type: "project" } },
                          { match_phrase: { builder: data.data.name } },
                          { term: { is_live: "2" } },
                        ],
                        "city"
                      )
                        .then((resp) => {
                          data.top_locations = resp;
                          Elastic.get_top_entities(
                            [
                              { term: { doc_type: "project" } },
                              { match_phrase: { builder: data.data.name } },
                              { term: { is_live: "2" } },
                            ],
                            "property_type"
                          )
                            .then(async (resp) => {
                              data.top_property_type = resp;
                              // res.render('pages/builder', data);
                              // console.log("data", JSON.stringify(data));
                              data.hasOtherPage = true;
                              data.changeNumberFormat = changeNumberFormat;
                              data.views = success.data.views;
                              let emi_per_lac = await getEmiPerLac();
                              if (emi_per_lac.success){
                                data.emi_per_lac = emi_per_lac.emi_per_lac;
                              } else {
                                data.emi_per_lac = 0;
                              }
                              res.render("pages/v1/builder", data);
                            })
                            .catch((e) => {
                              console.log(e);
                            });
                        })
                        .catch((e) => {
                          console.log(e);
                        });
                    })
                    .catch((e) => {
                      console.log(e);
                    });
                })
                .catch((e) => {
                  console.log(e);
                });
            } else {
              res.redirect("/page-not-found");
            }
          })
          .catch((e) => {
            console.log(e);
          });
      } else {
        console.log("Could not update views .. redirecting");
        res.redirect("/page-not-found");
      }
    });

    app.get("/banks/:url_name", async (req, res) => {
      var data = {
        title:
          "Real Estate | Banks " + req.params.url_name.split("-").join(" "),
      };

      const success = await axiosInstance.post("/api/bank/update_views", {
        url: "/banks/" + req.params.url_name,
      });
      // console.log(success.data);
      if (success.data.success) {
        await updateViewHistory(req.originalUrl, req);

        Bank.findOne({ url: "/banks/" + req.params.url_name })
          .then((doc) => {
            if (doc) {
              data.data = doc._doc;
              data.data = Images.logo_img_url_list([data.data], "Banks")[0];
              data.is_bookmarked = is_bookmarked(data.data.url, req);
              Elastic.get_entities(
                "",
                "project",
                5,
                [
                  "builder",
                  "area",
                  "price",
                  "images",
                  "banner_image",
                  "name",
                  "url",
                  "city",
                  "subcity",
                  "project_status",
                  "property_type",
                  "lease_rent",
                  "location.location",
                  "sq_fit_cost",
                ],
                {
                  should: [],
                  must: [
                    { match: { banks: doc.name } },
                    { term: { is_live: "2" } },
                  ],
                },
                0,
                { "price.min": { order: "asc" } }
              )
                .then((resp) => {
                  data.top_projects = Images.banner_img_url_list(resp.results);
                  data.top_projects = Images.get_image_url_list(resp.results);
                  data.top_projects = is_bookmarked_list(resp.results, req);
                  data.top_project_count = resp.count;
                  Elastic.get_top_entities(
                    [
                      { term: { doc_type: "project" } },
                      { match: { banks: data.data.name } },
                      { term: { is_live: "2" } },
                    ],
                    "property_type"
                  ).then((resp) => {
                    data.top_property_type = resp;
                    Elastic.get_entities("", "project", 5, ["name"], {
                      should: [],
                      must: [
                        { match: { banks: doc.name } },
                        { term: { is_live: "2" } },
                      ],
                    }).then(async(approvedProjects) => {
                      data.data.approvedProjects = approvedProjects;
                      data.hasOtherPage = true;
                      data.changeNumberFormat = changeNumberFormat;
                      // res.render('pages/bank', data);
                      let emi_per_lac = await getEmiPerLac();
                      if (emi_per_lac.success){
                        data.emi_per_lac = emi_per_lac.emi_per_lac;
                      } else {
                        data.emi_per_lac = 0;
                      }
                      res.render("pages/v1/bank", data);
                    });
                  });
                })
                .catch((e) => {
                  console.log(e);
                  res.redirect("/page-not-found");
                });
            } else {
              res.redirect("/page-not-found");
            }
          })
          .catch((e) => {
            console.log(e);
            res.redirect("/page-not-found");
          });
      } else {
        // console.log(data);
        console.log("Could not update views and hence redirecting");
        res.redirect("/page-not-found");
      }
    });

    app.get("/projects/:url_name", async (req, res) => {
      var data = {
        title:
          "Real Estate | Projects " + req.params.url_name.split("-").join(" "),
      };

      const success = await axiosInstance.post("/api/project/update_views", {
        url: "/projects/" + req.params.url_name,
      });
      // console.log(success.data);
      if (success.data.success) {
        await updateViewHistory(req.originalUrl, req);

        Project.findOne({ url: "/projects/" + req.params.url_name })
          .then(async (doc) => {
            // if (doc && doc.is_live !== "4") {
            if (doc) {
              doc.banner_image = await Images.banner_img_url(doc.banner_image);
              data.data = doc._doc;
              data.is_bookmarked = await is_bookmarked(data.data.url, req);
              data.data = await Images.get_image_url(data.data);
              // console.log(data.data.images);
              let matchingImage = data.data.images.find(
                (element) => element == doc.banner_image[0]
              );
              if (
                !matchingImage &&
                doc.banner_image.length !== 0 &&
                doc.banner_image[0] !== "/images/placeholder_bg.webp"
              ) {
                data.data.images.unshift(doc.banner_image[0]);
              } else if (matchingImage && matchingImage !== undefined) {
                data.data.images = data.data.images.filter(
                  (item) => item !== matchingImage
                );
                data.data.images.unshift(matchingImage);
              }

              data.viewer_images = data.data.video_url
                ? data.data.images.slice(0, 4)
                : data.data.images.slice(0, 5);

              data.viewer_images = data.viewer_images.map((i) => {
                return {
                  type: "image",
                  url: i,
                };
              });
              if (data.data.video_url) {
                data.viewer_images.push({
                  type: "video",
                  url: data.data.video_url,
                });
              }
              // console.log("::::::::", doc.builder);
              await Elastic.get_entities(
                "",
                "builder",
                1,
                ["name", "url", "logo"],
                {
                  should: [],
                  must: [{ match_phrase: { name: doc.builder } }],
                }
              )
                .then(async (resp) => {
                  // console.log("resp", resp);
                  data.builder = resp.results;
                  await Elastic.get_location_details(data.data).then(
                    async (resp) => {
                      data.location = resp;
                      await Similar.project
                        .by_location(data.data)
                        .then(async (resp) => {
                          data.similar = Images.banner_img_url_list(resp);
                          // console.log(data.builder);
                          await Similar.project
                            .by_builder(
                              data.builder[0] && data.builder[0].name,
                              data.data.property_type,
                              data.data.id
                            )
                            .then(async (resp) => {
                              // console.log(";;;resp", resp);
                              data.by_builder =
                                Images.banner_img_url_list(resp);
                              // console.log("{}{}{}{}", data.by_builder);
                              await Elastic.get_top_entities(
                                [
                                  { term: { doc_type: "property" } },
                                  { match_phrase: { project: data.data.name } },
                                  { term: { is_live: "2" } },
                                ],
                                "property_type",
                                Filters.property_sort("pricedesc")
                              ).then(async (resp) => {
                                data.top_property_type = resp;
                                // console.log("..............................");
                                // console.log(doc.name);
                                await Elastic.get_entities(
                                  "",
                                  "property",
                                  5,
                                  [
                                    "banner_image",
                                    "name",
                                    "url",
                                    "city",
                                    "subcity",
                                    "project_status",
                                    "property_type",
                                    "lease_rent",
                                    "location.location",
                                    "images",
                                    "price",
                                    "bhk_space",
                                    "area",
                                    "furnished",
                                    "tower_number",
                                    "facing",
                                    "sq_fit_cost",
                                  ],
                                  {
                                    should: [],
                                    must: [
                                      { match_phrase: { project: doc.name } },
                                      { term: { is_live: "2" } },
                                    ],
                                  },
                                  0,
                                  { "price.price": { order: "asc" } }
                                )
                                  .then(async (resp) => {
                                    data.top_properties = resp;
                                    data.top_properties.results =
                                      await is_bookmarked_list(
                                        resp.results,
                                        req
                                      );
                                    data.top_properties.results.sort((a, b) =>
                                      a.price.price > b.price.price
                                        ? 1
                                        : b.price.price > a.price.price
                                        ? -1
                                        : 0
                                    );
                                    await Elastic.get_entities(
                                      "",
                                      "authority",
                                      1,
                                      ["name", "url"],
                                      {
                                        should: [],
                                        must: [
                                          {
                                            match_phrase: {
                                              name: doc.authority,
                                            },
                                          },
                                        ],
                                      }
                                    )
                                      .then(async (resp) => {
                                        if (
                                          resp.results.length > 0 &&
                                          resp.results[0].url
                                        ) {
                                          data.data.authortiy_url =
                                            resp.results[0].url;
                                        }
                                        data.hasOtherPage = true;
                                        data.changeNumberFormat =
                                          changeNumberFormat;
                                        let emi_per_lac = await getEmiPerLac();
                                        if (emi_per_lac.success){
                                          data.emi_per_lac = emi_per_lac.emi_per_lac;
                                        } else {
                                          data.emi_per_lac = 0;
                                        }
                                        data.is_property_page = false;
                                        res.render("pages/v1/project", data);
                                        // res.render('pages/project', data);
                                      })
                                      .catch(async(error) => {
                                        console.log("Error occurred: ", error);
                                        data.hasOtherPage = true;
                                        data.changeNumberFormat = changeNumberFormat;
                                        let emi_per_lac = await getEmiPerLac();
                                        if (emi_per_lac.success){
                                          data.emi_per_lac = emi_per_lac.emi_per_lac;
                                        } else {
                                          data.emi_per_lac = 0;
                                        }
                                        data.is_property_page = false;
                                        res.render("pages/v1/project", data);
                                      });
                                  })
                                  .catch(async (error) => {
                                    console.log("Error occurred: ", error);
                                    data.hasOtherPage = true;
                                    data.changeNumberFormat = changeNumberFormat;
                                    let emi_per_lac = await getEmiPerLac();
                                    if (emi_per_lac.success){
                                      data.emi_per_lac = emi_per_lac.emi_per_lac;
                                    } else {
                                      data.emi_per_lac = 0;
                                    }
                                    data.is_property_page = false;
                                    res.render("pages/v1/project", data);
                                  });
                              });
                            })
                            .catch((e) => {
                              console.log(e);
                            });
                        });
                    }
                  );
                })
                .catch((e) => {
                  console.log(e);
                });
            } else {
              res.redirect("/page-not-found");
            }
          })
          .catch((e) => {
            console.log(e);
            res.redirect("/page-not-found");
          });
      } else {
        console.log("Could not find that url");
        res.redirect("/page-not-found");
      }
    });

    app.get("/properties/:url_name", async (req, res) => {
      var data = {
        title: "Real Estate | " + req.params.url_name.split("-").join(" "),
      };

      const success = await axiosInstance.post("/api/property/update_views", {
        url: "/properties/" + req.params.url_name,
      });
      // console.log(success.data);
      if (success.data.success) {
        await updateViewHistory(req.originalUrl, req);

        Property.findOne({ url: "/properties/" + req.params.url_name })
          .then(async (doc) => {
            if (doc) {
              doc.banner_image = await Images.banner_img_url(doc.banner_image);
              // console.log("doc.ba", doc.banner_image);
              data.data = doc._doc;
              data.is_bookmarked = is_bookmarked(data.data.url, req);
              // console.log("images images images images", data.data.images);
              data.data = Images.get_image_url(data.data);
              // console.log(doc);

              let matchingImage = data.data.images.find(
                (element) => element == doc.banner_image[0]
              );

              if (
                !matchingImage &&
                doc.banner_image.length !== 0 &&
                doc.banner_image[0] !== "/images/placeholder_bg.webp" &&
                doc.banner_image[0] !== "" &&
                doc.banner_image[0] !== BASE_URL + "/property/image/"
              ) {
                data.data.images.unshift(doc.banner_image[0]);
              } else if (matchingImage && matchingImage !== undefined) {
                data.data.images = data.data.images.filter(
                  (item) => item !== matchingImage
                );
                data.data.images.unshift(matchingImage);
              }

              await Elastic.get_entities(
                "",
                "project",
                1,
                [
                  "name",
                  "url",
                  "banks",
                  "project_status",
                  "floors",
                  "parking_details",
                  "amenities_json",
                  "connectivity_amenites_json",
                  "other_amenites_json",
                  "kid_amenites_json",
                  "health_amenites_json",
                  "green_amenites_json",
                  "authority",
                  "township",
                  "location.location",
                ],
                {
                  should: [],
                  must: [
                    { match_phrase: { name: doc.project } },
                    ,
                    { term: { is_live: "2" } },
                  ],
                }
              )
                .then((resp) => {
                  if (resp.results.length > 0) {
                    data.project = resp.results[0];
                  } else {
                    data.project = {};
                  }
                  console.log("line 1779");
                  Elastic.get_entities(
                    "",
                    "builder",
                    1,
                    ["name", "url", "logo"],
                    {
                      should: [],
                      must: [{ match_phrase: { name: doc.builder } }],
                    }
                  ).then((resp) => {
                    console.log("line 1790");
                    data.builder = resp.results;
                    Elastic.get_entities("", "authority", 1, ["name", "url"], {
                      should: [],
                      must: [{ match_phrase: { name: doc.authority } }],
                    }).then((resp) => {
                      console.log("line 1796");

                      data.authority = resp.results;

                      Elastic.get_location_details(data.data).then((resp) => {
                        data.location = resp;
                        Similar.property.by_location(data.data).then((resp) => {
                          data.similar = Images.banner_img_url_list(resp);
                          data.similar = Images.get_image_url_list(
                            data.similar
                          );
                          Similar.property
                            .by_builder(
                              data.builder[0] && data.builder[0].name,
                              data.data.property_type,
                              data.data.id
                            )
                            .then(async (resp) => {
                              data.by_builder =
                                Images.banner_img_url_list(resp);
                              data.by_builder = Images.get_image_url_list(
                                data.by_builder
                              );
                              // Add this class baed on a variable
                              data.hasOtherPage = true;
                              data.changeNumberFormat = changeNumberFormat;
                              data.viewer_images = data.data.video_url
                                ? data.data.images.slice(0, 4)
                                : data.data.images.slice(0, 5);
                              data.viewer_images = data.viewer_images.map(
                                (i) => {
                                  return {
                                    type: "image",
                                    url: i,
                                  };
                                }
                              );
                              if (data.data.video_url) {
                                data.viewer_images.push({
                                  type: "video",
                                  url: data.data.video_url,
                                });
                              }
                              // console.log(
                              //   "------------------------------------>Data\n",
                              //   data.project
                              // );

                              // res.render('pages/property', data);
                              console.log("---------------------");
                              // console.log(data.by_builder);
                              data.is_property_page = true;
                              let emi_per_lac = await getEmiPerLac();
                              if (emi_per_lac.success){
                                data.emi_per_lac = emi_per_lac.emi_per_lac;
                              } else {
                                data.emi_per_lac = 0;
                              }
                              res.render("pages/v1/property", data);
                            });
                        });
                      });
                    });
                  });
                })
                .catch((e) => {
                  console.log(e);
                  console.log(
                    "Redirecting from catch of Elastic.get_entities on line 1924"
                  );
                  res.redirect("/page-not-found");
                });
            } else {
              res.redirect("/page-not-found");
            }
          })
          .catch((e) => {
            console.log(e);
            res.redirect("/page-not-found");
          });
      } else {
        console.log("Error updating views and hence redirecting");
        res.redirect("/page-not-found");
      }
    });
    app.get("/locations/:url_name", async (req, res) => {
      let fields = [
        "name",
        "location_type",
        "location_details",
        "about",
        "history",
        "banner_image",
        "id",
        "state",
        "district",
        "city",
        "subcity",
        "images",
        "gdp",
        "capital_income",
        "population",
        "facilities",
        "highlights",
        "area",
        "details",
        "video_url",
        "url",
        "views",
        "is_live",
      ];
      var data = {
        title:
          "Real Estate | Locations " + req.params.url_name.split("-").join(" "),
      };
      Elastic.get_entities("", "location", 1, fields, {
        should: [],
        must: [{ match_phrase: { url: "/locations/" + req.params.url_name } }],
      })
        .then(async (resp) => {
          if (resp.results.length > 0) {
            data.data = resp.results[0];
            data.is_bookmarked = is_bookmarked(data.data.url, req);
            data.data.banner_image = Images.banner_img_url(
              data.data.banner_image
            );
            data.data = Images.get_image_url(data.data);
            // console.log("hi", data);
            try {
              if (data.data.location_type === "state") {
                const success = await axiosInstance.post(
                  "/api/state/update_views",
                  {
                    url: "/locations/" + req.params.url_name,
                  }
                );
                if (success.data.views) {
                  data.data.views = success.data.views;
                }
                if (!success.data.success) {
                  // console.log(success.data);
                  // return;
                }
              } else if (data.data.location_type === "district") {
                const success = await axiosInstance.post(
                  "/api/district/update_views",
                  { url: "/locations/" + req.params.url_name }
                );
                if (success.data.views) {
                  data.data.views = success.data.views;
                }
                if (!success.data.success) {
                  // console.log(success);
                  // return;
                }
              } else if (data.data.location_type === "city") {
                const success = await axiosInstance.post(
                  "/api/city/update_views",
                  {
                    url: "/locations/" + req.params.url_name,
                  }
                );
                if (success.data.views) {
                  data.data.views = success.data.views;
                }
                if (!success.data.success) {
                  // console.log(success);
                  // return;
                }
              } else if (data.data.location_type === "subcity") {
                const success = await axiosInstance.post(
                  "/api/subcity/update_views",
                  { url: "/locations/" + req.params.url_name }
                );
                if (success.data.views) {
                  data.data.views = success.data.views;
                }
                if (!success.data.success) {
                  // console.log(success);
                  // return;
                }
              }
            } catch (e) {
              console.log("Error while updating location views");
            }

            await updateViewHistory(req.originalUrl, req);

            let matchingImage = data.data.images
              ? data.data.images.find(
                  (element) => element == data.data.banner_image
                )
              : false;
            if (
              !matchingImage &&
              data.data.banner_image &&
              data.data.banner_image !== "/images/placeholder_bg.webp"
            ) {
              data.data.images.unshift(data.data.banner_image);
            } else if (matchingImage && matchingImage !== undefined) {
              data.data.images = data.data.images.filter(
                (item) => item !== matchingImage
              );
              data.data.images.unshift(matchingImage);
            }
            data.viewer_images = data.data.video_url
              ? data.data.images.slice(0, 4)
              : data.data.images.slice(0, 5);

            data.viewer_images = data.viewer_images.map((i) => {
              return {
                type: "image",
                url: i,
              };
            });
            if (data.data.video_url) {
              data.viewer_images.push({
                type: "video",
                url: data.data.video_url,
              });
            }
            let lt_ = data["data"]["location_type"];
            let must_query = {};
            must_query[lt_] = data.data.name;

            Boundary.findOne({
              $and: [
                { id: data.data.id },
                { location_type: data.data.location_type },
              ],
            }).then((doc) => {
              if (doc) {
                data.boundary = doc._doc.boundary;
                data.geoJSON = doc._doc.geoJSON;
              }
              Similar.location
                .project(lt_, data.data.name)
                .then((resp) => {
                  data.top_similar_projects = Images.banner_img_url_list(resp);
                  data.top_similar_projects = is_bookmarked_list(resp, req);
                  Similar.location.builder(lt_, data.data.name).then((resp) => {
                    data.top_builders = Images.logo_img_url_list(
                      resp,
                      "Builders"
                    );
                    data.hasOtherPage = true;
                    data.changeNumberFormat = changeNumberFormat;
                    var sort = Filters.project_sort(req.query.sort);
                    var topCitySort = Filters.location_sort(req.query.sort);
                    if (data.data.location_type != "state") {
                      Elastic.get_location_details(data.data).then((resp) => {
                        data.location = resp;
                        Elastic.get_entities(
                          "",
                          "project",
                          5,
                          [
                            "area",
                            "price",
                            "images",
                            "banner_image",
                            "name",
                            "url",
                            "city",
                            "subcity",
                            "project_status",
                            "property_type",
                            "lease_rent",
                            "location.location",
                            "builder",
                            "sq_fit_cost",
                            "total_properties",
                          ],
                          {
                            should: [],
                            must: [
                              { match_phrase: must_query },
                              { term: { is_live: "2" } },
                            ],
                          },
                          0,
                          sort || { "price.min": { order: "asc" } }
                        ).then((resp) => {
                          data.top_projects = Images.banner_img_url_list(
                            resp.results
                          );
                          data.top_project_count = resp.count;
                          data.top_projects = Images.get_image_url_list(
                            resp.results
                          );
                          data.top_projects = is_bookmarked_list(
                            resp.results,
                            req
                          );
                          Elastic.get_top_entities(
                            [
                              { term: { doc_type: "project" } },
                              { match_phrase: must_query },
                              { term: { is_live: "2" } },
                            ],
                            "property_type"
                          ).then(async (resp) => {
                            data.top_property_type = resp;
                            if (data.data.location_type == "district") {
                              // console.log("district", JSON.stringify(data))
                              if (data.data.name == "Mumbai City District") {
                                Elastic.get_entities(
                                  "",
                                  "location",
                                  100,
                                  [
                                    "name",
                                    "url",
                                    "city",
                                    "subcity",
                                    "location_type",
                                    "total_projects",
                                    "price",
                                  ],
                                  {
                                    should: [],
                                    must: [
                                      {
                                        match_phrase: {
                                          district: "Mumbai Suburban",
                                        },
                                      },
                                      {
                                        match_phrase: { location_type: "city" },
                                      },
                                      { term: { is_live: "2" } },
                                    ],
                                  },
                                  0,
                                  topCitySort
                                ).then(async (resp) => {
                                  data.data.top_city = resp;
                                  // console.log("district", data.data.top_city);
                                  data.changeNumberFormat = changeNumberFormat;
                                  let emi_per_lac = await getEmiPerLac();
                                  if (emi_per_lac.success){
                                    data.emi_per_lac = emi_per_lac.emi_per_lac;
                                  } else {
                                    data.emi_per_lac = 0;
                                  }
                                  res.render("pages/v1/location", data);
                                });
                              } else {
                                Elastic.get_entities(
                                  "",
                                  "location",
                                  100,
                                  [
                                    "name",
                                    "url",
                                    "city",
                                    "subcity",
                                    "location_type",
                                    "total_projects",
                                    "price",
                                  ],
                                  {
                                    should: [],
                                    must: [
                                      {
                                        match_phrase: {
                                          district: data.data.name,
                                        },
                                      },
                                      {
                                        match_phrase: { location_type: "city" },
                                      },
                                      { term: { is_live: "2" } },
                                    ],
                                  },
                                  0,
                                  topCitySort
                                ).then(async (resp) => {
                                  data.data.top_city = resp;
                                  // res.render('pages/location', data);
                                  data.changeNumberFormat = changeNumberFormat;
                                  let emi_per_lac = await getEmiPerLac();
                                  if (emi_per_lac.success){
                                    data.emi_per_lac = emi_per_lac.emi_per_lac;
                                  } else {
                                    data.emi_per_lac = 0;
                                  }
                                  res.render("pages/v1/location", data);
                                });
                              }
                            } else if (data.data.location_type == "city") {
                              Elastic.get_entities(
                                "",
                                "location",
                                100,
                                [
                                  "name",
                                  "url",
                                  "city",
                                  "subcity",
                                  "location_type",
                                  "total_projects",
                                  "price",
                                ],
                                {
                                  should: [],
                                  must: [
                                    { match_phrase: { city: data.data.name } },
                                    {
                                      match_phrase: {
                                        location_type: "subcity",
                                      },
                                    },
                                    { term: { is_live: "2" } },
                                  ],
                                },
                                0,
                                topCitySort
                              ).then(async (resp) => {
                                // console.log("-------------------------------")
                                // console.log(resp)
                                data.data.top_city = resp;
                                // console.log("city", JSON.stringify(data))
                                // es.render('pages/location', data);
                                // console.log("data ==== ", data.boundary);
                                data.changeNumberFormat = changeNumberFormat;
                                let emi_per_lac = await getEmiPerLac();
                                if (emi_per_lac.success){
                                  data.emi_per_lac = emi_per_lac.emi_per_lac;
                                } else {
                                  data.emi_per_lac = 0;
                                }
                                res.render("pages/v1/location", data);
                              });
                            } else if (data.data.location_type == "subcity") {
                              // console.log("subcity", JSON.stringify(data))
                              // res.render('pages/location', data);
                              // console.log("data ==== ", data.location);
                              data.changeNumberFormat = changeNumberFormat;
                              let emi_per_lac = await getEmiPerLac();
                              if (emi_per_lac.success){
                                data.emi_per_lac = emi_per_lac.emi_per_lac;
                              } else {
                                data.emi_per_lac = 0;
                              }
                              res.render("pages/v1/location", data);
                            }
                          });
                        });
                      });
                    } else {
                      Elastic.get_entities(
                        "",
                        "project",
                        5,
                        [
                          "area",
                          "price",
                          "images",
                          "banner_image",
                          "name",
                          "url",
                          "city",
                          "subcity",
                          "project_status",
                          "property_type",
                          "lease_rent",
                          "location.location",
                          "builder",
                          "sq_fit_cost",
                          "total_properties",
                        ],
                        {
                          should: [],
                          must: [
                            { match_phrase: must_query },
                            { term: { is_live: "2" } },
                          ],
                        },
                        0,
                        sort
                      ).then((resp) => {
                        data.top_projects = Images.banner_img_url_list(
                          resp.results
                        );
                        data.top_project_count = resp.count;
                        data.top_projects = Images.get_image_url_list(
                          resp.results
                        );
                        data.top_projects = is_bookmarked_list(
                          resp.results,
                          req
                        );
                        Elastic.get_location_details(data.data).then((resp) => {
                          data.location = resp;
                          Elastic.get_top_entities(
                            [
                              { term: { doc_type: "project" } },
                              { match_phrase: must_query },
                              { term: { is_live: "2" } },
                            ],
                            "property_type"
                          ).then((resp) => {
                            data.top_property_type = resp;
                            Elastic.get_entities(
                              "",
                              "location",
                              100,
                              [
                                "name",
                                "url",
                                "city",
                                "subcity",
                                "location_type",
                                "total_projects",
                                "price",
                              ],
                              {
                                should: [],
                                must: [
                                  { match_phrase: { state: data.data.name } },
                                  {
                                    match_phrase: { location_type: "district" },
                                  },
                                  { term: { is_live: "2" } },
                                ],
                              },
                              0,
                              topCitySort
                            ).then(async (resp) => {
                              data.data.top_city = resp;
                              // res.render('pages/location', data);
                              // console.log("data ==== ", data);
                              data.changeNumberFormat = changeNumberFormat;
                              let emi_per_lac = await getEmiPerLac();
                              if (emi_per_lac.success){
                                data.emi_per_lac = emi_per_lac.emi_per_lac;
                              } else {
                                data.emi_per_lac = 0;
                              }
                              res.render("pages/v1/location", data);
                            });
                          });
                        });
                      });
                    }
                  });
                })
                .catch((e) => {
                  console.log(e);
                });
            });
          } else {
            res.redirect("/page-not-found");
          }
        })
        .catch((e) => {
          console.log(e);
          console.log("hello")
        });
    });
    app.get("/authorities/:url_name", async (req, res) => {
      var data = {
        title:
          "Real Estate | Authorities " +
          req.params.url_name.split("-").join(" "),
      };

      let r = await Authority.findOne({ url: "/authorities/" + req.params.url_name });
      if (!r){
        try{
          let allUrls = await Authority.find({}, {url:1, _id:0});
          if (allUrls){
            for (let i = 0; i<allUrls.length; i++){
              let a = "/authorities/"+req.params.url_name.toLowerCase();
              let b = allUrls[i]._doc.url.toLowerCase()
              if (a === b){
                req.params.url_name = allUrls[i]._doc.url.split("/authorities/")[1];
                break;
              } else if(a.includes('&')){
                while(a.includes('&')){
                  a = a.replace('&', 'and');
                }
                if (a === b){
                  req.params.url_name = allUrls[i]._doc.url.split("/authorities/")[1];
                  break;
                }
              }
            }
          }
        } catch(e){
          console.log(e)
        }
      }

      const success = await axiosInstance.post("/api/authority/update_views", {
        url: "/authorities/" + req.params.url_name,
      });
      // console.log(success.data);
      if (success.data.success) {
        await updateViewHistory("/authorities/" + req.params.url_name, req);

        Authority.findOne({ url: "/authorities/" + req.params.url_name })
          .then((doc) => {
            if (doc) {
              data.data = doc._doc;
              data.is_bookmarked = is_bookmarked(data.data.url, req);
              Elastic.get_location_details(data.data)
                .then((resp) => {
                  data.location = resp;
                  Elastic.get_entities(
                    "",
                    "project",
                    5,
                    [
                      "area",
                      "price",
                      "images",
                      "banner_image",
                      "name",
                      "url",
                      "city",
                      "subcity",
                      "project_status",
                      "property_type",
                      "location",
                      "authority",
                      "builder",
                      "sq_fit_cost",
                    ],
                    {
                      should: [],
                      must: [
                        { match_phrase: { authority: doc.name } },
                        { term: { is_live: "2" } },
                      ],
                    },
                    0,
                    { "price.min": { order: "asc" } }
                  ).then((resp) => {
                    data.top_projects = Images.banner_img_url_list(
                      resp.results
                    );
                    data.top_projects = Images.get_image_url_list(resp.results);
                    data.top_projects = is_bookmarked_list(resp.results, req);
                    data.top_project_count = resp.count;
                    Elastic.get_top_entities(
                      [
                        { term: { doc_type: "project" } },
                        { match_phrase: { authority: data.data.name } },
                        { term: { is_live: "2" } },
                      ],
                      "property_type"
                    ).then(async (resp) => {
                      data.top_property_type = resp;

                      data.data.allImages = [];
                      if (
                        data.data.master_plan_with_years_image &&
                        data.data.master_plan_with_years_image.length > 0
                      ) {
                        data.data.allImages.push(
                          data.data.master_plan_with_years_image[0]
                        );
                      }
                      if (
                        data.data.area_covered_image &&
                        data.data.area_covered_image.length > 0
                      ) {
                        data.data.allImages.push(
                          data.data.area_covered_image[0]
                        );
                      }
                      if (
                        data.data.metro_routes_image &&
                        data.data.metro_routes_image.length > 0
                      ) {
                        data.data.allImages.push(
                          data.data.metro_routes_image[0]
                        );
                      }
                      data.hasOtherPage = true;
                      data.changeNumberFormat = changeNumberFormat;
                      let emi_per_lac = await getEmiPerLac();
                      if (emi_per_lac.success){
                        data.emi_per_lac = emi_per_lac.emi_per_lac;
                      } else {
                        data.emi_per_lac = 0;
                      }
                      res.render("pages/v1/authority", data);
                      // res.render('pages/authority', data);
                    });
                  });
                })
                .catch((e) => {
                  console.log(e);
                  res.redirect("/page-not-found");
                });
            } else {
              res.redirect("/page-not-found");
            }
          })
          .catch((e) => {
            console.log(e);
            res.redirect("/page-not-found");
          });
      } else {
        console.log("Error while updating views and hence redirecting");
        res.redirect("/page-not-found");
      }
    });
    app.post("/whatsapplogin", async (req, res) => {
      let {referer} = req.headers;
      referer = referer.split(req.headers.host)[1];
      while(referer.includes("/")){
        referer = referer.replace("/","_____");
      }
      while(referer.includes("&")){
        referer = referer.replace("&",".....");
      }
      const data = {
        loginMethod: "WHATSAPP",
        redirectionURL: process.env.AXIOS_BASE_URL + "/loggingInViaWhatsapp?r="+referer, //(optional but recommended)The url the user needs to be redirected to after getting the link on WhatsApp. If not set, the redirection url set in the dashboard will be used.
        orderId: "", //(optional)A string that the client can pass and it will be returned as it as on successful authentication. Can be used to map session with the login process.
        state: "", //(optional but recommended) Random string to make the redirectionURL un-shareable. The string needs be persisted across a session as the same string needs to be passed to fetch the user details.
      };
      let response = await axios.post(process.env.WHATSAPP_INTENT_LINK, data, {
        headers: {
          "Content-Type": "application/json",
          appId: process.env.WHATSAPP_APP_ID,
        },
      });
      // console.log(
      //   "response for whatsapp login",
      //   response.data,
      //   response.data.responseCode
      // );
      if (response.data.responseCode === 200) {
        // console.log(response.responseCode);
        res.redirect(response.data.data.intent);
      }
    });
    app.get("/loggingInViaWhatsapp", async (req, res) => {
      console.log(req.query);
      const data = {
        ...req.query,
      };
      res.render("pages/v1/loggingInViaWhatsapp.ejs", data);
    });
    app.get("/authwhatsapp", async (req, res) => {
      console.log(req.query);
      let referer = req.query.r;
      while(referer.includes("_____")){
        referer = referer.replace("_____", "/");
      }
      while(referer.includes(".....")){
        referer = referer.replace(".....", "&");
      }
      const data = {
        token: req.query.token,
      };
      // console.log(data);
      try {
        let response = await axios.post(
          process.env.WHATSAPP_VERIFY_USER,
          data,
          {
            headers: {
              "Content-Type": "application/json",
              appId: process.env.WHATSAPP_APP_ID,
              appSecret: process.env.WHATSAPP_APP_SECRET,
            },
          }
        );
        // console.log(response.data);
        // console.log(response.data.data.mobile);
        // const uid =
        //   response.data.data.mobile.length === 12
        //     ? response.data.data.mobile.slice(2)
        //     : response.data.data.mobile;
        const phoneData = parsePhoneNumber('+'+response.data.data.mobile);
        let uid = "";
        let country = {};
        if (phoneData && phoneData.nationalNumber && phoneData.countryCallingCode){
          uid = phoneData.nationalNumber;
          country = {code:'+'+phoneData.countryCallingCode, name:getCountryName(phoneData.country, '+'+phoneData.countryCallingCode)};
        }
        // console.log("uid = ", uid);

        let viewHistory = req.query.v ? req.query.v : "";
        let searchHistory = req.query.s ? req.query.s : "";

        Customer.findOne({ username: uid })
          .then(async (doc) => {
            // console.log(doc);
            const resp = await axios
              .post(
                process.env.AXIOS_BASE_URL + "/api/customer/logIn",
                {
                  userid: uid,
                  password: "",
                  isLoggingThroughWhatsapp: true,
                  viewHistory,
                  searchHistory,
                },
                { headers: { "Content-Type": "application/json" } }
              )
              .then(async (doc) => {
                // console.log(doc.data);
                // res.send(`<h1 style="max-width:100px;">${JSON.stringify(response.data)}</h1>`);
                if (doc.data.success) {
                  req.session.user = doc.data.session;
                  res.redirect(referer);
                } else {
                  if (doc.data.message === "User Not found. Please SignUp") {
                    console.info(`Signing up ${response.data.data.name}...`);
                    if (viewHistory !== "") {
                      viewHistory = JSON.parse(viewHistory);
                    }
                    if (searchHistory) {
                      searchHistory = JSON.parse(searchHistory);
                    }
                    
                    let newCustomer = new Customer();
                    newCustomer.country = country;
                    newCustomer.username = uid;
                    newCustomer.name = response.data.data.name;
                    if (searchHistory) {
                      newCustomer.searchHistory = searchHistory;
                    }
                    if (viewHistory) {
                      newCustomer.viewHistory = viewHistory;
                    }
                    await newCustomer
                      .save()
                      .then((savedCustomer) => {
                        console.log("Customer Created: ", savedCustomer);
                        req.session.user = savedCustomer;
                        res.redirect(referer);
                      })
                      .catch((error) => {
                        console.log("Customer Creation Error: ", error);
                        const data = {
                          error: { ...error.response.data },
                          redirectUrl: process.env.AXIOS_BASE_URL,
                          h1_message: `Customer Sign Up Error`,
                        };
                        res.render("pages/v1/whatsapp-auth-error.ejs", {
                          data: data,
                        });
                      });
                  } else {
                    const data = {
                      redirectUrl: process.env.AXIOS_BASE_URL,
                      h1_message: `${doc.data.message}`,
                    };
                    res.render("pages/v1/whatsapp-auth-error.ejs", {
                      data: data,
                    });
                  }
                }
              })
              .catch((e) => {
                console.log(e);
                const data = {
                  error: { ...e },
                  redirectUrl: process.env.AXIOS_BASE_URL,
                  h1_message: "There was an error in finding customer",
                };
                res.render("pages/v1/whatsapp-auth-error.ejs", { data: data });
              });
          })
          .catch((e) => {
            console.log(e);
          });
      } catch (e) {
        console.log(e);
        const data = {
          error: { ...e.response.data },
          redirectUrl: process.env.AXIOS_BASE_URL,
          h1_message: "This token is expired",
        };

        res.render("pages/v1/whatsapp-auth-error.ejs", { data: data });
      }
    });

    app.get("/newsletter/unsubscribe", async function (req, res) {
      let data = { title: "Real Estate | Newsletter Unsubscribe" };
      data.hasOtherPage = true;

      const query = req.query;
      console.log("Unsubscribe request received for ", req.query);

      if (query && query.email) {
        console.log("*Looking for the email");
        const relevantCustomer = await Newsletter.findOne({
          email: query.email,
        });
        if (relevantCustomer && relevantCustomer.isSubscribed) {
          console.log("**Customer found ...");
          await Newsletter.findOneAndUpdate(
            { email: query.email },
            { $set: { isSubscribed: false } },
            { new: true }
          )
            .then((successResponse) => {
              if (successResponse) {
                console.log(
                  `Successfully unsubscribed ${query.email} from newsletter`
                );
                data.response = {
                  success: true,
                  error: false,
                  message: "success",
                  email: query.email,
                };
                res.render("pages/v1/newsletterUnsubscribe", data);
              } else {
                console.log(
                  "***I am sorry, could not find and update the user: ",
                  query.email
                );
                data.response = {
                  success: false,
                  error: true,
                  message: "Couldn't unsubscribe, please try again later",
                };
                res.render("pages/v1/newsletterUnsubscribe", data);
              }
            })
            .catch((failureResponse) => {
              console.log(
                "***Catch Block: I am sorry, could not find and update the user: ",
                query.email
              );
              data.response = {
                success: false,
                error: true,
                message: "Couldn't unsubscribe, please try again later",
              };
              res.render("pages/v1/newsletterUnsubscribe", data);
            });
          res.render("pages/v1/newsletterUnsubscribe", data);
        } else {
          console.log("**No user found with this email");
          data.response = {
            success: false,
            error: true,
            message:
              "We couldn't find your email, you may have unsubscribed earlier",
          };
          res.render("pages/v1/newsletterUnsubscribe", data);
        }
      } else {
        res.redirect("/page-not-found");
      }
    });

    app.get("/interested-properties/unsubscribe", async function (req, res) {
      let data = { title: "Real Estate | Interested Propweries Email Unsubscribe" };
      data.hasOtherPage = true;

      const query = req.query;
      console.log("Unsubscribe request received for ", req.query);

      if (query && query.email) {
        console.log("*Looking for the email");
        const relevantCustomer = await InterestedBuyerSchema.find({
          email: query.email,
        });
        if(relevantCustomer && relevantCustomer.length > 0){
          console.log("Entries found: ", relevantCustomer.length);
          try{
            const response = await InterestedBuyerSchema.updateMany({email:query.email}, {$set:{isSubscribed:false}}, {new:true});
            if(response){
              console.log(`Successfully unsubscribed`, response);
              data.response = {
                success: true,
                error: false,
                message: "success",
                email: query.email,
              };
              res.render("pages/v1/interestedBuyerUnsubscribe", data);
            }else {
              console.log(
                "***I am sorry, could not find and update the user: ",
                query.email
              );
              data.response = {
                success: false,
                error: true,
                message: "Couldn't unsubscribe, please try again later",
              };
              res.render("pages/v1/interestedBuyerUnsubscribe", data);
            }
          } catch(e){
            console.log(e);
            console.log(
              "***Catch Block: I am sorry, could not find and update the user: ",
              query.email
            );
            data.response = {
              success: false,
              error: true,
              message: "Couldn't unsubscribe, please try again later",
            };
            res.render("pages/v1/interestedBuyerUnsubscribe", data);
          }
        }else {
          console.log("**No user found with this email");
          data.response = {
            success: false,
            error: true,
            message:
              "We couldn't find your email, you may have unsubscribed earlier",
          };
          res.render("pages/v1/interestedBuyerUnsubscribe", data);
        }
      } else {
        res.redirect("/page-not-found");
      }
    });
  }
};

let allCountryArray = [
  ["🇦🇫", "Afghanistan (‫افغانستان‬‎)", "+93"],
  ["🇦🇱", "Albania (Shqipëri)", "+355"],
  ["🇩🇿", "Algeria (‫الجزائر‬‎)", "+213"],
  ["🇦🇸", "American Samoa", "+1684"],
  ["🇦🇩", "Andorra", "+376"],
  ["🇦🇴", "Angola", "+244"],
  ["🇦🇮", "Anguilla", "+1264"],
  ["🇦🇬", "Antigua and Barbuda", "+1268"],
  ["🇦🇷", "Argentina", "+54"],
  ["🇦🇲", "Armenia (Հայաստան)", "+374"],
  ["🇦🇼", "Aruba", "+297"],
  ["🇦🇺", "Australia", "+61"],
  ["🇦🇹", "Austria (Österreich)", "+43"],
  ["🇦🇿", "Azerbaijan (Azərbaycan)", "+994"],
  ["🇧🇸", "Bahamas", "+1242"],
  ["🇧🇭", "Bahrain (‫البحرين‬‎)", "+973"],
  ["🇧🇩", "Bangladesh (বাংলাদেশ)", "+880"],
  ["🇧🇧", "Barbados", "+1246"],
  ["🇧🇾", "Belarus (Беларусь)", "+375"],
  ["🇧🇪", "Belgium (België)", "+32"],
  ["🇧🇿", "Belize", "+501"],
  ["🇧🇯", "Benin (Bénin)", "+229"],
  ["🇧🇲", "Bermuda", "+1441"],
  ["🇧🇹", "Bhutan (འབྲུག)", "+975"],
  ["🇧🇴", "Bolivia", "+591"],
  ["🇧🇦", "Bosnia and Herzegovina (Босна и Херцеговина)", "+387"],
  ["🇧🇼", "Botswana", "+267"],
  ["🇧🇷", "Brazil (Brasil)", "+55"],
  ["🇮🇴", "British Indian Ocean Territory", "+246"],
  ["🇻🇬", "British Virgin Islands", "+1284"],
  ["🇧🇳", "Brunei", "+673"],
  ["🇧🇬", "Bulgaria (България)", "+359"],
  ["🇧🇫", "Burkina Faso", "+226"],
  ["🇧🇮", "Burundi (Uburundi)", "+257"],
  ["🇰🇭", "Cambodia (កម្ពុជា)", "+855"],
  ["🇨🇲", "Cameroon (Cameroun)", "+237"],
  ["🇨🇦", "Canada", "+1"],
  ["🇨🇻", "Cape Verde (Kabu Verdi)", "+238"],
  ["🇰🇾", "Cayman Islands", "+1345"],
  ["🇨🇫", "Central African Republic (République centrafricaine)", "+236"],
  ["🇹🇩", "Chad (Tchad)", "+235"],
  ["🇨🇱", "Chile", "+56"],
  ["🇨🇳", "China (中国)", "+86"],
  ["🇨🇽", "Christmas Island", "+61"],
  ["🇨🇨", "Cocos (Keeling) Islands", "+61"],
  ["🇨🇴", "Colombia", "+57"],
  ["🇰🇲", "Comoros (‫جزر القمر‬‎)", "+269"],
  ["🇨🇩", "Congo (DRC) (Jamhuri ya Kisoemokrasia ya Kongo)", "+243"],
  ["🇨🇬", "Congo (Republic) (Congo-Brazzaville)", "+242"],
  ["🇨🇰", "Cook Islands", "+682"],
  ["🇨🇷", "Costa Rica", "+506"],
  ["🇨🇮", "Côte d’Ivoire", "+225"],
  ["🇭🇷", "Croatia (Hrvatska)", "+385"],
  ["🇨🇺", "Cuba", "+53"],
  ["🇨🇼", "Curaçao", "+599"],
  ["🇨🇾", "Cyprus (Κύπρος)", "+357"],
  ["🇨🇿", "Czech Republic (Česká republika)", "+420"],
  ["🇩🇰", "Denmark (Danmark)", "+45"],
  ["🇩🇯", "Djibouti", "+253"],
  ["🇩🇲", "Dominica", "+1767"],
  ["🇩🇴", "Dominican Republic (República Dominicana)", "+1"],
  ["🇪🇨", "Ecuador", "+593"],
  ["🇪🇬", "Egypt (‫مصر‬‎)", "+20"],
  ["🇸🇻", "El Salvador", "+503"],
  ["🇬🇶", "Equatorial Guinea (Guinea Ecuatorial)", "+240"],
  ["🇪🇷", "Eritrea", "+291"],
  ["🇪🇪", "Estonia (Eesti)", "+372"],
  ["🇪🇹", "Ethiopia", "+251"],
  ["🇫🇰", "Falkland Islands (Islas Malvinas)", "+500"],
  ["🇫🇴", "Faroe Islands (Føroyar)", "+298"],
  ["🇫🇯", "Fiji", "+679"],
  ["🇫🇮", "Finland (Suomi)", "+358"],
  ["🇫🇷", "France", "+33"],
  ["🇬🇫", "French Guiana (Guyane française)", "+594"],
  ["🇵🇫", "French Polynesia (Polynésie française)", "+689"],
  ["🇬🇦", "Gabon", "+241"],
  ["🇬🇲", "Gambia", "+220"],
  ["🇬🇪", "Georgia (საქართველო)", "+995"],
  ["🇩🇪", "Germany (Deutschland)", "+49"],
  ["🇬🇭", "Ghana (Gaana)", "+233"],
  ["🇬🇮", "Gibraltar", "+350"],
  ["🇬🇷", "Greece (Ελλάδα)", "+30"],
  ["🇬🇱", "Greenland (Kalaallit Nunaat)", "+299"],
  ["🇬🇩", "Grenada", "+1473"],
  ["🇬🇵", "Guadeloupe", "+590"],
  ["🇬🇺", "Guam", "+1671"],
  ["🇬🇹", "Guatemala", "+502"],
  ["🇬🇬", "Guernsey", "+44"],
  ["🇬🇳", "Guinea (Guinée)", "+224"],
  ["🇬🇼", "Guinea-Bissau (Guiné Bissau)", "+245"],
  ["🇬🇾", "Guyana", "+592"],
  ["🇭🇹", "Haiti", "+509"],
  ["🇭🇳", "Honduras", "+504"],
  ["🇭🇰", "Hong Kong (香港)", "+852"],
  ["🇭🇺", "Hungary (Magyarország)", "+36"],
  ["🇮🇸", "Iceland (Ísland)", "+354"],
  ["🇮🇳", "India (भारत)", "+91"],
  ["🇮🇩", "Indonesia", "+62"],
  ["🇮🇷", "Iran (‫ایران‬‎)", "+98"],
  ["🇮🇶", "Iraq (‫العراق‬‎)", "+964"],
  ["🇮🇪", "Ireland", "+353"],
  ["🇮🇲", "Isle of Man", "+44"],
  ["🇮🇱", "Israel (‫ישראל‬‎)", "+972"],
  ["🇮🇹", "Italy (Italia)", "+39"],
  ["🇯🇲", "Jamaica", "+1"],
  ["🇯🇵", "Japan (日本)", "+81"],
  ["🇯🇪", "Jersey", "+44"],
  ["🇯🇴", "Jordan (‫الأردن‬‎)", "+962"],
  ["🇰🇿", "Kazakhstan (Казахстан)", "+7"],
  ["🇰🇪", "Kenya", "+254"],
  ["🇰🇮", "Kiribati", "+686"],
  ["🇽🇰", "Kosovo", "+383"],
  ["🇰🇼", "Kuwait (‫الكويت‬‎)", "+965"],
  ["🇰🇬", "Kyrgyzstan (Кыргызстан)", "+996"],
  ["🇱🇦", "Laos (ລາວ)", "+856"],
  ["🇱🇻", "Latvia (Latvija)", "+371"],
  ["🇱🇧", "Lebanon (‫لبنان‬‎)", "+961"],
  ["🇱🇸", "Lesotho", "+266"],
  ["🇱🇷", "Liberia", "+231"],
  ["🇱🇾", "Libya (‫ليبيا‬‎)", "+218"],
  ["🇱🇮", "Liechtenstein", "+423"],
  ["🇱🇹", "Lithuania (Lietuva)", "+370"],
  ["🇱🇺", "Luxembourg", "+352"],
  ["🇲🇴", "Macau (澳門)", "+853"],
  ["🇲🇰", "North Macedonia (FYROM) (Македонија)", "+389"],
  ["🇲🇬", "Madagascar (Madagasikara)", "+261"],
  ["🇲🇼", "Malawi", "+265"],
  ["🇲🇾", "Malaysia", "+60"],
  ["🇲🇻", "Maldives", "+960"],
  ["🇲🇱", "Mali", "+223"],
  ["🇲🇹", "Malta", "+356"],
  ["🇲🇭", "Marshall Islands", "+692"],
  ["🇲🇶", "Martinique", "+596"],
  ["🇲🇷", "Mauritania (‫موريتانيا‬‎)", "+222"],
  ["🇲🇺", "Mauritius (Moris)", "+230"],
  ["🇾🇹", "Mayotte", "+262"],
  ["🇲🇽", "Mexico (México)", "+52"],
  ["🇫🇲", "Micronesia", "+691"],
  ["🇲🇩", "Moldova (Republica Moldova)", "+373"],
  ["🇲🇨", "Monaco", "+377"],
  ["🇲🇳", "Mongolia (Монгол)", "+976"],
  ["🇲🇪", "Montenegro (Crna Gora)", "+382"],
  ["🇲🇸", "Montserrat", "+1664"],
  ["🇲🇦", "Morocco (‫المغرب‬‎)", "+212"],
  ["🇲🇿", "Mozambique (Moçambique)", "+258"],
  ["🇲🇲", "Myanmar (Burma) (မြန်မာ)", "+95"],
  ["🇳🇦", "Namibia (Namibië)", "+264"],
  ["🇳🇷", "Nauru", "+674"],
  ["🇳🇵", "Nepal (नेपाल)", "+977"],
  ["🇳🇱", "Netherlands (Nederland)", "+31"],
  ["🇳🇨", "New Caledonia (Nouvelle-Calédonie)", "+687"],
  ["🇳🇿", "New Zealand", "+64"],
  ["🇳🇮", "Nicaragua", "+505"],
  ["🇳🇪", "Niger (Nijar)", "+227"],
  ["🇳🇬", "Nigeria", "+234"],
  ["🇳🇺", "Niue", "+683"],
  ["🇳🇫", "Norfolk Island", "+672"],
  ["🇰🇵", "North Korea (조선 민주주의 인민 공화국)", "+850"],
  ["🇲🇵", "Northern Mariana Islands", "+1670"],
  ["🇳🇴", "Norway (Norge)", "+47"],
  ["🇴🇲", "Oman (‫عُمان‬‎)", "+968"],
  ["🇵🇰", "Pakistan (‫پاکستان‬‎)", "+92"],
  ["🇵🇼", "Palau", "+680"],
  ["🇵🇸", "Palestine (‫فلسطين‬‎)", "+970"],
  ["🇵🇦", "Panama (Panamá)", "+507"],
  ["🇵🇬", "Papua New Guinea", "+675"],
  ["🇵🇾", "Paraguay", "+595"],
  ["🇵🇪", "Peru (Perú)", "+51"],
  ["🇵🇭", "Philippines", "+63"],
  ["🇵🇱", "Poland (Polska)", "+48"],
  ["🇵🇹", "Portugal", "+351"],
  ["🇵🇷", "Puerto Rico", "+1"],
  ["🇶🇦", "Qatar (‫قطر‬‎)", "+974"],
  ["🇷🇪", "Réunion (La Réunion)", "+262"],
  ["🇷🇴", "Romania (România)", "+40"],
  ["🇷🇺", "Russia (Россия)", "+7"],
  ["🇷🇼", "Rwanda", "+250"],
  ["🇧🇱", "Saint Barthélemy", "+590"],
  ["🇸🇭", "Saint Helena", "+290"],
  ["🇰🇳", "Saint Kitts and Nevis", "+1869"],
  ["🇱🇨", "Saint Lucia", "+1758"],
  ["🇲🇫", "Saint Martin (Saint-Martin (partie française))", "+590"],
  ["🇵🇲", "Saint Pierre and Miquelon (Saint-Pierre-et-Miquelon)", "+508"],
  ["🇻🇨", "Saint Vincent and the Grenadines", "+1784"],
  ["🇼🇸", "Samoa", "+685"],
  ["🇸🇲", "San Marino", "+378"],
  ["🇸🇹", "São Tomé and Príncipe (São Tomé e Príncipe)", "+239"],
  ["🇸🇦", "Saudi Arabia (‫المملكة العربية السعودية‬‎)", "+966"],
  ["🇸🇳", "Senegal (Sénégal)", "+221"],
  ["🇷🇸", "Serbia (Србија)", "+381"],
  ["🇸🇨", "Seychelles", "+248"],
  ["🇸🇱", "Sierra Leone", "+232"],
  ["🇸🇬", "Singapore", "+65"],
  ["🇸🇽", "Sint Maarten", "+1721"],
  ["🇸🇰", "Slovakia (Slovensko)", "+421"],
  ["🇸🇮", "Slovenia (Slovenija)", "+386"],
  ["🇸🇧", "Solomon Islands", "+677"],
  ["🇸🇴", "Somalia (Soomaaliya)", "+252"],
  ["🇿🇦", "South Africa", "+27"],
  ["🇰🇷", "South Korea (대한민국)", "+82"],
  ["🇸🇸", "South Sudan (‫جنوب السودان‬‎)", "+211"],
  ["🇪🇸", "Spain (España)", "+34"],
  ["🇱🇰", "Sri Lanka (ශ්‍රී ලංකාව)", "+94"],
  ["🇸🇩", "Sudan (‫السودان‬‎)", "+249"],
  ["🇸🇷", "Suriname", "+597"],
  ["🇸🇯", "Svalbard and Jan Mayen", "+47"],
  ["🇸🇿", "Swaziland", "+268"],
  ["🇸🇪", "Sweden (Sverige)", "+46"],
  ["🇨🇭", "Switzerland (Schweiz)", "+41"],
  ["🇸🇾", "Syria (‫سوريا‬‎)", "+963"],
  ["🇹🇼", "Taiwan (台灣)", "+886"],
  ["🇹🇯", "Tajikistan", "+992"],
  ["🇹🇿", "Tanzania", "+255"],
  ["🇹🇭", "Thailand (ไทย)", "+66"],
  ["🇹🇱", "Timor-Leste", "+670"],
  ["🇹🇬", "Togo", "+228"],
  ["🇹🇰", "Tokelau", "+690"],
  ["🇹🇴", "Tonga", "+676"],
  ["🇹🇹", "Trinisoad and Tobago", "+1868"],
  ["🇹🇳", "Tunisia (‫تونس‬‎)", "+216"],
  ["🇹🇷", "Turkey (Türkiye)", "+90"],
  ["🇹🇲", "Turkmenistan", "+993"],
  ["🇹🇨", "Turks and Caicos Islands", "+1649"],
  ["🇹🇻", "Tuvalu", "+688"],
  ["🇻🇮", "U.S. Virgin Islands", "+1340"],
  ["🇺🇬", "Uganda", "+256"],
  ["🇺🇦", "Ukraine (Україна)", "+380"],
  ["🇦🇪", "United Arab Emirates (‫الإمارات العربية المتحدة‬‎)", "+971"],
  ["🇬🇧", "United Kingdom", "+44"],
  ["🇺🇸", "United States", "+1"],
  ["🇺🇾", "Uruguay", "+598"],
  ["🇺🇿", "Uzbekistan (Oʻzbekiston)", "+998"],
  ["🇻🇺", "Vanuatu", "+678"],
  ["🇻🇦", "Vatican City (Città del Vaticano)", "+39"],
  ["🇻🇪", "Venezuela", "+58"],
  ["🇻🇳", "Vietnam (Việt Nam)", "+84"],
  ["🇼🇫", "Wallis and Futuna (Wallis-et-Futuna)", "+681"],
  ["🇾🇪", "Yemen (‫اليمن‬‎)", "+967"],
  ["🇿🇲", "Zambia", "+260"],
  ["🇿🇼", "Zimbabwe", "+263"],
  ["🇦🇽", "Åland Islands", "+358"],
];

let allCountryCodesObject = allCountryArray.map((x) => {
  return {
    flag: x[0],
    name: x[1],
    code: x[2],
  };
});

const getCountryName = (str, code) => {
  let f = countryAlphaCodes.filter((c)=>c["Alpha-2 code"] === str);
  if (f && f.length === 1){
    let n = allCountryCodesObject.filter((c)=>c.name.includes(f[0].Country) && c.code === code);
    if (n && n.length === 1) {
      return n[0].name;
    }
  }
  return "NA";
}

const countryAlphaCodes = [
  {
    "Country": "Afghanistan",
    "Alpha-2 code": "AF",
    "Alpha-3 code": "AFG",
    "Numeric": 4
  },
  {
    "Country": "Albania",
    "Alpha-2 code": "AL",
    "Alpha-3 code": "ALB",
    "Numeric": 8
  },
  {
    "Country": "Algeria",
    "Alpha-2 code": "DZ",
    "Alpha-3 code": "DZA",
    "Numeric": 12
  },
  {
    "Country": "American Samoa",
    "Alpha-2 code": "AS",
    "Alpha-3 code": "ASM",
    "Numeric": 16
  },
  {
    "Country": "Andorra",
    "Alpha-2 code": "AD",
    "Alpha-3 code": "AND",
    "Numeric": 20
  },
  {
    "Country": "Angola",
    "Alpha-2 code": "AO",
    "Alpha-3 code": "AGO",
    "Numeric": 24
  },
  {
    "Country": "Anguilla",
    "Alpha-2 code": "AI",
    "Alpha-3 code": "AIA",
    "Numeric": 660
  },
  {
    "Country": "Antarctica",
    "Alpha-2 code": "AQ",
    "Alpha-3 code": "ATA",
    "Numeric": 10
  },
  {
    "Country": "Antigua and Barbuda",
    "Alpha-2 code": "AG",
    "Alpha-3 code": "ATG",
    "Numeric": 28
  },
  {
    "Country": "Argentina",
    "Alpha-2 code": "AR",
    "Alpha-3 code": "ARG",
    "Numeric": 32
  },
  {
    "Country": "Armenia",
    "Alpha-2 code": "AM",
    "Alpha-3 code": "ARM",
    "Numeric": 51
  },
  {
    "Country": "Aruba",
    "Alpha-2 code": "AW",
    "Alpha-3 code": "ABW",
    "Numeric": 533
  },
  {
    "Country": "Australia",
    "Alpha-2 code": "AU",
    "Alpha-3 code": "AUS",
    "Numeric": 36
  },
  {
    "Country": "Austria",
    "Alpha-2 code": "AT",
    "Alpha-3 code": "AUT",
    "Numeric": 40
  },
  {
    "Country": "Azerbaijan",
    "Alpha-2 code": "AZ",
    "Alpha-3 code": "AZE",
    "Numeric": 31
  },
  {
    "Country": "Bahamas (the)",
    "Alpha-2 code": "BS",
    "Alpha-3 code": "BHS",
    "Numeric": 44
  },
  {
    "Country": "Bahrain",
    "Alpha-2 code": "BH",
    "Alpha-3 code": "BHR",
    "Numeric": 48
  },
  {
    "Country": "Bangladesh",
    "Alpha-2 code": "BD",
    "Alpha-3 code": "BGD",
    "Numeric": 50
  },
  {
    "Country": "Barbados",
    "Alpha-2 code": "BB",
    "Alpha-3 code": "BRB",
    "Numeric": 52
  },
  {
    "Country": "Belarus",
    "Alpha-2 code": "BY",
    "Alpha-3 code": "BLR",
    "Numeric": 112
  },
  {
    "Country": "Belgium",
    "Alpha-2 code": "BE",
    "Alpha-3 code": "BEL",
    "Numeric": 56
  },
  {
    "Country": "Belize",
    "Alpha-2 code": "BZ",
    "Alpha-3 code": "BLZ",
    "Numeric": 84
  },
  {
    "Country": "Benin",
    "Alpha-2 code": "BJ",
    "Alpha-3 code": "BEN",
    "Numeric": 204
  },
  {
    "Country": "Bermuda",
    "Alpha-2 code": "BM",
    "Alpha-3 code": "BMU",
    "Numeric": 60
  },
  {
    "Country": "Bhutan",
    "Alpha-2 code": "BT",
    "Alpha-3 code": "BTN",
    "Numeric": 64
  },
  {
    "Country": "Bolivia (Plurinational State of)",
    "Alpha-2 code": "BO",
    "Alpha-3 code": "BOL",
    "Numeric": 68
  },
  {
    "Country": "Bonaire, Sint Eustatius and Saba",
    "Alpha-2 code": "BQ",
    "Alpha-3 code": "BES",
    "Numeric": 535
  },
  {
    "Country": "Bosnia and Herzegovina",
    "Alpha-2 code": "BA",
    "Alpha-3 code": "BIH",
    "Numeric": 70
  },
  {
    "Country": "Botswana",
    "Alpha-2 code": "BW",
    "Alpha-3 code": "BWA",
    "Numeric": 72
  },
  {
    "Country": "Bouvet Island",
    "Alpha-2 code": "BV",
    "Alpha-3 code": "BVT",
    "Numeric": 74
  },
  {
    "Country": "Brazil",
    "Alpha-2 code": "BR",
    "Alpha-3 code": "BRA",
    "Numeric": 76
  },
  {
    "Country": "British Indian Ocean Territory (the)",
    "Alpha-2 code": "IO",
    "Alpha-3 code": "IOT",
    "Numeric": 86
  },
  {
    "Country": "Brunei Darussalam",
    "Alpha-2 code": "BN",
    "Alpha-3 code": "BRN",
    "Numeric": 96
  },
  {
    "Country": "Bulgaria",
    "Alpha-2 code": "BG",
    "Alpha-3 code": "BGR",
    "Numeric": 100
  },
  {
    "Country": "Burkina Faso",
    "Alpha-2 code": "BF",
    "Alpha-3 code": "BFA",
    "Numeric": 854
  },
  {
    "Country": "Burundi",
    "Alpha-2 code": "BI",
    "Alpha-3 code": "BDI",
    "Numeric": 108
  },
  {
    "Country": "Cabo Verde",
    "Alpha-2 code": "CV",
    "Alpha-3 code": "CPV",
    "Numeric": 132
  },
  {
    "Country": "Cambodia",
    "Alpha-2 code": "KH",
    "Alpha-3 code": "KHM",
    "Numeric": 116
  },
  {
    "Country": "Cameroon",
    "Alpha-2 code": "CM",
    "Alpha-3 code": "CMR",
    "Numeric": 120
  },
  {
    "Country": "Canada",
    "Alpha-2 code": "CA",
    "Alpha-3 code": "CAN",
    "Numeric": 124
  },
  {
    "Country": "Cayman Islands (the)",
    "Alpha-2 code": "KY",
    "Alpha-3 code": "CYM",
    "Numeric": 136
  },
  {
    "Country": "Central African Republic (the)",
    "Alpha-2 code": "CF",
    "Alpha-3 code": "CAF",
    "Numeric": 140
  },
  {
    "Country": "Chad",
    "Alpha-2 code": "TD",
    "Alpha-3 code": "TCD",
    "Numeric": 148
  },
  {
    "Country": "Chile",
    "Alpha-2 code": "CL",
    "Alpha-3 code": "CHL",
    "Numeric": 152
  },
  {
    "Country": "China",
    "Alpha-2 code": "CN",
    "Alpha-3 code": "CHN",
    "Numeric": 156
  },
  {
    "Country": "Christmas Island",
    "Alpha-2 code": "CX",
    "Alpha-3 code": "CXR",
    "Numeric": 162
  },
  {
    "Country": "Cocos (Keeling) Islands (the)",
    "Alpha-2 code": "CC",
    "Alpha-3 code": "CCK",
    "Numeric": 166
  },
  {
    "Country": "Colombia",
    "Alpha-2 code": "CO",
    "Alpha-3 code": "COL",
    "Numeric": 170
  },
  {
    "Country": "Comoros (the)",
    "Alpha-2 code": "KM",
    "Alpha-3 code": "COM",
    "Numeric": 174
  },
  {
    "Country": "Congo (the Democratic Republic of the)",
    "Alpha-2 code": "CD",
    "Alpha-3 code": "COD",
    "Numeric": 180
  },
  {
    "Country": "Congo (the)",
    "Alpha-2 code": "CG",
    "Alpha-3 code": "COG",
    "Numeric": 178
  },
  {
    "Country": "Cook Islands (the)",
    "Alpha-2 code": "CK",
    "Alpha-3 code": "COK",
    "Numeric": 184
  },
  {
    "Country": "Costa Rica",
    "Alpha-2 code": "CR",
    "Alpha-3 code": "CRI",
    "Numeric": 188
  },
  {
    "Country": "Croatia",
    "Alpha-2 code": "HR",
    "Alpha-3 code": "HRV",
    "Numeric": 191
  },
  {
    "Country": "Cuba",
    "Alpha-2 code": "CU",
    "Alpha-3 code": "CUB",
    "Numeric": 192
  },
  {
    "Country": "Curaçao",
    "Alpha-2 code": "CW",
    "Alpha-3 code": "CUW",
    "Numeric": 531
  },
  {
    "Country": "Cyprus",
    "Alpha-2 code": "CY",
    "Alpha-3 code": "CYP",
    "Numeric": 196
  },
  {
    "Country": "Czechia",
    "Alpha-2 code": "CZ",
    "Alpha-3 code": "CZE",
    "Numeric": 203
  },
  {
    "Country": "Côte d'Ivoire",
    "Alpha-2 code": "CI",
    "Alpha-3 code": "CIV",
    "Numeric": 384
  },
  {
    "Country": "Denmark",
    "Alpha-2 code": "DK",
    "Alpha-3 code": "DNK",
    "Numeric": 208
  },
  {
    "Country": "Djibouti",
    "Alpha-2 code": "DJ",
    "Alpha-3 code": "DJI",
    "Numeric": 262
  },
  {
    "Country": "Dominica",
    "Alpha-2 code": "DM",
    "Alpha-3 code": "DMA",
    "Numeric": 212
  },
  {
    "Country": "Dominican Republic (the)",
    "Alpha-2 code": "DO",
    "Alpha-3 code": "DOM",
    "Numeric": 214
  },
  {
    "Country": "Ecuador",
    "Alpha-2 code": "EC",
    "Alpha-3 code": "ECU",
    "Numeric": 218
  },
  {
    "Country": "Egypt",
    "Alpha-2 code": "EG",
    "Alpha-3 code": "EGY",
    "Numeric": 818
  },
  {
    "Country": "El Salvador",
    "Alpha-2 code": "SV",
    "Alpha-3 code": "SLV",
    "Numeric": 222
  },
  {
    "Country": "Equatorial Guinea",
    "Alpha-2 code": "GQ",
    "Alpha-3 code": "GNQ",
    "Numeric": 226
  },
  {
    "Country": "Eritrea",
    "Alpha-2 code": "ER",
    "Alpha-3 code": "ERI",
    "Numeric": 232
  },
  {
    "Country": "Estonia",
    "Alpha-2 code": "EE",
    "Alpha-3 code": "EST",
    "Numeric": 233
  },
  {
    "Country": "Eswatini",
    "Alpha-2 code": "SZ",
    "Alpha-3 code": "SWZ",
    "Numeric": 748
  },
  {
    "Country": "Ethiopia",
    "Alpha-2 code": "ET",
    "Alpha-3 code": "ETH",
    "Numeric": 231
  },
  {
    "Country": "Falkland Islands (the) [Malvinas]",
    "Alpha-2 code": "FK",
    "Alpha-3 code": "FLK",
    "Numeric": 238
  },
  {
    "Country": "Faroe Islands (the)",
    "Alpha-2 code": "FO",
    "Alpha-3 code": "FRO",
    "Numeric": 234
  },
  {
    "Country": "Fiji",
    "Alpha-2 code": "FJ",
    "Alpha-3 code": "FJI",
    "Numeric": 242
  },
  {
    "Country": "Finland",
    "Alpha-2 code": "FI",
    "Alpha-3 code": "FIN",
    "Numeric": 246
  },
  {
    "Country": "France",
    "Alpha-2 code": "FR",
    "Alpha-3 code": "FRA",
    "Numeric": 250
  },
  {
    "Country": "French Guiana",
    "Alpha-2 code": "GF",
    "Alpha-3 code": "GUF",
    "Numeric": 254
  },
  {
    "Country": "French Polynesia",
    "Alpha-2 code": "PF",
    "Alpha-3 code": "PYF",
    "Numeric": 258
  },
  {
    "Country": "French Southern Territories (the)",
    "Alpha-2 code": "TF",
    "Alpha-3 code": "ATF",
    "Numeric": 260
  },
  {
    "Country": "Gabon",
    "Alpha-2 code": "GA",
    "Alpha-3 code": "GAB",
    "Numeric": 266
  },
  {
    "Country": "Gambia (the)",
    "Alpha-2 code": "GM",
    "Alpha-3 code": "GMB",
    "Numeric": 270
  },
  {
    "Country": "Georgia",
    "Alpha-2 code": "GE",
    "Alpha-3 code": "GEO",
    "Numeric": 268
  },
  {
    "Country": "Germany",
    "Alpha-2 code": "DE",
    "Alpha-3 code": "DEU",
    "Numeric": 276
  },
  {
    "Country": "Ghana",
    "Alpha-2 code": "GH",
    "Alpha-3 code": "GHA",
    "Numeric": 288
  },
  {
    "Country": "Gibraltar",
    "Alpha-2 code": "GI",
    "Alpha-3 code": "GIB",
    "Numeric": 292
  },
  {
    "Country": "Greece",
    "Alpha-2 code": "GR",
    "Alpha-3 code": "GRC",
    "Numeric": 300
  },
  {
    "Country": "Greenland",
    "Alpha-2 code": "GL",
    "Alpha-3 code": "GRL",
    "Numeric": 304
  },
  {
    "Country": "Grenada",
    "Alpha-2 code": "GD",
    "Alpha-3 code": "GRD",
    "Numeric": 308
  },
  {
    "Country": "Guadeloupe",
    "Alpha-2 code": "GP",
    "Alpha-3 code": "GLP",
    "Numeric": 312
  },
  {
    "Country": "Guam",
    "Alpha-2 code": "GU",
    "Alpha-3 code": "GUM",
    "Numeric": 316
  },
  {
    "Country": "Guatemala",
    "Alpha-2 code": "GT",
    "Alpha-3 code": "GTM",
    "Numeric": 320
  },
  {
    "Country": "Guernsey",
    "Alpha-2 code": "GG",
    "Alpha-3 code": "GGY",
    "Numeric": 831
  },
  {
    "Country": "Guinea",
    "Alpha-2 code": "GN",
    "Alpha-3 code": "GIN",
    "Numeric": 324
  },
  {
    "Country": "Guinea-Bissau",
    "Alpha-2 code": "GW",
    "Alpha-3 code": "GNB",
    "Numeric": 624
  },
  {
    "Country": "Guyana",
    "Alpha-2 code": "GY",
    "Alpha-3 code": "GUY",
    "Numeric": 328
  },
  {
    "Country": "Haiti",
    "Alpha-2 code": "HT",
    "Alpha-3 code": "HTI",
    "Numeric": 332
  },
  {
    "Country": "Heard Island and McDonald Islands",
    "Alpha-2 code": "HM",
    "Alpha-3 code": "HMD",
    "Numeric": 334
  },
  {
    "Country": "Holy See (the)",
    "Alpha-2 code": "VA",
    "Alpha-3 code": "VAT",
    "Numeric": 336
  },
  {
    "Country": "Honduras",
    "Alpha-2 code": "HN",
    "Alpha-3 code": "HND",
    "Numeric": 340
  },
  {
    "Country": "Hong Kong",
    "Alpha-2 code": "HK",
    "Alpha-3 code": "HKG",
    "Numeric": 344
  },
  {
    "Country": "Hungary",
    "Alpha-2 code": "HU",
    "Alpha-3 code": "HUN",
    "Numeric": 348
  },
  {
    "Country": "Iceland",
    "Alpha-2 code": "IS",
    "Alpha-3 code": "ISL",
    "Numeric": 352
  },
  {
    "Country": "India",
    "Alpha-2 code": "IN",
    "Alpha-3 code": "IND",
    "Numeric": 356
  },
  {
    "Country": "Indonesia",
    "Alpha-2 code": "ID",
    "Alpha-3 code": "IDN",
    "Numeric": 360
  },
  {
    "Country": "Iran (Islamic Republic of)",
    "Alpha-2 code": "IR",
    "Alpha-3 code": "IRN",
    "Numeric": 364
  },
  {
    "Country": "Iraq",
    "Alpha-2 code": "IQ",
    "Alpha-3 code": "IRQ",
    "Numeric": 368
  },
  {
    "Country": "Ireland",
    "Alpha-2 code": "IE",
    "Alpha-3 code": "IRL",
    "Numeric": 372
  },
  {
    "Country": "Isle of Man",
    "Alpha-2 code": "IM",
    "Alpha-3 code": "IMN",
    "Numeric": 833
  },
  {
    "Country": "Israel",
    "Alpha-2 code": "IL",
    "Alpha-3 code": "ISR",
    "Numeric": 376
  },
  {
    "Country": "Italy",
    "Alpha-2 code": "IT",
    "Alpha-3 code": "ITA",
    "Numeric": 380
  },
  {
    "Country": "Jamaica",
    "Alpha-2 code": "JM",
    "Alpha-3 code": "JAM",
    "Numeric": 388
  },
  {
    "Country": "Japan",
    "Alpha-2 code": "JP",
    "Alpha-3 code": "JPN",
    "Numeric": 392
  },
  {
    "Country": "Jersey",
    "Alpha-2 code": "JE",
    "Alpha-3 code": "JEY",
    "Numeric": 832
  },
  {
    "Country": "Jordan",
    "Alpha-2 code": "JO",
    "Alpha-3 code": "JOR",
    "Numeric": 400
  },
  {
    "Country": "Kazakhstan",
    "Alpha-2 code": "KZ",
    "Alpha-3 code": "KAZ",
    "Numeric": 398
  },
  {
    "Country": "Kenya",
    "Alpha-2 code": "KE",
    "Alpha-3 code": "KEN",
    "Numeric": 404
  },
  {
    "Country": "Kiribati",
    "Alpha-2 code": "KI",
    "Alpha-3 code": "KIR",
    "Numeric": 296
  },
  {
    "Country": "Korea (the Democratic People's Republic of)",
    "Alpha-2 code": "KP",
    "Alpha-3 code": "PRK",
    "Numeric": 408
  },
  {
    "Country": "Korea (the Republic of)",
    "Alpha-2 code": "KR",
    "Alpha-3 code": "KOR",
    "Numeric": 410
  },
  {
    "Country": "Kuwait",
    "Alpha-2 code": "KW",
    "Alpha-3 code": "KWT",
    "Numeric": 414
  },
  {
    "Country": "Kyrgyzstan",
    "Alpha-2 code": "KG",
    "Alpha-3 code": "KGZ",
    "Numeric": 417
  },
  {
    "Country": "Lao People's Democratic Republic (the)",
    "Alpha-2 code": "LA",
    "Alpha-3 code": "LAO",
    "Numeric": 418
  },
  {
    "Country": "Latvia",
    "Alpha-2 code": "LV",
    "Alpha-3 code": "LVA",
    "Numeric": 428
  },
  {
    "Country": "Lebanon",
    "Alpha-2 code": "LB",
    "Alpha-3 code": "LBN",
    "Numeric": 422
  },
  {
    "Country": "Lesotho",
    "Alpha-2 code": "LS",
    "Alpha-3 code": "LSO",
    "Numeric": 426
  },
  {
    "Country": "Liberia",
    "Alpha-2 code": "LR",
    "Alpha-3 code": "LBR",
    "Numeric": 430
  },
  {
    "Country": "Libya",
    "Alpha-2 code": "LY",
    "Alpha-3 code": "LBY",
    "Numeric": 434
  },
  {
    "Country": "Liechtenstein",
    "Alpha-2 code": "LI",
    "Alpha-3 code": "LIE",
    "Numeric": 438
  },
  {
    "Country": "Lithuania",
    "Alpha-2 code": "LT",
    "Alpha-3 code": "LTU",
    "Numeric": 440
  },
  {
    "Country": "Luxembourg",
    "Alpha-2 code": "LU",
    "Alpha-3 code": "LUX",
    "Numeric": 442
  },
  {
    "Country": "Macao",
    "Alpha-2 code": "MO",
    "Alpha-3 code": "MAC",
    "Numeric": 446
  },
  {
    "Country": "Madagascar",
    "Alpha-2 code": "MG",
    "Alpha-3 code": "MDG",
    "Numeric": 450
  },
  {
    "Country": "Malawi",
    "Alpha-2 code": "MW",
    "Alpha-3 code": "MWI",
    "Numeric": 454
  },
  {
    "Country": "Malaysia",
    "Alpha-2 code": "MY",
    "Alpha-3 code": "MYS",
    "Numeric": 458
  },
  {
    "Country": "Maldives",
    "Alpha-2 code": "MV",
    "Alpha-3 code": "MDV",
    "Numeric": 462
  },
  {
    "Country": "Mali",
    "Alpha-2 code": "ML",
    "Alpha-3 code": "MLI",
    "Numeric": 466
  },
  {
    "Country": "Malta",
    "Alpha-2 code": "MT",
    "Alpha-3 code": "MLT",
    "Numeric": 470
  },
  {
    "Country": "Marshall Islands (the)",
    "Alpha-2 code": "MH",
    "Alpha-3 code": "MHL",
    "Numeric": 584
  },
  {
    "Country": "Martinique",
    "Alpha-2 code": "MQ",
    "Alpha-3 code": "MTQ",
    "Numeric": 474
  },
  {
    "Country": "Mauritania",
    "Alpha-2 code": "MR",
    "Alpha-3 code": "MRT",
    "Numeric": 478
  },
  {
    "Country": "Mauritius",
    "Alpha-2 code": "MU",
    "Alpha-3 code": "MUS",
    "Numeric": 480
  },
  {
    "Country": "Mayotte",
    "Alpha-2 code": "YT",
    "Alpha-3 code": "MYT",
    "Numeric": 175
  },
  {
    "Country": "Mexico",
    "Alpha-2 code": "MX",
    "Alpha-3 code": "MEX",
    "Numeric": 484
  },
  {
    "Country": "Micronesia (Federated States of)",
    "Alpha-2 code": "FM",
    "Alpha-3 code": "FSM",
    "Numeric": 583
  },
  {
    "Country": "Moldova (the Republic of)",
    "Alpha-2 code": "MD",
    "Alpha-3 code": "MDA",
    "Numeric": 498
  },
  {
    "Country": "Monaco",
    "Alpha-2 code": "MC",
    "Alpha-3 code": "MCO",
    "Numeric": 492
  },
  {
    "Country": "Mongolia",
    "Alpha-2 code": "MN",
    "Alpha-3 code": "MNG",
    "Numeric": 496
  },
  {
    "Country": "Montenegro",
    "Alpha-2 code": "ME",
    "Alpha-3 code": "MNE",
    "Numeric": 499
  },
  {
    "Country": "Montserrat",
    "Alpha-2 code": "MS",
    "Alpha-3 code": "MSR",
    "Numeric": 500
  },
  {
    "Country": "Morocco",
    "Alpha-2 code": "MA",
    "Alpha-3 code": "MAR",
    "Numeric": 504
  },
  {
    "Country": "Mozambique",
    "Alpha-2 code": "MZ",
    "Alpha-3 code": "MOZ",
    "Numeric": 508
  },
  {
    "Country": "Myanmar",
    "Alpha-2 code": "MM",
    "Alpha-3 code": "MMR",
    "Numeric": 104
  },
  {
    "Country": "Namibia",
    "Alpha-2 code": "NA",
    "Alpha-3 code": "NAM",
    "Numeric": 516
  },
  {
    "Country": "Nauru",
    "Alpha-2 code": "NR",
    "Alpha-3 code": "NRU",
    "Numeric": 520
  },
  {
    "Country": "Nepal",
    "Alpha-2 code": "NP",
    "Alpha-3 code": "NPL",
    "Numeric": 524
  },
  {
    "Country": "Netherlands (the)",
    "Alpha-2 code": "NL",
    "Alpha-3 code": "NLD",
    "Numeric": 528
  },
  {
    "Country": "New Caledonia",
    "Alpha-2 code": "NC",
    "Alpha-3 code": "NCL",
    "Numeric": 540
  },
  {
    "Country": "New Zealand",
    "Alpha-2 code": "NZ",
    "Alpha-3 code": "NZL",
    "Numeric": 554
  },
  {
    "Country": "Nicaragua",
    "Alpha-2 code": "NI",
    "Alpha-3 code": "NIC",
    "Numeric": 558
  },
  {
    "Country": "Niger (the)",
    "Alpha-2 code": "NE",
    "Alpha-3 code": "NER",
    "Numeric": 562
  },
  {
    "Country": "Nigeria",
    "Alpha-2 code": "NG",
    "Alpha-3 code": "NGA",
    "Numeric": 566
  },
  {
    "Country": "Niue",
    "Alpha-2 code": "NU",
    "Alpha-3 code": "NIU",
    "Numeric": 570
  },
  {
    "Country": "Norfolk Island",
    "Alpha-2 code": "NF",
    "Alpha-3 code": "NFK",
    "Numeric": 574
  },
  {
    "Country": "Northern Mariana Islands (the)",
    "Alpha-2 code": "MP",
    "Alpha-3 code": "MNP",
    "Numeric": 580
  },
  {
    "Country": "Norway",
    "Alpha-2 code": "NO",
    "Alpha-3 code": "NOR",
    "Numeric": 578
  },
  {
    "Country": "Oman",
    "Alpha-2 code": "OM",
    "Alpha-3 code": "OMN",
    "Numeric": 512
  },
  {
    "Country": "Pakistan",
    "Alpha-2 code": "PK",
    "Alpha-3 code": "PAK",
    "Numeric": 586
  },
  {
    "Country": "Palau",
    "Alpha-2 code": "PW",
    "Alpha-3 code": "PLW",
    "Numeric": 585
  },
  {
    "Country": "Palestine, State of",
    "Alpha-2 code": "PS",
    "Alpha-3 code": "PSE",
    "Numeric": 275
  },
  {
    "Country": "Panama",
    "Alpha-2 code": "PA",
    "Alpha-3 code": "PAN",
    "Numeric": 591
  },
  {
    "Country": "Papua New Guinea",
    "Alpha-2 code": "PG",
    "Alpha-3 code": "PNG",
    "Numeric": 598
  },
  {
    "Country": "Paraguay",
    "Alpha-2 code": "PY",
    "Alpha-3 code": "PRY",
    "Numeric": 600
  },
  {
    "Country": "Peru",
    "Alpha-2 code": "PE",
    "Alpha-3 code": "PER",
    "Numeric": 604
  },
  {
    "Country": "Philippines (the)",
    "Alpha-2 code": "PH",
    "Alpha-3 code": "PHL",
    "Numeric": 608
  },
  {
    "Country": "Pitcairn",
    "Alpha-2 code": "PN",
    "Alpha-3 code": "PCN",
    "Numeric": 612
  },
  {
    "Country": "Poland",
    "Alpha-2 code": "PL",
    "Alpha-3 code": "POL",
    "Numeric": 616
  },
  {
    "Country": "Portugal",
    "Alpha-2 code": "PT",
    "Alpha-3 code": "PRT",
    "Numeric": 620
  },
  {
    "Country": "Puerto Rico",
    "Alpha-2 code": "PR",
    "Alpha-3 code": "PRI",
    "Numeric": 630
  },
  {
    "Country": "Qatar",
    "Alpha-2 code": "QA",
    "Alpha-3 code": "QAT",
    "Numeric": 634
  },
  {
    "Country": "Republic of North Macedonia",
    "Alpha-2 code": "MK",
    "Alpha-3 code": "MKD",
    "Numeric": 807
  },
  {
    "Country": "Romania",
    "Alpha-2 code": "RO",
    "Alpha-3 code": "ROU",
    "Numeric": 642
  },
  {
    "Country": "Russian Federation (the)",
    "Alpha-2 code": "RU",
    "Alpha-3 code": "RUS",
    "Numeric": 643
  },
  {
    "Country": "Rwanda",
    "Alpha-2 code": "RW",
    "Alpha-3 code": "RWA",
    "Numeric": 646
  },
  {
    "Country": "Réunion",
    "Alpha-2 code": "RE",
    "Alpha-3 code": "REU",
    "Numeric": 638
  },
  {
    "Country": "Saint Barthélemy",
    "Alpha-2 code": "BL",
    "Alpha-3 code": "BLM",
    "Numeric": 652
  },
  {
    "Country": "Saint Helena, Ascension and Tristan da Cunha",
    "Alpha-2 code": "SH",
    "Alpha-3 code": "SHN",
    "Numeric": 654
  },
  {
    "Country": "Saint Kitts and Nevis",
    "Alpha-2 code": "KN",
    "Alpha-3 code": "KNA",
    "Numeric": 659
  },
  {
    "Country": "Saint Lucia",
    "Alpha-2 code": "LC",
    "Alpha-3 code": "LCA",
    "Numeric": 662
  },
  {
    "Country": "Saint Martin (French part)",
    "Alpha-2 code": "MF",
    "Alpha-3 code": "MAF",
    "Numeric": 663
  },
  {
    "Country": "Saint Pierre and Miquelon",
    "Alpha-2 code": "PM",
    "Alpha-3 code": "SPM",
    "Numeric": 666
  },
  {
    "Country": "Saint Vincent and the Grenadines",
    "Alpha-2 code": "VC",
    "Alpha-3 code": "VCT",
    "Numeric": 670
  },
  {
    "Country": "Samoa",
    "Alpha-2 code": "WS",
    "Alpha-3 code": "WSM",
    "Numeric": 882
  },
  {
    "Country": "San Marino",
    "Alpha-2 code": "SM",
    "Alpha-3 code": "SMR",
    "Numeric": 674
  },
  {
    "Country": "Sao Tome and Principe",
    "Alpha-2 code": "ST",
    "Alpha-3 code": "STP",
    "Numeric": 678
  },
  {
    "Country": "Saudi Arabia",
    "Alpha-2 code": "SA",
    "Alpha-3 code": "SAU",
    "Numeric": 682
  },
  {
    "Country": "Senegal",
    "Alpha-2 code": "SN",
    "Alpha-3 code": "SEN",
    "Numeric": 686
  },
  {
    "Country": "Serbia",
    "Alpha-2 code": "RS",
    "Alpha-3 code": "SRB",
    "Numeric": 688
  },
  {
    "Country": "Seychelles",
    "Alpha-2 code": "SC",
    "Alpha-3 code": "SYC",
    "Numeric": 690
  },
  {
    "Country": "Sierra Leone",
    "Alpha-2 code": "SL",
    "Alpha-3 code": "SLE",
    "Numeric": 694
  },
  {
    "Country": "Singapore",
    "Alpha-2 code": "SG",
    "Alpha-3 code": "SGP",
    "Numeric": 702
  },
  {
    "Country": "Sint Maarten (Dutch part)",
    "Alpha-2 code": "SX",
    "Alpha-3 code": "SXM",
    "Numeric": 534
  },
  {
    "Country": "Slovakia",
    "Alpha-2 code": "SK",
    "Alpha-3 code": "SVK",
    "Numeric": 703
  },
  {
    "Country": "Slovenia",
    "Alpha-2 code": "SI",
    "Alpha-3 code": "SVN",
    "Numeric": 705
  },
  {
    "Country": "Solomon Islands",
    "Alpha-2 code": "SB",
    "Alpha-3 code": "SLB",
    "Numeric": 90
  },
  {
    "Country": "Somalia",
    "Alpha-2 code": "SO",
    "Alpha-3 code": "SOM",
    "Numeric": 706
  },
  {
    "Country": "South Africa",
    "Alpha-2 code": "ZA",
    "Alpha-3 code": "ZAF",
    "Numeric": 710
  },
  {
    "Country": "South Georgia and the South Sandwich Islands",
    "Alpha-2 code": "GS",
    "Alpha-3 code": "SGS",
    "Numeric": 239
  },
  {
    "Country": "South Sudan",
    "Alpha-2 code": "SS",
    "Alpha-3 code": "SSD",
    "Numeric": 728
  },
  {
    "Country": "Spain",
    "Alpha-2 code": "ES",
    "Alpha-3 code": "ESP",
    "Numeric": 724
  },
  {
    "Country": "Sri Lanka",
    "Alpha-2 code": "LK",
    "Alpha-3 code": "LKA",
    "Numeric": 144
  },
  {
    "Country": "Sudan (the)",
    "Alpha-2 code": "SD",
    "Alpha-3 code": "SDN",
    "Numeric": 729
  },
  {
    "Country": "Suriname",
    "Alpha-2 code": "SR",
    "Alpha-3 code": "SUR",
    "Numeric": 740
  },
  {
    "Country": "Svalbard and Jan Mayen",
    "Alpha-2 code": "SJ",
    "Alpha-3 code": "SJM",
    "Numeric": 744
  },
  {
    "Country": "Sweden",
    "Alpha-2 code": "SE",
    "Alpha-3 code": "SWE",
    "Numeric": 752
  },
  {
    "Country": "Switzerland",
    "Alpha-2 code": "CH",
    "Alpha-3 code": "CHE",
    "Numeric": 756
  },
  {
    "Country": "Syrian Arab Republic",
    "Alpha-2 code": "SY",
    "Alpha-3 code": "SYR",
    "Numeric": 760
  },
  {
    "Country": "Taiwan (Province of China)",
    "Alpha-2 code": "TW",
    "Alpha-3 code": "TWN",
    "Numeric": 158
  },
  {
    "Country": "Tajikistan",
    "Alpha-2 code": "TJ",
    "Alpha-3 code": "TJK",
    "Numeric": 762
  },
  {
    "Country": "Tanzania, United Republic of",
    "Alpha-2 code": "TZ",
    "Alpha-3 code": "TZA",
    "Numeric": 834
  },
  {
    "Country": "Thailand",
    "Alpha-2 code": "TH",
    "Alpha-3 code": "THA",
    "Numeric": 764
  },
  {
    "Country": "Timor-Leste",
    "Alpha-2 code": "TL",
    "Alpha-3 code": "TLS",
    "Numeric": 626
  },
  {
    "Country": "Togo",
    "Alpha-2 code": "TG",
    "Alpha-3 code": "TGO",
    "Numeric": 768
  },
  {
    "Country": "Tokelau",
    "Alpha-2 code": "TK",
    "Alpha-3 code": "TKL",
    "Numeric": 772
  },
  {
    "Country": "Tonga",
    "Alpha-2 code": "TO",
    "Alpha-3 code": "TON",
    "Numeric": 776
  },
  {
    "Country": "Trinidad and Tobago",
    "Alpha-2 code": "TT",
    "Alpha-3 code": "TTO",
    "Numeric": 780
  },
  {
    "Country": "Tunisia",
    "Alpha-2 code": "TN",
    "Alpha-3 code": "TUN",
    "Numeric": 788
  },
  {
    "Country": "Turkey",
    "Alpha-2 code": "TR",
    "Alpha-3 code": "TUR",
    "Numeric": 792
  },
  {
    "Country": "Turkmenistan",
    "Alpha-2 code": "TM",
    "Alpha-3 code": "TKM",
    "Numeric": 795
  },
  {
    "Country": "Turks and Caicos Islands (the)",
    "Alpha-2 code": "TC",
    "Alpha-3 code": "TCA",
    "Numeric": 796
  },
  {
    "Country": "Tuvalu",
    "Alpha-2 code": "TV",
    "Alpha-3 code": "TUV",
    "Numeric": 798
  },
  {
    "Country": "Uganda",
    "Alpha-2 code": "UG",
    "Alpha-3 code": "UGA",
    "Numeric": 800
  },
  {
    "Country": "Ukraine",
    "Alpha-2 code": "UA",
    "Alpha-3 code": "UKR",
    "Numeric": 804
  },
  {
    "Country": "United Arab Emirates (the)",
    "Alpha-2 code": "AE",
    "Alpha-3 code": "ARE",
    "Numeric": 784
  },
  {
    "Country": "United Kingdom of Great Britain and Northern Ireland (the)",
    "Alpha-2 code": "GB",
    "Alpha-3 code": "GBR",
    "Numeric": 826
  },
  {
    "Country": "United States Minor Outlying Islands (the)",
    "Alpha-2 code": "UM",
    "Alpha-3 code": "UMI",
    "Numeric": 581
  },
  {
    "Country": "United States of America (the)",
    "Alpha-2 code": "US",
    "Alpha-3 code": "USA",
    "Numeric": 840
  },
  {
    "Country": "Uruguay",
    "Alpha-2 code": "UY",
    "Alpha-3 code": "URY",
    "Numeric": 858
  },
  {
    "Country": "Uzbekistan",
    "Alpha-2 code": "UZ",
    "Alpha-3 code": "UZB",
    "Numeric": 860
  },
  {
    "Country": "Vanuatu",
    "Alpha-2 code": "VU",
    "Alpha-3 code": "VUT",
    "Numeric": 548
  },
  {
    "Country": "Venezuela (Bolivarian Republic of)",
    "Alpha-2 code": "VE",
    "Alpha-3 code": "VEN",
    "Numeric": 862
  },
  {
    "Country": "Viet Nam",
    "Alpha-2 code": "VN",
    "Alpha-3 code": "VNM",
    "Numeric": 704
  },
  {
    "Country": "Virgin Islands (British)",
    "Alpha-2 code": "VG",
    "Alpha-3 code": "VGB",
    "Numeric": 92
  },
  {
    "Country": "Virgin Islands (U.S.)",
    "Alpha-2 code": "VI",
    "Alpha-3 code": "VIR",
    "Numeric": 850
  },
  {
    "Country": "Wallis and Futuna",
    "Alpha-2 code": "WF",
    "Alpha-3 code": "WLF",
    "Numeric": 876
  },
  {
    "Country": "Western Sahara",
    "Alpha-2 code": "EH",
    "Alpha-3 code": "ESH",
    "Numeric": 732
  },
  {
    "Country": "Yemen",
    "Alpha-2 code": "YE",
    "Alpha-3 code": "YEM",
    "Numeric": 887
  },
  {
    "Country": "Zambia",
    "Alpha-2 code": "ZM",
    "Alpha-3 code": "ZMB",
    "Numeric": 894
  },
  {
    "Country": "Zimbabwe",
    "Alpha-2 code": "ZW",
    "Alpha-3 code": "ZWE",
    "Numeric": 716
  },
  {
    "Country": "Åland Islands",
    "Alpha-2 code": "AX",
    "Alpha-3 code": "ALA",
    "Numeric": 248
  }
 ]