require("dotenv").config();
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
var ObjectId = require("mongoose").Types.ObjectId;
Images = require("../../classes/images");
Filters = require("../../classes/filters");
const { getEmiPerLac } = require("./__helper");
// const {authenticate} = require('../../middlewares/authenticate.middleware');
const {
  changeNumberFormat,
  numberWithCommas,
} = require("../../classes/numberFormatter");
const { is_bookmarked_list } = require("../../classes/bookmark");
const multerS3 = require('multer-s3')
const multer = require("multer");
const aws = require("aws-sdk");

aws.config.update({
  secretAccessKey: "tkklYz7xNRp+plXh1S4wedA8+q94hsY2ZB3BdjE8",
  accessKeyId: "AKIAXLIN4PPU6MFTVKEE",
});
const s3 = new aws.S3();
var multer_upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "assetzilla-bucket",
    acl: "public-read",
    key: function (req, file, cb) {
      var date = new Date();
      cb(
        null,
        "dyn-res/project/image/" +
          "project_" +
          date.getTime().toString() + Math.floor(Math.random() * 1000000).toString() +
          "." +
          file.originalname.split(".")[file.originalname.split(".").length - 1]
      );
    },
  }),
});
var multer_upload_doc = multer({
  storage: multerS3({
    s3: s3,
    bucket: "assetzilla-bucket",
    acl: "public-read",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      console.log("Uploadin new file", file);
      var date = new Date();
      cb(
        null,
        "dyn-res/project/doc/" +
          "project_" +
          date.getTime().toString() + Math.floor(Math.random() * 1000000).toString() +
          "." +
          file.originalname.split(".")[file.originalname.split(".").length - 1]
      );
    },
  }),
});

const Authority = require("../../models/authority.model");

const Bank = require("../../models/bank.model");
const Builder = require("../../models/builder.model");

const Tag = require("../../models/tags.model");
const City = require("../../models/city.model");
const Subcity = require("../../models/subcity.model");
const State = require("../../models/state.model");
const District = require("../../models/district.model");
const Boundary = require("../../models/boundary.model");
const Project = require("../../models/project.model");
const Property = require("../../models/property.model");
const ReWork = require("../../models/rework.model");
const Article = require("../../models/article.model");
const Buyer = require("../../models/buyer.model");

const { asyncForEach } = require("../utils");
const { default: slugify } = require("slugify");
const {slugifyOptions} = require("../../appConstants");

//****Image upload */
const { convertToWebpImageMiddleware } = require("../../middlewares/convertToWebp.middleware");
const {uploadToS3} = require("../../middlewares/uploadToS3.middleware")
var only_multer = multer({ dest: "./uploads/" });
const setEntityName = (req,res,next) => {
  let newReqFiles = [];
  req.files.forEach((img)=>{
    img.entity = "project";
    newReqFiles.push(img)
  })
  req.files = newReqFiles;
  next()
}

router.post("/get", async function (req, res) {
  console.log("project /get req.body", req.body);
  if ("limit" in req.body) {
    var limit = req.body.limit;
  } else {
    var limit = 10;
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
  if ("sort" in req.body) {
    var sort = Filters.project_sort(req.body.sort);
    console.log("Sort Project", sort);
  } else {
    var sort = Filters.project_sort("newest");
    console.log("Sort Project", sort);
  }
  if (Object.keys(req.body.filter).length > 0) {
    var filter = await Filters.project_filters(req.body.filter);
  } else {
    var filter = { should: [], must: [] };
  }
  if ("status" in req.body) {
    filter.must.push({ term: { is_live: req.body.status } });
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
    "project",
    limit,
    [
      "url",
      "builder",
      "authority",
      "name",
      "subcity",
      "city",
      "property_type",
      "is_live",
      "id",
      "updatedAt",
      "views",
    ],
    filter,
    skip,
    sort
  ).then((resp) => {
    res.status(200).json({
      success: true,
      message: "Fetched Projects's list",
      results: resp.results,
      total: resp.count,
    });
  });
});

router.get("/document", function (req, res) {
  let { url } = req.query;
  if (!url) {
    res.status(200).json({
      success: false,
      message: "Missing Parameters.",
    });
  } else {
    var params = {
      Bucket: "assetzilla-bucket",
      Key: url,
    };
    s3.getObject(params, function (err, data) {
      if (err) {
        res.status(200).json({
          success: false,
          message: err.message || "Something went wrong.",
        });
      } else {
        res.setHeader("Content-disposition", `attachment;`);
        res.set("Content-Type", data.ContentType);
        res.send(data.Body);
      }
    });
  }
});

router.post("/get-one", function (req, res) {
  let query = "";
  if (req.body && req.body.data) {
    Elastic.get_entities(
      query,
      "project",
      1,
      [
        "builder",
        "url",
        "authority",
        "area",
        "name",
        "subcity",
        "city",
        "district",
        "state",
        "address",
        "pincode",
        "details",
        "project_status",
        "expected_completion",
        "floor",
        "floors",
        "images",
        "floor_plan",
        "property_type",
        "details",
        "site_plan",
        "brochure",
        "price_list",
        "specification",
        "other_document",
        "location",
        "total_floors",
      ],
      { should: [], must: [{ match_phrase: { url: req.body.data } }] }
    ).then((resp) => {
      res.status(200).json({
        success: true,
        message: "Fetched Projects's list",
        results: resp.results,
        total: resp.count,
      });
    });
  }
});

router.post("/infinite", async function (req, res) {
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
    var filter = await Filters.project_filters(req.body.query);
  } else {
    var filter = { should: [], must: [] };
  }
  filter.must.push({ term: { is_live: "2" } });
  if ("sort" in req.body.query && req.body.query.sort.length > 0) {
    var sort = Filters.project_sort(req.body.query.sort[0]);
  } else {
    var sort = Filters.project_sort(undefined);
  }
  Elastic.get_entities(
    query,
    "project",
    limit,
    [
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
    ],
    filter,
    skip,
    sort
  ).then(async (resp) => {
    if (resp.results.length > 0) {
      resp.results = Images.banner_img_url_list(resp.results);
      resp.results = Images.get_image_url_list(resp.results);
      resp.results = is_bookmarked_list(resp.results, req);

      if ("partial" in req.body) {
        resp.partial = req.body.partial;
      } else {
        resp.partial = true;
      }
      if ("card" in req.body) {
        resp.card = req.body.card;
      } else {
        resp.card = true;
      }
      if ("from_individual_entity" in req.body) {
        resp.to_individual_entity = true;
      } else {
        resp.to_individual_entity = false;
      }
      resp.custSkip = skip * 12;
      // res.render('partials/project_cards', resp);
      resp.changeNumberFormat = changeNumberFormat;
      let emi_per_lac = await getEmiPerLac();
      if (emi_per_lac.success){
        resp.emi_per_lac = emi_per_lac.emi_per_lac;
      } else {
        resp.emi_per_lac = 0;
      }
      // console.log("resp.results[1]", resp.results[0]);
      res.render("pages/v1/partials/project-card", resp);
    } else {
      res.send("");
    }
  });
});

router.post("/infinite/v1", async function (req, res) {
  req.body.query = JSON.parse(req.body.query);
  console.log("req.body.query", req.body.query);
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
    var filter = await Filters.project_filters(req.body.query);
  } else {
    var filter = { should: [], must: [] };
  }
  filter.must.push({ term: { is_live: "2" } });
  if ("sort" in req.body.query && req.body.query.sort.length > 0) {
    var sort = Filters.project_sort(req.body.query.sort[0]);
  } else {
    var sort = Filters.project_sort(undefined);
  }
  Elastic.get_entities(
    query,
    "project",
    limit,
    [
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
    ],
    filter,
    skip,
    sort
  ).then((resp) => {
    if (resp.results.length > 0) {
      resp.results = Images.banner_img_url_list(resp.results);
      resp.results = Images.get_image_url_list(resp.results);
      resp.results = is_bookmarked_list(resp.results, req);

      if ("partial" in req.body) {
        resp.partial = req.body.partial;
      } else {
        resp.partial = true;
      }
      if ("card" in req.body) {
        resp.card = req.body.card;
      } else {
        resp.card = true;
      }
      resp.custSkip = skip * 12;
      res.render("partials/project_cards", resp);
      // resp.changeNumberFormat = changeNumberFormat
      // res.render('pages/v1/partials/project-card', resp);
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
    var filter = await Filters.project_filters(req.body.query);
  } else {
    var filter = { should: [], must: [] };
  }
  filter.must.push({ term: { is_live: "2" } });
  if ("sort" in req.body.query && req.body.query.sort.length > 0) {
    var sort = Filters.project_sort(req.body.query.sort[0]);
  } else {
    var sort = Filters.project_sort(undefined);
  }

  Elastic.get_entities(
    query,
    "project",
    limit,
    ["location.location", "name", "url", "property_type", "id"],
    filter,
    skip,
    sort
  ).then((resp) => {
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

router.post("/table-pagination",async function (req, res) {
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
    var filter = await Filters.project_filters(req.body.query);
  } else {
    var filter = { should: [], must: [] };
  }
  filter.must.push({ term: { is_live: "2" } });
  if ("sort" in req.body.query && req.body.query.sort.length > 0) {
    var sort = Filters.project_sort(req.body.query.sort[0]);
  }
  Elastic.get_entities(
    query,
    "project",
    limit,
    [
      "name",
      "property_type",
      "city",
      "subcity",
      "bhk_space",
      "url",
      "project_status",
      "price",
      "area",
      "sq_fit_cost",
      "total_properties",
    ],
    filter,
    skip,
    sort
  ).then((resp) => {
    res.status(200).json({
      success: true,
      message: "Fetched Projects list",
      results: resp.results,
      total: resp.count,
    });
  });
});

router.post("/multer", only_multer.array("file"),
convertToWebpImageMiddleware,
setEntityName,
uploadToS3, function (req, res) {
  let data = [];
  req.files.forEach((element) => {
    data.push(element.key.split("/").pop());
  });
  res.status(200).json({
    success: true,
    results: data,
  });
});

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
  "/multer_doc",
  multer_upload_doc.array("file"),
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
router.post("/get-doc", function (req, res) {
  Project.findOne({ url: req.body.url }).then((doc) => {
    res.status(200).json({
      success: true,
      data: doc._doc,
    });
  });
});
router.post("/add", function (req, res) {
  let data = req.body;

  if (data && data.road_width && data.road_width.width) {
    data.road_width.width = Number(data.road_width.width);
  }

  let date = new Date();
  let id = AlphaId.encode(date.getTime());
  data.id = id;
  data.is_live = "1";
  data.url = "/projects/" + slugify(data.name, slugifyOptions) + "-" + data.id;
  console.log(data.url)
  var project = new Project();
  Object.assign(project, data);
  project.save().then(
    (doc) => {
      data.doc_type = "project";
      data.unique = 1;
      data.updatedAt = doc.updatedAt;
      Elastic.create_entitiy(data).then((resp) => {
        res.status(200).json({
          success: true,
          message: "New project added",
        });
      });
    },
    (e) => {
      // console.log("Error: ", e);
      res.status(200).json({
        success: false,
        message: "Couldn't add new project",
      });
    }
  );
});

router.post("/typeahead", function (req, res) {
  filter_ = [{ term: { doc_type: "project" } }];
  var status = "2";
  if ("status" in req.body) {
    if (req.body.status != "0") {
      filter_.push({ term: { is_live: req.body.status } });
    }
  } else {
    filter_.push({ term: { is_live: status } });
  }
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

router.post("/set_status", function (req, res) {
  Project.findOneAndUpdate(
    { url: req.body.url },
    { is_live: req.body.status },
    { new: true, upsert: true },
    (err, doc) => {
      if (err) {
        res.status(200).json({
          success: false,
          message: "Couldn't edit project",
        });
      } else {
        Elastic.delete_entity({ match_phrase: { url: req.body.url } }).then(
          (resp) => {
            data = doc._doc;
            if ("reason" in req.body) {
              var rework = new ReWork();
              rework.entity = "project";
              rework.id = data.id;
              rework.reason = req.body.reason;
              rework.save().then((doc) => {});
            }
            if (data.updated) {
              delete data.updated;
            }
            delete data._id;
            data.doc_type = "project";
            data.is_live = req.body.status;
            data.unique = 1;
            data.updatedAt = doc.updatedAt;
            Elastic.create_entitiy(data).then((resp) => {
              res.status(200).json({
                success: true,
                message: "project Edited",
              });
            });
          }
        );
      }
    }
  );
});

router.post("/edit", function (req, res) {
  let data = req.body;
  if (data.updated) {
    delete data.updated;
  }
  let _id = data._id;
  data.is_live = "1";
  delete data._id;
  data.url = "/projects/" + slugify(data.name, slugifyOptions) + "-" + data.id;
  console.log(data.url)
  console.log(slugifyOptions)
  Project.findOneAndUpdate(
    { _id: _id },
    data,
    { new: true, upsert: true },
    (err, doc) => {
      if (err) {
        res.status(200).json({
          success: false,
          message: "Couldn't edit Project",
        });
      } else {
        Elastic.delete_entity({ match_phrase: { url: data.url } }).then(
          (resp) => {
            data.doc_type = "project";
            data.unique = 1;
            data.updatedAt = doc.updatedAt;
            Elastic.create_entitiy(data).then((resp) => {
              res.status(200).json({
                success: true,
                message: "Project Edited",
              });
            });
          }
        );
      }
    }
  );
});

// router.post("/not_authority", async function (req, res) {
//     try {
//         let projectData = await Project.findOneAndUpdate({ "url": "/projects/antriksh-the-golf-address-villa-hgfV7X1" }, {
//             "price.min": 500000
//         }, { "new": true })

//         var clonedObj = { ...projectData };
//         delete clonedObj._doc._id
//         await Elastic.delete_entity_promise({ match_phrase: { url: clonedObj._doc.url } });

//         clonedObj._doc.doc_type = "project"
//         clonedObj._doc.unique = 1;
//         await Elastic.create_entitiy_promise(clonedObj._doc);

//         let propDocs = await Property.find({ url: { $in: ["/properties/3-bhk-in-mahagun-maestro-gQQwrJ2", "/properties/5-bhk-in-antriksh-the-golf-address-villa-EDD0wW2"] }})

//         await asyncForEach(propDocs, async (property) => {

//             let data = await Property.findOneAndUpdate({
//               _id: property._id
//             },{"price.price":500000},{"new":true})

//             var clonedObj = { ...data };
//             delete clonedObj._doc._id
//             await Elastic.delete_entity_promise({ match_phrase: { url: clonedObj._doc.url } });

//             clonedObj._doc.doc_type = "property"
//             clonedObj._doc.unique = 1;
//             await Elastic.create_entitiy_promise(clonedObj._doc);

//             console.log("updated Property", property.name);

//           })
//         res.status(200).json({
//             success: true,
//             message: "Project Edited",
//             data: projectData
//         });

//     } catch (err) {
//         console.log("err", err)
//     }

// })

// router.get("/deleteAllData", async function (req, res) {
//   try {
//     let db = mongoose.connection.db;
//     let result = await db.dropDatabase();

//     console.log(result);

//     let elasticData = await elastic_client.indices.delete({
//       index: req.query.index,
//     });
//     console.log(elasticData);
//     res.status(200).json({
//       success: true,
//       message: "Data Deleted",
//     });
//   } catch (err) {
//     console.log("err", err);
//     res.status(400).json({
//       err: err,
//     });
//   }
// });

router.post("/update_views", async function (req, res) {
  await Project.findOne({ url: req.body.url })
    .then(async (doc_) => {
      await Project.findOneAndUpdate(
        { url: req.body.url },
        { views: (doc_ && doc_.views) ? doc_.views + 1 : 1 },
        { new: true, timestamps: false },
        async (err, doc) => {
          if (err) {
            res.status(200).json({
              success: false,
              message: "Couldn't update project views",
            });
          } else {
            await Elastic.delete_entity({
              match_phrase: { url: req.body.url },
            }).then(async (resp) => {
              data = doc._doc;
              delete data._id;
              data.doc_type = "project";
              data.unique = 1;
              data.updatedAt = doc.updatedAt;
              await Elastic.create_entitiy(data)
                .then(async (resp) => {
                  res.status(200).json({
                    success: true,
                    message: "project views updated",
                    views: data.views,
                  });
                })
                .catch((updateViewsError) => {
                  console.log(
                    "Error while updating project views in elasticsearch: ",
                    updateViewsError
                  );
                  res.status(200).json({
                    success: false,
                    message: "couldn't update project views",
                  });
                });
            }).catch((err)=>{
              console.log("Error while updating views in project: ", err)
              res.status(200).json({
                success: false,
                message: "Couldn't update project views",
              });
            });
          }
        }
      ).catch((updateViewsError) => {
        console.log(
          "Error while updating project views in elasticsearch: ",
          updateViewsError
        );
        res.status(200).json({
          success: false,
          message: "couldn't update project views",
        });
    });
    })
    .catch((e) => {
      console.log(e);
    });
});

module.exports = router;
