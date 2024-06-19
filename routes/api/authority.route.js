const express = require("express");
const router = express.Router();

const { default: slugify } = require("slugify");
const { slugifyOptions } = require("../../appConstants");
var ObjectId = require("mongoose").Types.ObjectId;
Elastic = require("../../classes/elasticsearch");
Filters = require("../../classes/filters");

const {
  convertToWebpImageMiddleware,
} = require("../../middlewares/convertToWebp.middleware");
const { uploadToS3 } = require("../../middlewares/uploadToS3.middleware");
const multerS3 = require('multer-s3')
const multer = require("multer");
const aws = require("aws-sdk");

aws.config.update({
  secretAccessKey: "tkklYz7xNRp+plXh1S4wedA8+q94hsY2ZB3BdjE8",
  accessKeyId: "AKIAXLIN4PPU6MFTVKEE",
});
const s3 = new aws.S3();

var only_multer = multer({ dest: "./uploads/" });
const setEntityName = (req, res, next) => {
  let newReqFiles = [];
  req.files.forEach((img) => {
    img.entity = "authority";
    newReqFiles.push(img);
  });
  req.files = newReqFiles;
  next();
};

// const {authenticate} = require('../../middlewares/authenticate.middleware');
const {
  changeNumberFormat,
  numberWithCommas,
} = require("../../classes/numberFormatter");

var multer_upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "assetzilla-bucket",
    acl: "public-read",
    key: function (req, file, cb) {
      var date = new Date();
      cb(
        null,
        "dyn-res/authority/" +
          "authority_" +
          date.getTime().toString() +
          Math.floor(Math.random() * 1000000).toString() +
          "." +
          file.originalname.split(".")[file.originalname.split(".").length - 1]
      );
    },
  }),
});
const Authority = require("../../models/authority.model");
const ReWork = require("../../models/rework.model");

router.post(
  "/multer",
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

router.post("/add", function (req, res) {
  let data = req.body;
  // console.log("data authority is", data);
  let date = new Date();
  let id = AlphaId.encode(date.getTime());
  data.id = id;
  data.is_live = "1";
  data.url =
    "/authorities/" + slugify(data.name, slugifyOptions) + "-" + data.id;
  var authority = new Authority();
  Object.assign(authority, data);
  authority.save().then(
    (doc) => {
      data.doc_type = "authority";
      data.unique = 1;
      data.updatedAt = doc.updatedAt;
      // console.log(data);
      data.project_status_count = {};
      data.project_status_count.PreLaunch = null;
      data.project_status_count.UnderConstruction = null;
      data.project_status_count.ReadyToMove = null;
      // console.log(data);
      Elastic.create_entitiy(data).then((resp) => {
        res.status(200).json({
          success: true,
          message: "New authority added",
        });
      });
    },
    (e) => {
      console.log("Error occured", e);
      res.status(200).json({
        success: false,
        message: "Couldn't add new authority",
      });
    }
  );
});

router.post("/get", async function (req, res) {
  if ("limit" in req.body) {
    var limit = req.body.limit;
  } else {
    var limit = 10;
  }
  // console.log(req);
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
  if ("location" in req.body.filter) {
    var filter = Filters.authority_filters(req.body.filter.location);
  }
  if ("status" in req.body.filter) {
    if (!filter) {
      var filter = { should: [], must: [] };
    }
    filter.must.push({ term: { is_live: req.body.filter.status } });
  }
  if ("sort" in req.body) {
    var sort = Filters.authority_sort(req.body.sort);
    // console.log("3434", sort);
  }
  //code for location wise access
  if ("user" in req.body) {
    const { getUserLocationLevelAccessInfo } = require("./__helper");
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
  }
  console.log("Filters : ", filter);
  Elastic.get_entities(
    query,
    "authority",
    limit,
    [
      "url",
      "logo",
      "name",
      "total_projects",
      "district",
      "state",
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
      message: "Fetched Authority's list",
      results: resp.results,
      total: resp.count,
    });
  });
});

router.post("/get-doc", function (req, res) {
  Authority.findOne({ url: req.body.url }).then((doc) => {
    res.status(200).json({
      success: true,
      data: doc._doc,
    });
  });
});

router.post("/edit",async function (req, res) {
  let data = req.body;
  if (data.updated) {
    delete data.updated;
  }
  let _id = data._id;
  data.is_live = "1";
  // data.url = "/authorities/" + slugify(data.name, slugifyOptions) + "-" + data.id;
  delete data._id;

  if(data.new_logo){
    data.logo = data.new_logo;
  }

  try{
    let doc = await Authority.findOneAndUpdate({ _id: _id }, data, { new: true, upsert: true });
    if(doc){
      let resp = await Elastic.delete_entity({ match_phrase: { url: data.url } });
      if(resp){
        // console.log(resp);
        if (resp.success) {
          data.doc_type = "authority";
          data.unique = 1;
          data.updatedAt = doc.updatedAt;
          if (typeof data.project_status_count.PreLaunch === "object") {
            data.project_status_count.PreLaunch = null;
            // console.log("done")
          }
          if (
            typeof data.project_status_count.UnderConstruction === "object"
          ) {
            data.project_status_count.UnderConstruction = null;
          }
          if (typeof data.project_status_count.ReadyToMove === "object") {
            data.project_status_count.ReadyToMove = null;
          }

          let response = await Elastic.create_entitiy(data)
          if (response){
            res.status(200).json({
              success: true,
              message: "Authority Edited",
            });
          }
        } else {
          console.log(
            "Error occurred while deleting ... skipping new creation"
          );
          res.status(200).json({
            success: true,
            message:
              "Authority updated in database but not in elasticsearch",
          });
        }
      }
    }
  } catch(err){
    res.status(200).json({
      success: false,
      message: "Couldn't edit Authority",
    });
  }
});

router.post("/infinite", function (req, res) {
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
    var filter = Filters.authority_filters(req.body.query);
  } else {
    var filter = { should: [], must: [] };
  }
  filter.must.push({ term: { is_live: "2" } });
  // if ("sort" in req.body.query) { var sort = Filters.authority_sort(req.body.query.sort[0]) }
  if ("sort" in req.body.query) {
    var sort = Filters.authority_sort(req.body.query.sort[0]);
  } else {
    var sort = Filters.authority_sort(undefined);
  }
  Elastic.get_entities(
    query,
    "authority",
    limit,
    [
      "name",
      "url",
      "project_status_count",
      "phone",
      "email",
      "address",
      "district",
      "total_projects",
      "price",
      "logo",
      "id",
    ],
    filter,
    skip,
    sort
  ).then((resp) => {
    if (resp.results.length > 0) {
      resp.results = Images.logo_img_url_list(resp.results, "Authorities");
      // res.render('partials/authority_cards', resp);
      resp.changeNumberFormat = changeNumberFormat;
      res.render("pages/v1/partials/authority-cards", resp);
    } else {
      res.send("");
    }
  });
});

router.post("/table-pagination", function (req, res) {
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
    var filter = Filters.authority_filters(req.body.query);
  } else {
    var filter = { should: [], must: [] };
  }
  if ("sort" in req.body.query) {
    var sort = Filters.authority_sort(req.body.query.sort[0]);
  }
  filter.must.push({ term: { is_live: "2" } });
  // sort = [{ "total_projects": { "order": "desc" } }]
  Elastic.get_entities(
    query,
    "authority",
    limit,
    [
      "name",
      "total_projects",
      "district",
      "state",
      "url",
      "price",
      "project_status_count",
    ],
    filter,
    skip,
    sort
  ).then((resp) => {
    res.status(200).json({
      success: true,
      message: "Fetched Authorities list",
      results: resp.results,
      total: resp.count,
    });
  });
});

router.post("/typeahead", function (req, res) {
  filter_ = [{ term: { doc_type: "authority" } }];
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

router.post("/custom-typeahead", function (req, res) {
  var filter_ = [
    { term: { doc_type: "location" } },
    {
      bool: {
        should: [
          { term: { location_type: "state" } },
          { term: { location_type: "district" } },
        ],
      },
    },
  ];
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
  Authority.findOneAndUpdate(
    { url: req.body.url },
    { is_live: req.body.status },
    { new: true, upsert: true },
    (err, doc) => {
      if (err) {
        res.status(200).json({
          success: false,
          message: "Couldn't edit authority",
        });
      } else {
        Elastic.delete_entity({ match_phrase: { url: req.body.url } }).then(
          (resp) => {
            data = doc._doc;
            if ("reason" in req.body) {
              var rework = new ReWork();
              rework.entity = "authority";
              rework.id = data.id;
              rework.reason = req.body.reason;
              rework.save().then((doc) => {});
            }
            if (data.updated) {
              delete data.updated;
            }
            delete data._id;
            data.doc_type = "authority";
            data.is_live = req.body.status;
            data.unique = 1;
            data.updatedAt = doc.updatedAt;
            if (data.project_status_count && data.project_status_count.PreLaunch && typeof data.project_status_count.PreLaunch === "object") {
              data.project_status_count.PreLaunch = null;
              // console.log("done")
            }
            if (data.project_status_count && data.project_status_count.UnderConstruction && 
              typeof data.project_status_count.UnderConstruction ===
              "object"
            ) {
              data.project_status_count.UnderConstruction = null;
            }
            if (data.project_status_count && data.project_status_count.ReadyToMove && typeof data.project_status_count.ReadyToMove === "object") {
              data.project_status_count.ReadyToMove = null;
            }
            Elastic.create_entitiy(data).then((resp) => {
              res.status(200).json({
                success: true,
                message: "authority Edited",
              });
            });
          }
        );
      }
    }
  );
});

router.post("/update_views", function (req, res) {
  Authority.findOne({ url: req.body.url })
    .then(async (doc_) => {
      await Authority.findOneAndUpdate(
        { url: req.body.url },
        { views: doc_ && doc_.views ? doc_.views + 1 : 1 },
        { new: true, timestamps: false },
        async (err, doc) => {
          if (err) {
            res.status(200).json({
              success: false,
              message: "Couldn't update authority views",
            });
          } else {
            await Elastic.delete_entity({ match_phrase: { url: req.body.url } })
              .then(async (resp) => {
                data = doc._doc;
                delete data._id;
                data.doc_type = "authority";
                data.unique = 1;
                data.updatedAt = doc.updatedAt;
                if (typeof data.project_status_count.PreLaunch === "object") {
                  data.project_status_count.PreLaunch = null;
                  // console.log("done")
                }
                if (
                  typeof data.project_status_count.UnderConstruction ===
                  "object"
                ) {
                  data.project_status_count.UnderConstruction = null;
                }
                if (typeof data.project_status_count.ReadyToMove === "object") {
                  data.project_status_count.ReadyToMove = null;
                }
                // console.log(data);
                await Elastic.create_entitiy(data)
                  .then((resp) => {
                    res.status(200).json({
                      success: true,
                      message: "authority views updated",
                    });
                  })
                  .catch((updateViewsError) => {
                    console.log(
                      "Error while updating authority views: ",
                      updateViewsError
                    );
                    res.status(200).json({
                      success: false,
                      message: "couldn't update authority views",
                    });
                  });
              })
              .catch((updateViewsError) => {
                console.log(
                  "Error while updating authority views: ",
                  updateViewsError
                );
                res.status(200).json({
                  success: false,
                  message: "couldn't update authority views",
                });
              });
          }
        }
      );
    })
    .catch((e) => {
      console.log(e);
    });
});
module.exports = router;
