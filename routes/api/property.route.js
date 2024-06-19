// user.route.js

const express = require("express");
const router = express.Router();
Images = require("../../classes/images");
Filters = require("../../classes/filters");
const multer = require("multer");
const multerS3 = require('multer-s3')
const aws = require("aws-sdk");
const mongoose = require("mongoose");
aws.config.update({
  secretAccessKey: "tkklYz7xNRp+plXh1S4wedA8+q94hsY2ZB3BdjE8",
  accessKeyId: "AKIAXLIN4PPU6MFTVKEE",
});
const s3 = new aws.S3();
var ObjectId = require("mongoose").Types.ObjectId;
const {
  changeNumberFormat,
  numberWithCommas,
} = require("../../classes/numberFormatter");
const { is_bookmarked_list } = require("../../classes/bookmark");
const AdminConfigSchema = require("../../models/admin_config.model");
const UserSubmittedProperty = require("../../models/user_submitted_properties.model");
const { getEmiPerLac } = require("../api/__helper")
var multer_upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "assetzilla-bucket",
    acl: "public-read",
    key: function (req, file, cb) {
      var date = new Date();
      console.log(
        "dyn-res/property/image/" +
          "property_" +
          date.getTime().toString() +
          Math.floor(Math.random() * 1000000).toString() +
          "." +
          file.originalname.split(".")[file.originalname.split(".").length - 1]
      );
      cb(
        null,
        "dyn-res/property/image/" +
          "property_" +
          date.getTime().toString() +
          Math.floor(Math.random() * 1000000).toString() +
          "." +
          file.originalname.split(".")[file.originalname.split(".").length - 1]
      );
    },
  }),
});

var multer_upload_panaadhar = multer({
  storage: multerS3({
    s3: s3,
    bucket: "assetzilla-bucket",
    acl: "public-read",
    key: function (req, file, cb) {
      var date = new Date();
      cb(
        null,
        "dyn-res/property/image/" +
          "property_" +
          date.getTime().toString() +
          Math.floor(Math.random() * 1000000).toString() +
          "." +
          file.originalname.split(".")[file.originalname.split(".").length - 1]
      );
    },
  }),
});
// const {authenticate} = require('../../middlewares/authenticate.middleware');

const Property = require("../../models/property.model");
const ReWork = require("../../models/rework.model");
const CustomerSchema = require("../../models/customer.model");
const nodemailer = require("nodemailer");
const appconstants = require("../../appConstants");
const transporter = nodemailer.createTransport(appconstants.nodemailerAuth);
const Project = require("../../models/project.model");
const { default: slugify } = require("slugify");
const { slugifyOptions } = require("../../appConstants");

//****Image upload */
const {
  convertToWebpImageMiddleware,
} = require("../../middlewares/convertToWebp.middleware");
const { uploadToS3 } = require("../../middlewares/uploadToS3.middleware");
var only_multer = multer({ dest: "./uploads/" });
const setEntityName = (req, res, next) => {
  let newReqFiles = [];
  req.files.forEach((img) => {
    img.entity = "property";
    newReqFiles.push(img);
  });
  req.files = newReqFiles;
  next();
};

// const updateAllProperties = async () => {
//     try {
//         //   const alreadyExist = await Property.updateMany({
//         //     updatedAt: Date.now(),
//         //   });
//       await Property.find().then(async (propertyDocs) => {

//         for( var a=0; a<=propertyDocs.length; a++) {
//             if (propertyDocs && propertyDocs[a]) {

//                         await Property.findOneAndUpdate({ //PICK EACH PROJECT AND UPDATE ITS area OBJECT
//                             _id: propertyDocs[a]._id
//                         }, {
//                             $set: {
//                                 updatedAt: Date.now(),
//                             }
//                         }, { "new": true }).then(async (data) => {
//                             var clonedObj = { ...data };
//                             delete clonedObj._doc._id
//                             await Elastic.delete_entity({ match_phrase: { url: clonedObj._doc.url } }).then(async (resp) => {
//                                 clonedObj._doc.doc_type = "property"
//                                 clonedObj._doc.unique = 1;
//                                 await Elastic.create_entitiy(clonedObj._doc).then(async (resp) => {
//                                     console.log("_____________________________________________________________________________",resp)
//                                 }, async (err) => {
//                                     console.log('error white creating', err)
//                                 })
//                             }, async (error) => {
//                                 console.log('error white deleting', error)
//                             });

//                         }, (updateErr) => console.log("updateErr", updateErr));

//             }
//         }

//     })
//     } catch (err) {
//       console.log("Admin User Created",err)
//     }
// };
// updateAllProperties()

router.post("/get", async function (req, res) {
  console.log("property /get req.body", req.body);
  if ("limit" in req.body) {
    var limit = req.body.limit;
  } else {
    var limit = 12;
  }
  if ("query" in req.body) {
    var query = req.body.query;
  } else {
    var query = "";
  }
  if ("skip" in req.body) {
    var skip = req.body.skip;
  } else {
    var skip = 0;
  }
  if ("filter" in req.body) {
    var filter = await Filters.property_filters(req.body.filter);
  } else {
    var filter = { should: [], must: [] };
  }
  if (req.body.status && req.body.status !== "5") {
    filter.must.push({ term: { is_live: req.body.status } });
  }
  if (req.body.status && req.body.status === "5") {
    filter.must.push({ exists: { field: "case_id" } });
  }
  if ("sort" in req.body) {
    var sort = Filters.property_sort(req.body.sort);
    console.log("3333", sort);
  } else {
    var sort = Filters.property_sort("newest");
    console.log("3333", sort);
  }
  //code for location wise access
  if ("user" in req.body) {
    const { getUserLocationLevelAccessInfo, getUserPropertyLevelAccessInfo } = require("./__helper");
    var accessData = await getUserLocationLevelAccessInfo(req.body.user);
    console.log(accessData);
    // let locationAccessLevel = accessData.locationAccessLevel;
    // let locationAccessValue = accessData.locationAccessValue;
    if (accessData && accessData.length > 0 && accessData[0].locationAccessLevel !== "FULL ACCESS") {
      if (!filter) {
        var filter = { should: [], must: [{ bool: { should: [] } }] };
      }
      let ind = 0;
      if (filter.must.length === 0) {
        filter.must[0] = { bool: { should: [] } };
      } else {
        filter.must.push({ bool: { should: [] } });
        ind = filter.must.length - 1;
      }
      accessData.forEach((obj) => {
        let termQuery = {};
        termQuery[obj.locationAccessLevel.toLowerCase()] =
          obj.locationAccessValue;
        console.log(filter.must);
        console.log(filter.must.length);
        console.log(ind);
        filter.must[ind].bool.should.push({ term: termQuery });
        console.log(termQuery);
      });
    }
    var accessDataP = await getUserPropertyLevelAccessInfo(req.body.user);
    console.log("-->",accessDataP);
    if (accessDataP && accessDataP.length > 0 && accessDataP[0].propertyTypeAccessLevel !== "FULL ACCESS") {
      if (!filter) {
        var filter = { should: [], must: [{ bool: { should: [] } }] };
      }
      let ind = 0;
      if (filter.must.length === 0) {
        filter.must[0] = { bool: { should: [] } };
      } else {
        filter.must.push({ bool: { should: [] } });
        ind = filter.must.length - 1;
      }
      accessDataP.forEach((obj) => {
        let termQuery = {};
        termQuery.property_type = obj.propertyTypeAccessValue;
        console.log(filter.must);
        console.log(filter.must.length);
        console.log(ind);
        filter.must[ind].bool.should.push({ term: termQuery });
        console.log(termQuery);
      });
    }
  }
  console.log("Filters : ", filter.must[0]);

  Elastic.get_entities(
    query,
    "property",
    limit,
    [
      "url",
      "name",
      "builder",
      "project",
      "id",
      "area",
      "price",
      "property_type",
      "is_live",
      "case_id",
      "updatedAt",
      "views",
    ],
    filter,
    skip,
    sort
  ).then((resp) => {
    // console.log("resp prop :********", resp);
    resp.results = resp.results.map((p) => {
      if (p.area && p.area.area){
        p.area_converted = p.area.area.toLocaleString("en-IN");
        delete p.area;
      }
      return p;
    })
    res.status(200).json({
      success: true,
      message: "Fetched Properties's list",
      results: resp.results,
      total: resp.count,
    });
  });
});
router.post("/infinite", async function (req, res) {
  req.body.query = JSON.parse(req.body.query);
  if ("limit" in req.body) {
    var limit = req.body.limit;
  } else {
    var limit = 12;
  }
  if ("q" in req.body.query) {
    var query = req.body.query.q[0];
  } else {
    var query = "";
  }
  if ("skip" in req.body) {
    var skip = req.body.skip;
  } else {
    var skip = 0;
  }
  if ("query" in req.body) {
    var filter = await Filters.property_filters(req.body.query);
  } else {
    var filter = { should: [], must: [] };
  }
  filter.must.push({ term: { is_live: "2" } });
  if ("sort" in req.body.query) {
    var sort = Filters.property_sort(req.body.query.sort[0]);
  } else {
    var sort = Filters.property_sort(undefined);
  }
  Elastic.get_entities(
    query,
    "property",
    limit,
    [
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
      "images",
      "price",
      "builder",
      "area",
      "sq_fit_cost",
    ],
    filter,
    skip,
    sort
  ).then(async (resp) => {
    if (resp.results.length > 0) {
      resp.results = Images.banner_img_url_list(resp.results);
      resp.results = is_bookmarked_list(resp.results, req);
      resp.custSkip = skip * 12;

      // res.render('partials/property_cards', resp);
      resp.changeNumberFormat = changeNumberFormat;
      let emi_per_lac = await getEmiPerLac();
      if (emi_per_lac.success){
        resp.emi_per_lac = emi_per_lac.emi_per_lac;
      } else {
        resp.emi_per_lac = 0;
      }
      res.render("pages/v1/partials/property-card", resp);
    } else {
      res.send("");
    }
  });
});
router.post("/infinite-map", async function (req, res) {
  req.body.query = JSON.parse(req.body.query);
  if ("limit" in req.body) {
    var limit = req.body.limit;
  } else {
    var limit = 12;
  }
  if ("q" in req.body.query) {
    var query = req.body.query.q[0];
  } else {
    var query = "";
  }
  if ("skip" in req.body) {
    var skip = req.body.skip;
  } else {
    var skip = 0;
  }
  if ("query" in req.body) {
    var filter = await Filters.property_filters(req.body.query);
  } else {
    var filter = { should: [], must: [] };
  }
  filter.must.push({ term: { is_live: "2" } });
  if ("sort" in req.body.query) {
    var sort = Filters.property_sort(req.body.query.sort[0]);
  } else {
    var sort = Filters.property_sort(undefined);
  }
  Elastic.get_entities(
    query,
    "property",
    limit,
    ["location.location", "name", "id", "url", "price"],
    filter,
    skip,
    sort
  ).then(async (resp) => {
    if (resp.results.length > 0) {
      let data = [];
      resp.results.forEach((element) => {
        if ("location" in element) {
          data.push([
            Number(element.location.location.lat),
            Number(element.location.location.lng),
            element.name,
            element.url,
            element.property_type,
            element.id,
          ]);
        }
      });
      res.status(200).json({
        success: true,
        results: data,
      });
    } else {
      res.send("");
    }
  });
});

router.post("/table-pagination", async function (req, res) {
  req.body.query = JSON.parse(req.body.query);
  if ("limit" in req.body) {
    var limit = req.body.limit;
  } else {
    var limit = 10;
  }
  if ("q" in req.body.query) {
    var query = req.body.query.q[0];
  } else {
    var query = "";
  }
  if ("skip" in req.body) {
    var skip = req.body.skip;
  } else {
    var skip = 0;
  }
  if ("query" in req.body) {
    var filter = await Filters.property_filters(req.body.query);
  } else {
    var filter = { should: [], must: [] };
  }
  filter.must.push({ term: { is_live: "2" } });
  if ("sort" in req.body.query) {
    var sort = Filters.property_sort(req.body.query.sort[0]);
  }
  Elastic.get_entities(
    query,
    "property",
    limit,
    [
      "name",
      "property_type",
      "city",
      "subcity",
      "bhk_space",
      "url",
      "area",
      "price",
      "furnished",
      "sq_fit_cost",
    ],
    filter,
    skip,
    sort
  ).then((resp) => {
    res.status(200).json({
      success: true,
      message: "Fetched Properties list",
      results: resp.results,
      total: resp.count,
    });
  });
});

router.post(
  "/multer",
  only_multer.array("file"),
  convertToWebpImageMiddleware,
  setEntityName,
  uploadToS3,
  function (req, res) {
    let data = [];
    req.files.forEach((element) => {
      data.push(element.key.split("/").pop());
    });
    console.log("property images => ", data);
    res.status(200).json({
      success: true,
      results: data,
    });
  }
);

router.post(
  "/summernoteMulter",
  only_multer.array("file"),
  convertToWebpImageMiddleware,
  setEntityName,
  uploadToS3,
  function (req, res) {
    let data = [];
    console.log("-----------------");
    // console.log(req);
    console.log(req.files);
    console.log("-----------------");
    req.files.forEach((element) => {
      data.push(element.key.split("/").pop());
    });
    // console.log(data);
    res.status(200).json({
      success: true,
      results: data,
    });
  }
);

router.post(
  "/panaadhar/multer",
  multer_upload_panaadhar.array("file"),
  function (req, res) {
    let data = [];
    req.files.forEach((element) => {
      data.push(element.key.split("/").pop());
    });
    res.status(200).json({
      success: true,
      results: data,
    });
  }
);

router.post("/add", async function (req, res) {
  let data = req.body;
  console.log("5656", data);
  let date = new Date();
  let id = AlphaId.encode(date.getTime());
  data.id = id;
  data.is_live = "1";
  if (data.bhk_space) {
    data.url =
      "/properties/" +
      slugify(data.bhk_space, slugifyOptions) +
      "-in-" +
      slugify(data.project, slugifyOptions) +
      "-" +
      data.id;
    // substring is added to de pluralize
    if (
      data.property_type === "Apartments" ||
      data.property_type === "Residential Plots" ||
      data.property_type === "Villas" ||
      data.property_type === "Floors" ||
      data.property_type === "Serviced Apartments"
    ) {
      data.name =
        data.bhk_space +
        " " +
        data.property_type.substring(0, data.property_type.length - 1) +
        " in " +
        data.project;
    } else {
      data.name =
        data.bhk_space + " " + data.property_type + " in " + data.project;
    }
  } else {
    data.url =
      "/properties/" + slugify(data.project, slugifyOptions) + "-" + data.id;
    if (
      data.property_type === "Apartments" ||
      data.property_type === "Residential Plots" ||
      data.property_type === "Villas" ||
      data.property_type === "Floors" ||
      data.property_type === "Serviced Apartments"
    ) {
      data.name =
        data.property_type.substring(0, data.property_type.length - 1) +
        " in " +
        data.project;
    } else {
      data.name = data.property_type + " in " + data.project;
    }
  }

  if (data.case_id) {
    try{
      let usp = await UserSubmittedProperty.findOneAndUpdate({case_id_display: data.case_id}, {status : "Waiting For Approval"}, {new: true});
      console.log(usp);
    } catch(e){
      console.log(e);
    }
    // let newDoc = await CustomerSchema.findOne({
    //   submitted_property: {
    //     $elemMatch: {
    //       case_id_display: data.case_id,
    //     },
    //   },
    // });
    // newDoc = JSON.parse(JSON.stringify(newDoc));

    // if (newDoc && newDoc.submitted_property) {
    //   let propertyDetails = newDoc.submitted_property;
    //   console.log("5656", propertyDetails);
    //   let objIndex = propertyDetails.findIndex(
    //     (obj) => obj.case_id_display == data.case_id
    //   );

    //   propertyDetails[objIndex].status = "Waiting For Approval";

    //   let newuser = await CustomerSchema.findOneAndUpdate(
    //     {
    //       submitted_property: {
    //         $elemMatch: {
    //           case_id_display: data.case_id,
    //         },
    //       },
    //     },
    //     {
    //       submitted_property: propertyDetails,
    //     },
    //     { new: true }
    //   );
      
    // }
  }

  var property = new Property();
  Object.assign(property, data);
  property.save().then(
    (doc) => {
      data.doc_type = "property";
      data.unique = 1;
      data.updatedAt = doc.updatedAt;
      Elastic.create_entitiy(data).then((resp) => {
        console.log("++++++", resp);
        res.status(200).json({
          success: true,
          message: "New property added",
        });
      });
    },
    (e) => {
      console.log("Error occured", e);
      res.status(200).json({
        success: false,
        message: "Couldn't add new property",
      });
    }
  );
});
router.post("/get-doc", function (req, res) {
  Property.findOne({ url: req.body.url }).then((doc) => {
    res.status(200).json({
      success: true,
      data: doc._doc,
    });
  });
});

router.post("/edit", async function (req, res) {
  let data = req.body;

  if (data.updated) {
    delete data.updated;
  }

  let _id = data._id;
  data.is_live = "1";
  if (data.bhk_space) {
    data.url =
      "/properties/" +
      slugify(data.bhk_space, slugifyOptions) +
      "-in-" +
      slugify(data.project, slugifyOptions) +
      "-" +
      data.id;
    // substring is added to de pluralize
    if (
      data.property_type === "Apartments" ||
      data.property_type === "Residential Plots" ||
      data.property_type === "Villas" ||
      data.property_type === "Floors" ||
      data.property_type === "Serviced Apartments"
    ) {
      data.name =
        data.bhk_space +
        " " +
        data.property_type.substring(0, data.property_type.length - 1) +
        " in " +
        data.project;
    } else {
      data.name =
        data.bhk_space + " " + data.property_type + " in " + data.project;
    }
  } else {
    data.url =
      "/properties/" + slugify(data.project, slugifyOptions) + "-" + data.id;
    if (
      data.property_type === "Apartments" ||
      data.property_type === "Residential Plots" ||
      data.property_type === "Villas" ||
      data.property_type === "Floors" ||
      data.property_type === "Serviced Apartments"
    ) {
      data.name =
        data.property_type.substring(0, data.property_type.length - 1) +
        " in " +
        data.project;
    } else {
      data.name = data.property_type + " in " + data.project;
    }
  }
  delete data._id;
  if (data.case_id) {
    try{
      let usp = await UserSubmittedProperty.findOneAndUpdate({case_id_display: data.case_id}, {status : "Waiting For Approval"}, {new: true});
      console.log(usp);
    } catch(e){
      console.log(e);
    }
    // let newDoc = await CustomerSchema.findOne({
    //   submitted_property: {
    //     $elemMatch: {
    //       case_id_display: data.case_id,
    //     },
    //   },
    // });
    // newDoc = JSON.parse(JSON.stringify(newDoc));

    // if (newDoc && newDoc.submitted_property) {
    //   let propertyDetails = newDoc.submitted_property;
    //   console.log("5656", propertyDetails);
    //   let objIndex = propertyDetails.findIndex(
    //     (obj) => obj.case_id_display == data.case_id
    //   );

    //   propertyDetails[objIndex].status = "Waiting For Approval";
    //   propertyDetails[objIndex].isApproved = false;

    //   let newuser = await CustomerSchema.findOneAndUpdate(
    //     {
    //       submitted_property: {
    //         $elemMatch: {
    //           case_id_display: data.case_id,
    //         },
    //       },
    //     },
    //     {
    //       submitted_property: propertyDetails,
    //     },
    //     { new: true }
    //   );
    // }
  }

  Property.findOneAndUpdate(
    { _id: _id },
    data,
    { new: true, upsert: true },
    (err, doc) => {
      if (err) {
        res.status(200).json({
          success: false,
          message: "Couldn't edit Property",
        });
      } else {
        Elastic.delete_entity({ match_phrase: { url: data.url } }).then(
          (resp) => {
            data.doc_type = "property";
            data.unique = 1;
            data.updatedAt = doc.updatedAt;
            Elastic.create_entitiy(data).then((resp) => {
              res.status(200).json({
                success: true,
                message: "Property Edited",
              });
            });
          }
        );
      }
    }
  );
});

router.post("/typeahead", function (req, res) {
  filter_ = [{ term: { doc_type: "property" } }, { term: { is_live: "2" } }];
  results = Elastic.query_typeahead(req.body.data, filter_);
  results.then((data) => {
    if (results) {
      res.status(200).json({
        success: true,
        results: data,
      });
    } else {
      res.status(500).json({
        success: false,
        results: results,
      });
    }
  });
});
router.post("/set_status", async function (req, res) {
  try {
    let doc = await Property.findOneAndUpdate(
      { url: req.body.url },
      { is_live: req.body.status },
      { new: true, upsert: true }
    );

    if (req.body.status === "2") {
      var xyz = {};
      if (doc.case_id) {
        let newDoc = await CustomerSchema.findOne({
          submitted_property: {
            $elemMatch: {
              case_id_display: doc.case_id,
            },
          },
        });
        newDoc = JSON.parse(JSON.stringify(newDoc));

        if (newDoc && newDoc.submitted_property) {
          let propertyDetails = newDoc.submitted_property;
          console.log("5656", propertyDetails);
          let objIndex = propertyDetails.findIndex(
            (obj) => obj.case_id_display == doc.case_id
          );

          propertyDetails[objIndex].status = "Approved";

          propertyDetails[objIndex].isApproved = true;
          xyz = propertyDetails[objIndex];
          console.log("56", xyz);
          let newuser = await CustomerSchema.findOneAndUpdate(
            {
              submitted_property: {
                $elemMatch: {
                  case_id_display: doc.case_id,
                },
              },
            },
            {
              submitted_property: propertyDetails,
            },
            { new: true }
          );

          let userEmailTemplate = `<!doctype html>
                    <html lang="en">
                    <head>
                        <!-- Required meta tags -->
                        <meta charset="utf-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
                        <link rel="preconnect" href="https://fonts.googleapis.com">
                        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@100;400;700&display=swap" rel="stylesheet">
                        <title>Assets Zilla</title>
                        <style>
                            *,
                            ::after,
                            ::before {
                            box-sizing: border-box;
                            }
                        </style>
                    </head>
                    <body style="background: #f4f4f4;font-size: 15px;line-height:20px;">
                        <div style="max-width:650px; margin:0 auto;background:white;font-family: 'Poppins', sans-serif;">
                            <div style="width:100%;float:left;margin-top:10px;background: #f3f9ff;padding: 15px 50px;box-sizing: border-box;">
                                <div style="width:100%;float:left;text-align: center;padding-top: 25px;">
                                <a href="https://assetzilla.com/"><img src="https://assetzilla-bucket.s3.amazonaws.com/email-template/logo.png" style="text-align: center;margin: 0 auto;height: 60px;object-fit: contain;"></a>
                                </div>
                                <div style="width:100%;float:left;text-align:center;">
                                <img src="https://assetzilla-bucket.s3.amazonaws.com/email-template/prop.webp" style="margin-top:25px;margin-bottom:15px;max-width: 100%;height: 200px;object-fit: contain;">
                                <div style="background: #FFFFFF;box-shadow: 0 2px 10px 3px #F6F6F6;border-radius: 29px;padding: 15px;margin-bottom:25px;">
                                    <h4 style="font-size: 14px;color: #000;text-align: center;margin-top: 0;margin-bottom: 5px; ${
                                      !xyz.username ? "display: none" : ""
                                    }">Hello: <span>${xyz.username}</span></h4>
                                    
                                <h4 style="font-size: 16px;color: #7EB041;text-align: center;margin-top: 10px;font-weight: 600;margin-bottom: 0px;">Your submitted prpoerty with Case Id: ${
                                  doc.case_id
                                } has been approved.</h4>
                                
                                <p style="max-width: 500px;margin: 0 auto;
                                font-size: 14px;
                                color: #6A6A6A;
                                text-align: center;
                                font-weight: 400;
                                line-height: 180%;
                                padding-top: 20px;
                                    ">
                                For more details, you should go to <a href="https://assetzilla.com${
                                  doc.url
                                } ">https://assetzilla.com${doc.url} </a> .
                                </p>
                                <br>
                                <h4 style="margin-bottom: 0px;font-size: 20px;">Thanks!</h4>
                                <a href="https://assetzilla.com/"><img src="https://assetzilla-bucket.s3.amazonaws.com/email-template/logo.png" style="width:80px;"></a>
                                <ul style="list-style: none;padding-left: 0;">
                                    <li style="display: inline-block;margin-right: 30px;"><a style="font-size: 12px;color: #347BBF;text-align: center;line-height: 20px;font-weight: 600; text-decoration: none;" href="javascript:;">seller@assetzilla.com</a></li>
                                    
                                    <li style="display: inline-block;margin-right: 0px;"><a style="font-size: 12px;color: #347BBF;text-align: center;line-height: 20px;font-weight: 600; text-decoration: none;" href="javascript:;"> support@assetzilla.com </a></li>
                                </ul>
                                    
                                    <ul style="list-style: none;padding-left: 0;padding-top: 5px;">
                                        <li style="display: inline-block;margin-right: 30px;"><a href="https://www.facebook.com/AssetZilla-102693262614064/?modal=admin_todo_tour"><img src="https://assetzilla-bucket.s3.amazonaws.com/email-template/f-icon.png" alt=""></a></li>
                                        <!--<li style="display: inline-block;margin-right: 30px;">
          <a href="https://www.linkedin.com/company/assetzilla/about/?viewAsMember=true"><img src="https://assetzilla-bucket.s3.amazonaws.com/email-template/lk-icon.png" alt=""></a>
      </li>-->
      <li style="display: inline-block;margin-right: 30px;">
        <a href="https://www.instagram.com/assetzilla/"><img src="https://assetzilla-bucket.s3.amazonaws.com/email-template/instagram_.png" width="26px" alt=""></a>
      </li>
                                        
                                    </ul>
                                </p>
                                </div>
                            </div>
                        </div>
                    </body>
                    </html>`;
          // console.log(resultaa)
          if (newuser.email && process.env.ENV.toLowerCase() === "prod") {
            var mailOptions = {
              from: appconstants.emailFrom,
              to: xyz.email,
              subject: appconstants.subjectForApprovedProperty.user,
              html: userEmailTemplate,
            };
            if (process.env.STAGING === 'false'){
              transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                  console.log("Error sending emails", error);
                } else {
                  console.log("Email sent successfully: " + info.response);
                }
              });
            }
          }
        }
      } else {
        console.log("No Case Id");
      }
    } else {
      console.log("Property Waiting For Approval");
      if (doc.case_id) {
        let newDoc = await CustomerSchema.findOne({
          submitted_property: {
            $elemMatch: {
              case_id_display: doc.case_id,
            },
          },
        });
        newDoc = JSON.parse(JSON.stringify(newDoc));
        if (newDoc && newDoc.submitted_property) {
          let propertyDetails = newDoc.submitted_property;
          console.log("5656", propertyDetails);
          let objIndex = propertyDetails.findIndex(
            (obj) => obj.case_id_display == doc.case_id
          );

          propertyDetails[objIndex].status = "Waiting For Approval";

          let newuser = await CustomerSchema.findOneAndUpdate(
            {
              submitted_property: {
                $elemMatch: {
                  case_id_display: doc.case_id,
                },
              },
            },
            {
              submitted_property: propertyDetails,
            },
            { new: true }
          );
        }
      }
    }

    await Elastic.delete_entity({ match_phrase: { url: req.body.url } });
    data = doc._doc;
    if ("reason" in req.body) {
      var rework = new ReWork();
      rework.entity = "property";
      rework.id = data.id;
      rework.reason = req.body.reason;
      rework.save().then((doc) => console.log(doc));
    }
    if (data.updated) {
      delete data.updated;
    }
    delete data._id;
    data.doc_type = "property";
    data.is_live = req.body.status;
    data.unique = 1;
    data.updatedAt = doc.updatedAt;
    await Elastic.create_entitiy(data)
      .then((resp) => {
        console.log(resp);
        res.status(200).json({
          success: true,
          message: "property Edited",
        });
      })
      .catch((createEntityError) => {
        console.log(createEntityError);
        res.status(200).json({
          success: false,
          message: "Couldn't edit property",
        });
      });
  } catch (tryErr) {
    console.log("Ran into error while updating the status", tryErr);
    res.status(200).json({
      success: false,
      message: "Couldn't edit property",
    });
    console.log(res);
  }
});

router.get("/unseen-schedules", async function (req, res) {
  try {
    let config = await AdminConfigSchema.findOne({});
    let date;
    if (config) {
      date = config.lastSubmittedPropertyAt;
      let newconfig = await config.update({
        lastSubmittedPropertyAt: new Date(),
      });
    } else {
      date = new Date();
      let newconfig2 = await AdminConfigSchema.create({
        lastSubmittedPropertyAt: date,
      });
    }
    let unseenCount = await CustomerSchema.count({
      "submitted_property.submittedOn": { $gt: date },
    });

    console.log("+++++++++++++++++++", unseenCount);

    // res.render("nav.html", unseenCount)
    res.status(200).json({
      success: true,
      message: "Unseen schedules count",
      unseenCount: unseenCount,
    });
  } catch (err) {
    res.status(200).json({
      success: false,
      message: "Couldn't find unseen schedules",
    });
  }
});

router.post("/update_views", async function (req, res) {
  await Property.findOne({ url: req.body.url })
    .then(async (doc_) => {
      await Property.findOneAndUpdate(
        { url: req.body.url },
        { views: doc_ && doc_.views ? doc_.views + 1 : 1 },
        { new: true, timestamps: false },
        async (err, doc) => {
          if (err) {
            res.status(200).json({
              success: false,
              message: "Couldn't update property views",
            });
          } else {
            await Elastic.delete_entity({ match_phrase: { url: req.body.url } })
              .then(async (resp) => {
                data = doc._doc;
                delete data._id;
                data.doc_type = "property";
                data.unique = 1;
                data.updatedAt = doc.updatedAt;
                await Elastic.create_entitiy(data)
                  .then((resp) => {
                    res.status(200).json({
                      success: true,
                      message: "property views updated",
                      views: data.views,
                    });
                  })
                  .catch((updateViewsError) => {
                    console.log(
                      "Error while updating property views in elasticsearch: ",
                      updateViewsError
                    );
                    res.status(200).json({
                      success: false,
                      message: "couldn't update property views",
                    });
                  });
              })
              .catch((updateViewsError) => {
                console.log(
                  "Error while updating property views in elasticsearch: ",
                  updateViewsError
                );
                res.status(200).json({
                  success: false,
                  message: "couldn't update property views",
                });
              });
          }
        }
      ).catch((updateViewsError) => {
        console.log(
          "Error while updating property views in elasticsearch: ",
          updateViewsError
        );
        res.status(200).json({
          success: false,
          message: "couldn't update property views",
        });
      });
    })
    .catch((e) => {
      console.log(e);
    });
});
module.exports = router;
