const express = require("express");
const router = express.Router();
AlphaId = require("../../classes/alphaId");
Elastic = require("../../classes/elasticsearch");
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
    img.entity = "city";
    newReqFiles.push(img)
  })
  req.files = newReqFiles;
  next()
}

// const {authenticate} = require('../../middlewares/authenticate.middleware');
var multer_upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "assetzilla-bucket",
    acl: "public-read",
    key: function (req, file, cb) {
      var date = new Date();
      cb(
        null,
        "dyn-res/city/" +
          "city_" +
          date.getTime().toString() + Math.floor(Math.random() * 1000000).toString() +
          "." +
          file.originalname.split(".")[file.originalname.split(".").length - 1]
      );
    },
  }),
});

const City = require("../../models/city.model");
const ReWork = require("../../models/rework.model");

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
router.post("/get-doc", function (req, res) {
  City.findOne({ url: req.body.url }).then((doc) => {
    res.status(200).json({
      success: true,
      data: doc._doc,
    });
  });
});

router.post("/typeahead", function (req, res) {
  console.log("req.body", req.body);
  filter_ = [
    { term: { doc_type: "location" } },
    { term: { location_type: "city" } },
    { term: { is_live: "2" } },
  ];
  if ("state" in req.body) {
    filter_.push({ match: { state: req.body.state } });
  }

  if ("district" in req.body) {
    console.log("district: ", req.body.district);
    filter_.push({ match: { district: req.body.district } });
  }
  results = Elastic.query_typeahead(req.body.data, filter_);
  results.then((data) => {
    if (results) {
      // for entering NEW DELHI in any DELHI district
      if (
        req.body.district === "Central Delhi" ||
        req.body.district === "New Delhi" ||
        req.body.district === "North Delhi" ||
        req.body.district === "West Delhi" ||
        req.body.district === "South Delhi" ||
        req.body.district === "East Delhi" ||
        req.body.district === "North East Delhi" ||
        req.body.district === "North West Delhi" ||
        req.body.district === "South East Delhi" ||
        req.body.district === "South West Delhi" ||
        req.body.district === "Shahdara"
      ) {
        data.push({
          name: "New Delhi",
          doc_type: "location",
          url: "/locations/New-Delhi-city-6",
          location_type: "city",
        });
      }
      if (
        req.body.district === "Mumbai Suburban" ||
        req.body.district === "Mumbai City District" ||
        req.body.district === "Thane District"
      ) {
        data.push({
          name: "Mumbai",
          doc_type: "location",
          url: "/locations/Mumbai-city-22",
          location_type: "city",
        });
      }
      data = [...new Map(data.map((item) => [item["name"], item])).values()];

      // console.log('city listing', data)
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
  filter_ = [
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
router.post("/add", function (req, res) {
  let data = req.body;
  let date = new Date();
  let id = AlphaId.encode(date.getTime());
  data.id = id;
  data.is_live = "1";
  data.url = "/locations/" + slugify(data.name, slugifyOptions) + "-city-" + data.id;
  var city = new City();
  Object.assign(city, data);
  city.save().then(
    (doc) => {
      data.location_details = data.details;
      delete data.details;
      data.doc_type = "location";
      data.location_type = "city";
      data.unique = 1;
      data.updated = doc.updated;
      Elastic.create_entitiy(data).then((resp) => {
        res.status(200).json({
          success: true,
          message: "New city added",
        });
      });
    },
    (e) => {
      console.log("Error occured", e);
      res.status(200).json({
        success: false,
        message: "Couldn't add new city",
      });
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
  data.url = "/locations/" + slugify(data.name, slugifyOptions) + "-city-" + data.id;
  delete data._id;
  City.findOneAndUpdate(
    { _id: _id },
    data,
    { new: true, upsert: true },
    (err, doc) => {
      if (err) {
        res.status(200).json({
          success: false,
          message: "Couldn't edit City",
        });
      } else {
        Elastic.delete_entity({ match_phrase: { url: data.url } }).then(
          (resp) => {
            data.location_details = data.details;
            delete data.details;
            data.doc_type = "location";
            data.location_type = "city";
            data.unique = 1;
            data.updated = doc.updated;
            Elastic.create_entitiy(data).then((resp) => {
              res.status(200).json({
                success: true,
                message: "City Edited",
              });
            });
          }
        );
      }
    }
  );
});
router.post("/set_status", function (req, res) {
  City.findOneAndUpdate(
    { url: req.body.url },
    { is_live: req.body.status },
    { new: true, upsert: true },
    (err, doc) => {
      if (err) {
        res.status(200).json({
          success: false,
          message: "Couldn't edit city",
        });
      } else {
        Elastic.delete_entity({ match_phrase: { url: req.body.url } }).then(
          (resp) => {
            data = doc._doc;
            // console.log("---------------------------\n",data)
            if ("reason" in req.body) {
              var rework = new ReWork();
              rework.entity = "city";
              rework.id = data.id;
              rework.reason = req.body.reason;
              rework.save().then((doc) => {});
            }
            // if (data.updated) {
            //     delete data.updated
            // }
            delete data._id;
            data.doc_type = "location";
            data["location_type"] = "city";
            if ("details" in data) {
              data["location_details"] = data["details"];
            }
            delete data["details"];
            data.is_live = req.body.status;
            data.unique = 1;
            Elastic.create_entitiy(data).then((resp) => {
              res.status(200).json({
                success: true,
                message: "city Edited",
              });
            });
          }
        );
      }
    }
  );
});
router.post("/update_views", async function (req, res) {
  await City.findOne({ url: req.body.url })
    .then(async (doc_) => {
      await City.findOneAndUpdate(
        { url: req.body.url },
        { views: (doc_ && doc_.views)  ? doc_.views + 1 : 1 },
        { new: true, timestamps: false },
        async (err, doc) => {
          if (err) {
            res.status(200).json({
              success: false,
              message: "Couldn't update city views",
            });
          } else {
            await Elastic.delete_entity({ match_phrase: { url: req.body.url } })
              .then(async (resp) => {
                data = doc._doc;
                delete data._id;
                data.doc_type = "location";
                data["location_type"] = "city";
                if ("details" in data) {
                  data["location_details"] = data["details"];
                }
                delete data["details"];
                data.unique = 1;
                data.updated = doc.updated;
                await Elastic.create_entitiy(data)
                  .then((resp) => {
                    res.status(200).json({
                      success: true,
                      message: "city views updated",
                      views: data.views,
                    });
                  })
                  .catch((updateViewsError) => {
                    console.log(
                      "Error while updating city views in elasticsearch: ",
                      updateViewsError
                    );
                    res.status(200).json({
                      success: false,
                      message: "couldn't update city views",
                    });
                  });
              })
              .catch((updateViewsError) => {
                console.log(
                  "Error while updating city views in elasticsearch: ",
                  updateViewsError
                );
                res.status(200).json({
                  success: false,
                  message: "couldn't update city views",
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
