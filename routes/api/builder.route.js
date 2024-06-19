const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
var ObjectId = require("mongoose").Types.ObjectId;
Images = require("../../classes/images");
// const {authenticate} = require('../../middlewares/authenticate.middleware');
const Elastic = require("../../classes/elasticsearch");
const Builder = require("../../models/builder.model");
const ReWork = require("../../models/rework.model");
const Filters = require("../../classes/filters");
const slugify = require("slugify");
const multerS3 = require('multer-s3')
const multer = require("multer");
const aws = require("aws-sdk");

aws.config.update({
  secretAccessKey: "tkklYz7xNRp+plXh1S4wedA8+q94hsY2ZB3BdjE8",
  accessKeyId: "AKIAXLIN4PPU6MFTVKEE",
});
const s3 = new aws.S3();
const {slugifyOptions} = require("../../appConstants");


//****Image upload */
const { convertToWebpImageMiddleware } = require("../../middlewares/convertToWebp.middleware");
const {uploadToS3} = require("../../middlewares/uploadToS3.middleware")
var only_multer = multer({ dest: "./uploads/" });
const setEntityName = (req,res,next) => {
  let newReqFiles = [];
  req.files.forEach((img)=>{
    img.entity = "builder";
    newReqFiles.push(img)
  })
  req.files = newReqFiles;
  next()
}

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
        "dyn-res/builder/" +
          "builder_" +
          date.getTime().toString() + Math.floor(Math.random() * 1000000).toString() +
          "." +
          file.originalname.split(".")[file.originalname.split(".").length - 1]
      );
    },
  }),
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

router.post("/set_status", function (req, res) {
  Builder.findOneAndUpdate(
    { url: req.body.url },
    { is_live: req.body.status },
    { new: true, upsert: true },
    (err, doc) => {
      if (err) {
        res.status(200).json({
          success: false,
          message: "Couldn't edit builder",
          error: err,
        });
      } else {
        Elastic.delete_entity({ match_phrase: { url: req.body.url } }).then(
          (resp) => {
            data = doc._doc;
            if ("reason" in req.body) {
              var rework = new ReWork();
              rework.entity = "builder";
              rework.id = data.id;
              rework.reason = req.body.reason;
              rework.save().then((doc) => {});
            }
            if (data.updated) {
              delete data.updated;
            }
            delete data._id;
            data.doc_type = "builder";
            data.is_live = req.body.status;
            data.unique = 1;
            data.updatedAt = doc.updatedAt;
            Elastic.create_entitiy(data).then((resp) => {
              res.status(200).json({
                success: true,
                message: "builder Edited",
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
  data.url = "/builders/" + slugify(data.name, slugifyOptions) + "-" + data.id;
  delete data._id;
  Builder.findOneAndUpdate(
    { _id: _id },
    data,
    { new: true, upsert: true },
    (err, doc) => {
      if (err) {
        res.status(200).json({
          success: false,
          message: "Couldn't edit builder",
          error: err,
        });
      } else {
        Elastic.delete_entity({ match_phrase: { url: data.url } }).then(
          (resp) => {
            data.doc_type = "builder";
            data.unique = 1;
            data.updatedAt = doc.updatedAt;
            Elastic.create_entitiy(data).then((resp) => {
              res.status(200).json({
                success: true,
                message: "builder Edited",
              });
            });
          }
        );
      }
    }
  );
});
router.post("/get-doc", function (req, res) {
  console.log(req.body);
  Builder.findOne({ url: req.body.url }).then((doc) => {
    res.status(200).json({
      success: true,
      data: doc._doc,
    });
  });
});
router.post("/add", function (req, res) {
  let data = req.body;
  let date = new Date();
  let id = AlphaId.encode(date.getTime());
  data.id = id;
  data.is_live = "1";
  data.url = "/builders/" + slugify(data.name, slugifyOptions) + "-" + data.id;
  var builder = new Builder();
  Object.assign(builder, data);
  builder.save().then(
    (doc) => {
      data.doc_type = "builder";
      data.unique = 1;
      data.updatedAt = doc.updatedAt;
      Elastic.create_entitiy(data).then((resp) => {
        res.status(200).json({
          success: true,
          message: "New builder added",
        });
      });
    },
    (e) => {
      console.log("Error occured", e);
      res.status(200).json({
        success: false,
        message: "Couldn't add new builder",
      });
    }
  );
});

// get list of all Builder
router.post("/get", async function (req, res) {
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
  if ("status" in req.body) {
    var filter = { should: [], must: [{ term: { is_live: req.body.status } }] };
  } else {
    var filter = { should: [], must: [] };
  }
  if ("sort" in req.body) {
    var sort = Filters.builder_sort(req.body.sort);
  } else {
    var sort = Filters.builder_sort("newest");
    consol.log("Sorting Builders by ", sort);
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
  // console.log(sort, "<++++++++++++++++++++++++");
  Elastic.get_entities(
    query,
    "builder",
    limit,
    [
      "url",
      "logo",
      "name",
      "id",
      "local_presence",
      "total_projects",
      "is_live",
      "updatedAt",
      "views",
    ],
    filter,
    skip,
    sort
  ).then((resp) => {
    res.status(200).json({
      success: true,
      message: "Fetched Builder's list",
      results: resp.results,
      total: resp.count,
    });
    // console.log("results\n", resp);
    // console.table(resp.results);
  });
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
    var filter = Filters.builder_filters(req.body.query);
  } else {
    var filter = { should: [], must: [] };
  }
  filter.must.push({ term: { is_live: "2" } });
  // if ("sort" in req.body.query) { var sort = Filters.builder_sort(req.body.query.sort[0]) }
  if ("sort" in req.body.query) {
    var sort = Filters.builder_sort(req.body.query.sort[0]);
  } else {
    var sort = Filters.builder_sort(""); //defaults to sort by total projects
    console.log("Sorting Builders by ", sort);
  }
  Elastic.get_entities(
    query,
    "builder",
    limit,
    [
      "name",
      "url",
      "subcity",
      "city",
      "logo",
      "phone",
      "email",
      "address",
      "local_presence",
      "total_projects",
      "project_status_count",
      "price",
      "id",
    ],
    filter,
    skip,
    sort
  ).then((resp) => {
    if (resp.results.length > 0) {
      resp.results = Images.logo_img_url_list(resp.results, "Builders");
      // res.render('partials/builder_cards', resp);
      resp.changeNumberFormat = changeNumberFormat;
      res.render("pages/v1/partials/builder-card", resp);
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
    var filter = Filters.builder_filters(req.body.query);
  } else {
    var filter = { should: [], must: [] };
  }
  filter.must.push({ term: { is_live: "2" } });
  if ("sort" in req.body.query) {
    var sort = Filters.builder_sort(req.body.query.sort[0]);
  }
  Elastic.get_entities(
    query,
    "builder",
    limit,
    [
      "name",
      "total_projects",
      "url",
      "subcity",
      "state",
      "city",
      "local_presence",
      "total_projects",
      "project_status_count",
      "price",
    ],
    filter,
    skip,
    sort
  ).then((resp) => {
    res.status(200).json({
      success: true,
      message: "Fetched Builder's list",
      results: resp.results,
      total: resp.count,
    });
  });
});

router.post("/typeahead", function (req, res) {
  filter_ = [{ term: { doc_type: "builder" } }];
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
router.post("/update_views", async function (req, res) {
  await Builder.findOne({ url: req.body.url })
    .then(async (doc_) => {
      await Builder.findOneAndUpdate(
        { url: req.body.url },
        { views: (doc_ && doc_.views) ? doc_.views + 1 : 1 },
        { new: true, timestamps: false },
        async (err, doc) => {
          if (err) {
            res.status(200).json({
              success: false,
              message: "Couldn't update builder views",
            });
          } else {
            await Elastic.delete_entity({ match_phrase: { url: req.body.url } })
              .then(async (resp) => {
                data = doc._doc;
                delete data._id;
                data.doc_type = "builder";
                data.unique = 1;
                data.updatedAt = doc.updatedAt;
                await Elastic.create_entitiy(data)
                  .then((resp) => {
                    res.status(200).json({
                      success: true,
                      message: "builder views updated",
                      views: data.views,
                    });
                  })
                  .catch((updateViewsError) => {
                    console.log(
                      "Error while updating builder views in elasticsearch: ",
                      updateViewsError
                    );
                    res.status(200).json({
                      success: false,
                      message: "couldn't update builder views",
                    });
                  });
              })
              .catch((updateViewsError) => {
                console.log(
                  "Error while updating builder views in elasticsearch: ",
                  updateViewsError
                );
                res.status(200).json({
                  success: false,
                  message: "couldn't update builder views",
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
