AlphaId = require("../../classes/alphaId");
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
var ObjectId = require("mongoose").Types.ObjectId;
Images = require("../../classes/images");
Elastic = require("../../classes/elasticsearch");
const Bank = require("../../models/bank.model");
const ReWork = require("../../models/rework.model");
const slugify = require("slugify");
const {slugifyOptions} = require("../../appConstants");

//****Image upload */
const { convertToWebpImageMiddleware } = require("../../middlewares/convertToWebp.middleware");
const {uploadToS3} = require("../../middlewares/uploadToS3.middleware")
const multerS3 = require('multer-s3')
const multer = require("multer");
const aws = require("aws-sdk");

aws.config.update({
  secretAccessKey: "tkklYz7xNRp+plXh1S4wedA8+q94hsY2ZB3BdjE8",
  accessKeyId: "AKIAXLIN4PPU6MFTVKEE",
});
const s3 = new aws.S3();
var only_multer = multer({ dest: "./uploads/" });
const setEntityName = (req,res,next) => {
  let newReqFiles = [];
  req.files.forEach((img)=>{
    img.entity = "bank";
    newReqFiles.push(img)
  })
  req.files = newReqFiles;
  next()
}

var multer_upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "assetzilla-bucket",
    acl: "public-read",
    key: function (req, file, cb) {
      var date = new Date();
      cb(
        null,
        "dyn-res/bank/" +
          "bank_" +
          date.getTime().toString() +  Math.floor(Math.random() * 1000000).toString() +
          "." +
          file.originalname.split(".")[file.originalname.split(".").length - 1]
      );
    },
  }),
});

router.post("/multer",only_multer.array("file"),
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

router.post("/add", function (req, res) {
  let data = req.body;
  let date = new Date();
  let id = AlphaId.encode(date.getTime());
  data.id = id;
  data.is_live = "1";
  data.url = "/banks/" + slugify(data.name, slugifyOptions) + "-" + data.id;
  var bank = new Bank();
  Object.assign(bank, data);
  bank.save().then(
    (doc) => {
      data.doc_type = "bank";
      data.unique = 1;
      data.updated = doc.updated;
      Elastic.create_entitiy(data).then((resp) => {
        res.status(200).json({
          success: true,
          message: "New bank added",
        });
      });
    },
    (e) => {
      console.log("Error occured", e);
      res.status(200).json({
        success: false,
        message: "Couldn't add new bank",
      });
    }
  );
});

// get list of all Banks
router.post("/get", function (req, res) {
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
  if ("filter" in req.body) {
    filter.must.push({ term: { type: req.body.filter } });
  }
  if ("sort" in req.body) {
    var sort = Filters.bank_sort(req.body.sort);
  } else {
    var sort = Filters.bank_sort(undefined);
  }
  Elastic.get_entities(
    query,
    "bank",
    limit,
    [
      "name",
      "logo",
      "id",
      "description",
      "url",
      "status",
      "type",
      "is_live",
      "updated",
      "views",
    ],
    filter,
    skip,
    sort
  ).then((resp) => {
    res.status(200).json({
      success: true,
      message: "Fetched Banks's list",
      results: resp.results,
      total: resp.count,
    });
  });
});

router.post("/get-doc", function (req, res) {
  Bank.findOne({ url: req.body.url }).then((doc) => {
    res.status(200).json({
      success: true,
      data: doc._doc,
    });
  });
});

router.post("/edit", function (req, res) {
  let data = req.body;
  if (data.updated) {
    delete data.updated;
  }
  let _id = data._id;
  data.is_live = "1";
  data.url = "/banks/" + slugify(data.name, slugifyOptions) + "-" + data.id;
  delete data._id;
  Bank.findOneAndUpdate(
    { _id: _id },
    data,
    { new: true, upsert: true },
    (err, doc) => {
      if (err) {
        res.status(200).json({
          success: false,
          message: "Couldn't edit bank",
        });
      } else {
        Elastic.delete_entity({ match_phrase: { url: data.url } }).then(
          (resp) => {
            data.doc_type = "bank";
            data.unique = 1;
            data.updated = doc.updated;
            Elastic.create_entitiy(data).then((resp) => {
              res.status(200).json({
                success: true,
                message: "bank Edited",
              });
            });
          }
        );
      }
    }
  );
});

router.post("/set_status", function (req, res) {
  Bank.findOneAndUpdate(
    { url: req.body.url },
    { is_live: req.body.status },
    { new: true, upsert: true },
    (err, doc) => {
      if (err) {
        res.status(200).json({
          success: false,
          message: "Couldn't edit bank",
        });
      } else {
        Elastic.delete_entity({ match_phrase: { url: req.body.url } }).then(
          (resp) => {
            data = doc._doc;
            if ("reason" in req.body) {
              var rework = new ReWork();
              rework.entity = "bank";
              rework.id = data.id;
              rework.reason = req.body.reason;
              rework.save().then((doc) => {});
            }
            // if (data.updated) {
            //     delete data.updated
            // }
            delete data._id;
            data.doc_type = "bank";
            data.is_live = req.body.status;
            data.unique = 1;
            Elastic.create_entitiy(data).then((resp) => {
              res.status(200).json({
                success: true,
                message: "bank Edited",
              });
            });
          }
        );
      }
    }
  );
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
    var filter = Filters.bank_filters(req.body.query);
  } else {
    var filter = { should: [], must: [] };
  }
  filter.must.push({ term: { is_live: "2" } });
  // if ("sort" in req.body.query) { var sort = Filters.bank_sort(req.body.query.sort[0]) }
  if ("sort" in req.body.query) {
    var sort = Filters.bank_sort(req.body.query.sort[0]);
  } else {
    var sort = Filters.bank_sort(undefined);
  }
  Elastic.get_entities(
    query,
    "bank",
    limit,
    ["name", "url", "logo", "description", "type", "total_projects", "id"],
    filter,
    skip,
    sort
  ).then((resp) => {
    if (resp.results.length > 0) {
      resp.results = Images.logo_img_url_list(resp.results, "Banks");
      // res.render('partials/bank_cards', resp);
      res.render("pages/v1/partials/bank-card", resp);
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
    var filter = Filters.bank_filters(req.body.query);
  } else {
    var filter = { should: [], must: [] };
  }
  filter.must.push({ term: { is_live: "2" } });
  var sort = Filters.bank_sort(req.body.query.sort);
  Elastic.get_entities(
    query,
    "bank",
    limit,
    ["name", "type", "url", "total_projects"],
    filter,
    skip,
    sort
  ).then((resp) => {
    res.status(200).json({
      success: true,
      message: "Fetched Banks list",
      results: resp.results,
      total: resp.count,
    });
  });
});

router.post("/typeahead", function (req, res) {
  filter_ = [{ term: { doc_type: "bank" } }];
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

router.post("/update_views", function (req, res) {
  Bank.findOne({ url: req.body.url })
    .then(async (doc_) => {
      await Bank.findOneAndUpdate(
        { url: req.body.url },
        { views: (doc_ && doc_.views) ? doc_.views + 1 : 1 },
        { new: true, timestamps: false },
        async (err, doc) => {
          if (err) {
            res.status(200).json({
              success: false,
              message: "Couldn't update bank views",
            });
          } else {
            await Elastic.delete_entity({ match_phrase: { url: req.body.url } })
              .then(async (resp) => {
                data = doc._doc;
                delete data._id;
                data.doc_type = "bank";
                data.unique = 1;
                data.updatedAt = doc.updatedAt;
                await Elastic.create_entitiy(data)
                  .then((resp) => {
                    res.status(200).json({
                      success: true,
                      message: "bank views updated",
                      views: data.views,
                    });
                  })
                  .catch((updateViewsError) => {
                    console.log(
                      "Error while updating bank views in elasticsearch: ",
                      updateViewsError
                    );
                    res.status(200).json({
                      success: false,
                      message: "couldn't update bank views",
                    });
                  });
              })
              .catch((updateViewsError) => {
                console.log(
                  "Error while updating bank views in elasticsearch: ",
                  updateViewsError
                );
                res.status(200).json({
                  success: false,
                  message: "couldn't update bank views",
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
