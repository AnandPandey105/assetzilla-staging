const express = require("express");
const moment = require("moment");
const router = express.Router();
Images = require("../../classes/images");
Elastic = require("../../classes/elasticsearch");
Filters = require("../../classes/filters");
const News = require("../../models/news.model");
const Tags = require("../../models/tags.model");
const ReWork = require("../../models/rework.model");
const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const slugify = require("slugify");
const {slugifyOptions} = require("../../appConstants");
// let slugifyOptions = {
//   replacement: "-", // replace spaces with replacement character, defaults to `-`
//   remove: /[*+~.()'"!:@]/g, // remove characters that match regex, defaults to `undefined`
//   lower: true, // convert to lower case, defaults to `false`
//   strict: false, // strip special characters except replacement, defaults to `false`
//   locale: "en", // language code of the locale to use
//   trim: true, // trim leading and trailing replacement chars, defaults to `true`
// };

//****Image upload */
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
    img.entity = "news";
    newReqFiles.push(img);
  });
  req.files = newReqFiles;
  next();
};

// var get_date = function (docs) {
//   results = [];
//   docs.forEach((element) => {
//     let d = {};
//     let c = "";
//     if (element.updated){
//       c = element.updated.split("T")[0];
//       d.date = c.split("-")[2];
//       d.month = monthNames[parseInt(c.split("-")[1])];
//       d.year = c.split("-")[0];
//     }
//     element.updated = d;
//     results.push(element);
//   });
//   return results;
// };

var get_date = function (docs) {
  results = [];
  docs.forEach((element) => {
    let d = {};
    if (element.updated) {
      let c = element.updated.split("T")[0];
      d.date = c.split("-")[2];
      d.month = monthNames[parseInt(c.split("-")[1])];
      d.year = c.split("-")[0];
    }
    element.updated = d;
    results.push(element);
  });
  return results;
};

var get_publish_date = function (docs) {
  results = [];
  docs.forEach((element) => {
    // console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&7")
    // console.log(element);
    let eleDate = undefined;
    let full = undefined;
    if (element.publish_date) {
      eleDate = new Date(element.publish_date);
      full = eleDate.toDateString();
    }
    let d = {};
    if (element.publish_date) {
      let c = element.publish_date.split("T")[0];
      d.date = c.split("-")[2];
      d.month = monthNames[parseInt(c.split("-")[1])];
      d.year = c.split("-")[0];
    }
    //check if it is empty
    if (Object.keys(d).length !== 0) {
      element.publish_date = d;
    }
    if (full) {
      element.publish_date.full = full;
    }
    results.push(element);
    console.log(element.publish_date);
  });
  return results;
};

var multer_upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "assetzilla-bucket",
    acl: "public-read",
    key: function (req, file, cb) {
      var date = new Date();
      cb(
        null,
        "dyn-res/news/" +
          "news_" +
          date.getTime().toString() +
          Math.floor(Math.random() * 1000000).toString() +
          "." +
          file.originalname.split(".")[file.originalname.split(".").length - 1]
      );
    },
  }),
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
router.post("/edit", function (req, res) {
  let data = req.body;
  data.publish_date = new Date(req.body.publish_date);
  // data.url = "/news/" + slugify(data.heading, slugifyOptions) + "-" + data.id;
  // if (data.updated) {
  //   delete data.updated;
  // }
  let _id = data._id;
  data.is_live = "1";
  delete data._id;
  if (typeof data.tags == "string") {
    let tags = [];
    data.tags = data.tags.split(",");
    data.tags.forEach((element) => {
      if (element) {
        tags.push(element.trim());
      }
    });
    data.tags = tags;
  }
  // save new tags
  Tags.updateMany({}, { $addToSet: { tags: { $each: data.tags } } }).then(
    function (resp) {},
    function (err) {}
  );
  News.findOneAndUpdate(
    { _id: _id },
    data,
    { new: true, upsert: true },
    (err, doc) => {
      if (err) {
        res.status(200).json({
          success: false,
          message: "Couldn't edit news",
        });
      } else {
        Elastic.delete_entity({ match_phrase: { url: data.url } }).then(
          (resp) => {
            data.doc_type = "news";
            data.news_banner = data.images;
            delete data.images;
            if (data.heading.length > 120) {
              data.heading = data.heading.substring(0, 120) + "...";
            }
            if (data.content.length > 200) {
              data.content = data.content.substring(0, 200) + "...";
            }
            data.unique = 1;
            data.updated = doc.updated;
            console.log(
              "------------------------------------------------------------------------\n--- ",
              data.updated.toLocaleString("en-IN"),
              data.updated.toLocaleString("en-IN"),
              " \n-------------------------------------"
            );
            Elastic.create_entitiy(data).then((resp) => {
              res.status(200).json({
                success: true,
                message: "news Edited",
              });
            });
          }
        );
      }
    }
  );
});
router.post("/get-doc", function (req, res) {
  News.findOne({ url: req.body.url }).then((doc) => {
    res.status(200).json({
      success: true,
      data: doc._doc,
    });
  });
});
router.post("/add", function (req, res) {
  let data = req.body;
  data.publish_date = new Date(req.body.publish_date);
  let date = new Date();
  let id = AlphaId.encode(date.getTime());
  data.id = id;
  data.is_live = "1";
  let clean_heading = data["heading"];
  //clean_heading = clean_heading.replace("[^A-Za-z0-9]+", " ");
  //clean_heading = clean_heading.replace("s+", " ");
  data.url = "/news/" + slugify(clean_heading, slugifyOptions) + "-" + data.id;
  data.updated = date;
  if (typeof data.tags == "string") {
    let tags = [];
    data.tags = data.tags.split(",");
    data.tags.forEach((element) => {
      if (element) {
        tags.push(element.trim());
      }
    });
    data.tags = tags;
  }
  var news = new News();
  Object.assign(news, data);
  // save new tags
  Tags.updateMany({}, { $addToSet: { tags: { $each: data.tags } } }).then(
    function (resp) {},
    function (err) {}
  );
  // Save article to db and elastic
  news.save().then(
    (doc) => {
      data.doc_type = "news";
      data.news_banner = data.images;
      delete data.images;
      delete data.content;
      data.unique = 1;
      data.updated = doc.updated;
      if (data.heading.length > 120) {
        data.heading = data.heading.substring(0, 120) + "...";
      }
      Elastic.create_entitiy(data).then(
        (resp) => {
          res.status(200).json({
            success: true,
            message: "New news added",
          });
        },
        (e) => {
          console.log("Error occured in elastic search", e);
          res.status(200).json({
            success: false,
            message: "Couldn't add new news to elastic",
          });
        }
      );
    },
    (e) => {
      console.log("Error occured", e);
      res.status(200).json({
        success: false,
        message: "Couldn't add new news",
      });
    }
  );
});
router.post("/get", function (req, res) {
  console.log("req.body news", req.body);
  if ("limit" in req.body) {
    var limit = req.body.limit;
  } else {
    var limit = 10;
  }
  if ("query" in req.body) {
    var filter = Filters.news_filter({ q: req.body.query });
  } else {
    var filter = { should: [], must: [] };
  }
  if ("skip" in req.body) {
    var skip = req.body.skip;
  } else {
    var skip = 0;
  }
  if ("status" in req.body) {
    filter.must.push({ term: { is_live: req.body.status } });
  }
  if ("sort" in req.body) {
    var sort = Filters.news_sort(req.body.sort);
  } else {
    var sort = Filters.news_sort(undefined);
  }
  console.log("sort news", sort);
  console.log("skip news", skip);
  Elastic.get_entities(
    "",
    "news",
    limit,
    [
      "url",
      "news_banner",
      "id",
      "heading",
      "updated",
      "publish_date",
      "link_name",
      "is_live",
      "views",
    ],
    filter,
    skip,
    sort
  ).then((resp) => {
    res.status(200).json({
      success: true,
      message: "Fetched News's list",
      results: resp.results,
      total: resp.count,
    });
  });
});
router.post("/infinite", function (req, res) {
  req.body.query = JSON.parse(req.body.query);
  if ("limit" in req.body) {
    var limit = req.body.limit;
  } else {
    var limit = 10;
  }
  if ("skip" in req.body) {
    var skip = req.body.skip;
  } else {
    var skip = 0;
  }
  if ("query" in req.body) {
    var filter = Filters.news_filter(req.body.query);
  } else {
    var filter = { should: [], must: [] };
  }
  filter.must.push({ term: { is_live: "2" } });
  let sort = [{ publish_date: { order: "desc" } }];
  Elastic.get_entities(
    "",
    "news",
    limit,
    [
      "news_banner",
      "heading",
      "content",
      "id",
      "updated",
      "url",
      "tags",
      "link",
      "link_name",
      "publish_date",
    ],
    filter,
    skip,
    sort
  ).then((resp) => {
    if (resp.results.length > 0) {
      console.log("--------------------------\n");

      resp.results = Images.news_img_url_list("News", resp.results);
      resp.results = get_date(resp.results);
      resp.results = get_publish_date(resp.results);
      // for (let i = 0; i < resp.results.length; i++) {
      //   if ("publish_date" in resp.results[i]) {
      //     let eleDate = new Date(resp.results[i].publish_date);
      //     resp.results[i].publish_date = eleDate.toDateString();
      //   }
      // }
      res.render("pages/v1/partials/news-cards", resp);
      // res.render('partials/news_cards', resp);
    } else {
      res.send("");
    }
  });
});
router.post("/set_status", function (req, res) {
  News.findOneAndUpdate(
    { url: req.body.url },
    { is_live: req.body.status },
    { new: true, upsert: true },
    (err, doc) => {
      if (err) {
        res.status(200).json({
          success: false,
          message: "Couldn't edit news",
        });
      } else {
        Elastic.delete_entity({ match_phrase: { url: req.body.url } }).then(
          (resp) => {
            data = doc._doc;
            if ("reason" in req.body) {
              var rework = new ReWork();
              rework.entity = "news";
              rework.id = data.id;
              rework.reason = req.body.reason;
              rework.save().then((doc) => {});
            }
            // if (data.updated) {
            //   delete data.updated;
            // }
            delete data._id;
            data.doc_type = "news";
            if ("images" in data) {
              data["news_banner"] = data["images"];
            }
            delete data["images"];
            data.is_live = req.body.status;
            data.unique = 1;
            data.updated = doc.updated;
            Elastic.create_entitiy(data).then((resp) => {
              res.status(200).json({
                success: true,
                message: "news Edited",
              });
            });
          }
        );
      }
    }
  );
});
router.get("/get-tags", function (req, res) {
  Tags.find().then((doc) => {
    res.status(200).json({
      success: true,
      data: doc,
    });
  });
});
router.post("/update_views", async function (req, res) {
  await News.findOne({ url: req.body.url })
    .then(async (doc_) => {
      await News.findOneAndUpdate(
        { url: req.body.url },
        { views: doc_ && doc_.views ? doc_.views + 1 : 1 },
        { new: true, timestamps: false },
        async (err, doc) => {
          if (err) {
            res.status(200).json({
              success: false,
              message: "Couldn't update article views",
            });
          } else {
            await Elastic.delete_entity({ match_phrase: { url: req.body.url } })
              .then(async (resp) => {
                data = doc._doc;
                delete data._id;
                data.doc_type = "news";
                data.news_banner = data.images;
                delete data.images;
                delete data.content;
                data.unique = 1;
                data.updated = doc.updated;
                await Elastic.create_entitiy(data)
                  .then(async (resp) => {
                    res.status(200).json({
                      success: true,
                      message: "article views updated",
                      views: data.views,
                    });
                  })
                  .catch((updateViewsError) => {
                    console.log(
                      "Error while updating article views in elasticsearch: ",
                      updateViewsError
                    );
                    res.status(200).json({
                      success: false,
                      message: "couldn't update article views",
                    });
                  });
              })
              .catch((updateViewsError) => {
                console.log(
                  "Error while updating article views in elasticsearch: ",
                  updateViewsError
                );
                res.status(200).json({
                  success: false,
                  message: "couldn't update article views",
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
