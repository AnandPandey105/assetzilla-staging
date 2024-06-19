const express = require("express");
const router = express.Router();
AlphaId = require("../../classes/alphaId");
Elastic = require("../../classes/elasticsearch");
const { groupArray } = require("../../utilities/groupArray");
// const {authenticate} = require('../../middlewares/authenticate.middleware');
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
        "dyn-res/subcity/" +
          "subcity_" +
          date.getTime().toString() +
          Math.floor(Math.random() * 1000000).toString() +
          "." +
          file.originalname.split(".")[file.originalname.split(".").length - 1]
      );
    },
  }),
});

const Subcity = require("../../models/subcity.model");
const ReWork = require("../../models/rework.model");
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
    img.entity = "subcity";
    newReqFiles.push(img);
  });
  req.files = newReqFiles;
  next();
};

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
router.post("/typeahead", function (req, res) {
  filter_ = [
    { term: { doc_type: "location" } },
    { term: { location_type: "subcity" } },
    { term: { is_live: "2" } },
  ];
  if ("state" in req.body) {
    filter_.push({ match: { state: req.body.state } });
  }
  if ("district" in req.body) {
    filter_.push({ match: { district: req.body.district } });
  }
  if ("city" in req.body) {
    filter_.push({ match: { city: req.body.city } });
  }
  results = Elastic.query_typeahead(req.body.data, filter_);
  results.then((data) => {
    if (results) {
      console.log("req.body", req.body);
      if (req.body.city === "New Delhi") {
        data.push(
          {
            name: "West Delhi",
            doc_type: "location",
            location_type: "subcity",
            url: "/locations/West-Delhi-subcity-2",
          },
          {
            name: "Central Delhi",
            url: "/locations/Central-Delhi-subcity-34",
            doc_type: "location",
            location_type: "subcity",
          },
          {
            name: "East Delhi",
            url: "/locations/East-Delhi-subcity-1",
            doc_type: "location",
            location_type: "subcity",
          },
          {
            name: "South Delhi",
            url: "/locations/South-Delhi-subcity-4",
            doc_type: "location",
            location_type: "subcity",
          },
          {
            name: "North Delhi",
            url: "/locations/North-Delhi-subcity-3",
            doc_type: "location",
            location_type: "subcity",
          }
        );
      }
      if (req.body.city === "Mumbai") {
        data.push(
          {
            name: "Mumbai Western Suburbs",
            doc_type: "location",
            location_type: "subcity",
            url: "/locations/Mumbai Western Suburbs-subcity-osKiHI2",
          },
          {
            name: "Mumbai Eastern Suburbs",
            url: "/locations/Mumbai Eastern Suburbs-subcity-Ef0qII2",
            doc_type: "location",
            location_type: "subcity",
          },
          {
            name: "South Bombay",
            url: "/locations/South Bombay-subcity-OMLIrJ2",
            doc_type: "location",
            location_type: "subcity",
          }
        );
      }
      data = [...new Map(data.map((item) => [item["name"], item])).values()];
      console.log("looking into it", data);
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
          { term: { location_type: "city" } },
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

router.post("/get-doc", function (req, res) {
  Subcity.findOne({ url: req.body.url }).then((doc) => {
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
  data.url =
    "/locations/" + slugify(data.name, slugifyOptions) + "-subcity-" + data.id;
  var subcity = new Subcity();
  Object.assign(subcity, data);
  subcity.save().then(
    (doc) => {
      data.location_details = data.details;
      delete data.details;
      data.doc_type = "location";
      data.location_type = "subcity";
      data.unique = 1;
      data.updated = doc.updated;
      Elastic.create_entitiy(data).then((resp) => {
        res.status(200).json({
          success: true,
          message: "New subcity added",
        });
      });
    },
    (e) => {
      console.log("Error occured", e);
      res.status(200).json({
        success: false,
        message: "Couldn't add new subcity",
      });
    }
  );
});

router.post("/edit", async function (req, res) {
  let data = req.body;
  if (data.updated) {
    delete data.updated;
  }
  let _id = data._id;
  data.is_live = "1";
  data.url =
    "/locations/" + slugify(data.name, slugifyOptions) + "-subcity-" + data.id;
  delete data._id;
  await Subcity.findOneAndUpdate(
    { _id: _id },
    data,
    { new: true, upsert: true },
    async (err, doc) => {
      if (err) {
        res.status(200).json({
          success: false,
          message: "Couldn't edit Subcity",
        });
      } else {
        await Elastic.delete_entity({ match_phrase: { url: data.url } }).then(
          async (resp) => {
            data.location_details = data.details;
            delete data.details;
            data.doc_type = "location";
            data.location_type = "subcity";
            data.unique = 1;
            data.updated = doc.updated;
            await Elastic.create_entitiy(data).then((resp) => {
              res.status(200).json({
                success: true,
                message: "Subcity Edited",
              });
            });
          }
        );
      }
    }
  );
});
router.post("/set_status", function (req, res) {
  Subcity.findOneAndUpdate(
    { url: req.body.url },
    { is_live: req.body.status },
    { new: true, upsert: true },
    (err, doc) => {
      if (err) {
        res.status(200).json({
          success: false,
          message: "Couldn't edit subcity",
        });
      } else {
        Elastic.delete_entity({ match_phrase: { url: req.body.url } }).then(
          (resp) => {
            data = doc._doc;
            if ("reason" in req.body) {
              var rework = new ReWork();
              rework.entity = "subcity";
              rework.id = data.id;
              rework.reason = req.body.reason;
              rework.save().then((doc) => {});
            }
            // if (data.updated) {
            //     delete data.updated
            // }
            delete data._id;
            data.doc_type = "location";
            data["location_type"] = "subcity";
            if ("details" in data) {
              data["location_details"] = data["details"];
            }
            delete data["details"];
            data.is_live = req.body.status;
            data.unique = 1;
            Elastic.create_entitiy(data).then((resp) => {
              res.status(200).json({
                success: true,
                message: "subcity Edited",
              });
            });
          }
        );
      }
    }
  );
});
router.post("/update_views", async function (req, res) {
  await Subcity.findOne({ url: req.body.url })
    .then(async (doc_) => {
      await Subcity.findOneAndUpdate(
        { url: req.body.url },
        { views: doc_ && doc_.views ? doc_.views + 1 : 1 },
        { new: true, timestamps: false },
        async (err, doc) => {
          if (err) {
            res.status(200).json({
              success: false,
              message: "Couldn't update subcity views",
            });
          } else {
            await Elastic.delete_entity({ match_phrase: { url: req.body.url } })
              .then(async (resp) => {
                data = doc._doc;
                delete data._id;
                data.doc_type = "location";
                data["location_type"] = "subcity";
                if ("details" in data) {
                  data["location_details"] = data["details"];
                }
                delete data["details"];
                data.unique = 1;
                data.updated = doc.updated;
                await Elastic.create_entitiy(data)
                  .then((response) => {
                    console.log(data.views);
                    res.status(200).json({
                      success: true,
                      message: "subcity views updated",
                      views: data.views,
                    });
                  })
                  .catch((updateViewsError) => {
                    console.log(
                      "Error while updating subcity views in elasticsearch: ",
                      updateViewsError
                    );
                    res.status(200).json({
                      success: false,
                      message: "couldn't update subcity views",
                    });
                  });
              })
              .catch((updateViewsError) => {
                console.log(
                  "Error while updating subcity views in elasticsearch: ",
                  updateViewsError
                );
                res.status(200).json({
                  success: false,
                  message: "couldn't update subcity views",
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
