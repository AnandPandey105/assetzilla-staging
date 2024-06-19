const express = require('express');
const { default: slugify } = require('slugify');
const router = express.Router();
AlphaId = require('../../classes/alphaId');
Elastic = require('../../classes/elasticsearch');
const {slugifyOptions} = require("../../appConstants")

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
    img.entity = "district";
    newReqFiles.push(img)
  })
  req.files = newReqFiles;
  next()
}

// const {authenticate} = require('../../middlewares/authenticate.middleware');
var multer_upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'assetzilla-bucket',
        acl: 'public-read',
        key: function (req, file, cb) {
            var date = new Date()
            cb(null, "dyn-res/district/" + "district_" + date.getTime().toString() + Math.floor(Math.random() * 1000000).toString() +  "." + file.originalname.split(".")[file.originalname.split(".").length-1]);
        }
    })
});

const District = require('../../models/district.model');
const ReWork = require('../../models/rework.model');

router.post('/multer',only_multer.array("file"),
convertToWebpImageMiddleware,
setEntityName,
uploadToS3, function (req, res) {
    let data = []
    req.files.forEach(element => {
        data.push(element.key.split('/').pop())
    });
    res.status(200).json({
        success: true,
        results: data
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

    District.findOne({ url: req.body.url }).then((doc) => {
        res.status(200).json({
            success: true,
            data: doc._doc
        });
    })
});
router.post("/typeahead", function (req, res) {
    filter_ = [{ term: { doc_type: "location" } }, { term: { location_type: "district" } }, { "term": { "is_live": "2" } }]
    if ("state" in req.body) { filter_.push({ match: { state: req.body.state } }) }
    results = Elastic.query_typeahead(req.body.data, filter_);
    results.then((data) => {
        console.log('district listing', data)
        if (results) {
            res.status(200).json({
                success: true,
                results: data
            });
        }
        else {
            res.status(500).json({
                success: false,
                results: results
            });
        }
    })
})
router.post("/custom-typeahead", function (req, res) {
    var filter_ = [{ term: { doc_type: "location" } }, { "bool": { "should": [{ term: { location_type: "state" } }] } }]
    var status = "2"
    if('status' in req.body){
        if(req.body.status != "0"){
            filter_.push({ "term": { "is_live": req.body.status } })  
        }
    }else{filter_.push({ "term": { "is_live": status } })}
    results = Elastic.query_typeahead(req.body.data, filter_);
    results.then((data) => {
        if (results) {
            res.status(200).json({
                success: true,
                results: data
            });
        }
        else {
            res.status(500).json({
                success: false,
                results: results
            });
        }
    })
})
router.post("/typeahead-district", function (req, res) {
    filter_ = [{ term: { doc_type: "location" } }, { term: { location_type: "district" } }, { "term": { "is_live": "2" } }]
    if ("state" in req.body) { filter_.push({ match: { state: req.body.state } }) }
    results = Elastic.query_typeahead(req.body.data, filter_);
    results.then((data) => {
        if (results) {
            res.status(200).json({
                success: true,
                results: data
            });
        }
        else {
            res.status(500).json({
                success: false,
                results: results
            });
        }
    })
})

router.post("/add", function (req, res) {
    let data = req.body
    let date = new Date();
    let id = AlphaId.encode(date.getTime());
    data.id = id
    data.is_live = "1"
    data.url = "/locations/" + slugify(data.name, slugifyOptions) + "-district-" + data.id;
    var district = new District();
    Object.assign(district, data);
    district.save().then((doc) => {
        data.location_details = data.details;
        delete data.details;
        data.doc_type = "location"
        data.location_type = "district"
        data.unique = 1;
        data.updated = doc.updated;
        Elastic.create_entitiy(data).then((resp) => {
            res.status(200).json({
                success: true,
                message: "New district added"
            });
        })

    }, (e) => {
        console.log('Error occured', e);
        res.status(200).json({
            success: false,
            message: "Couldn't add new district"
        });
    })
})
router.post("/edit", function (req, res) {
    let data = req.body;
    if (data.updated) {
        delete data.updated
    }
    let _id = data._id;
    data.is_live = "1";
    data.url = "/locations/" + slugify(data.name, slugifyOptions) + "-district-" + data.id;
    delete data._id;
    District.findOneAndUpdate({ _id: _id }, data, { new:true,upsert: true }, (err, doc) => {
        if (err) {
            res.status(200).json({
                success: false,
                message: "Couldn't edit District"
            });
        }
        else {
            Elastic.delete_entity({ match_phrase: { url: data.url } }).then((resp) => {
                data.location_details = data.details;
                delete data.details;
                data.doc_type = "location"
                data.location_type = "district"
                data.unique = 1;
                data.updated = doc.updated;
                Elastic.create_entitiy(data).then((resp) => {
                    res.status(200).json({
                        success: true,
                        message: "District Edited"
                    });
                })
            });
        }
    });
});
router.post("/set_status", function (req, res) {
    District.findOneAndUpdate({ url: req.body.url }, { is_live: req.body.status }, { new:true, upsert: true }, (err, doc) => {
        if (err) {
            res.status(200).json({
                success: false,
                message: "Couldn't edit district"
            });
        }
        else {
            Elastic.delete_entity({ match_phrase: { url: req.body.url } }).then((resp) => {
                data = doc._doc;
                if ("reason" in req.body) {
                    var rework = new ReWork();
                    rework.entity = "district";
                    rework.id = data.id;
                    rework.reason = req.body.reason;
                    rework.save().then((doc) => { })
                }
                // if (data.updated) {
                //     delete data.updated
                // }
                delete data._id
                data.doc_type = "location";
                data["location_type"] = "district"
                if ("details" in data) {
                    data["location_details"] = data["details"]
                }
                delete data["details"]
                data.is_live = req.body.status;
                data.unique = 1;
                Elastic.create_entitiy(data).then((resp) => {
                    res.status(200).json({
                        success: true,
                        message: "district Edited"
                    });
                })
            });
        }
    });
})
router.post("/update_views",async function (req, res) {
    await District.findOne({url:req.body.url}).then(async (doc_)=>{
      await District.findOneAndUpdate(
        { url: req.body.url },
        { views: (doc_ && doc_.views) ?doc_.views+1:1 },
        { new: true, timestamps:false },
        async (err, doc) => {
          if (err) {
            res.status(200).json({
              success: false,
              message: "Couldn't update district views",
            });
          } else {
            await Elastic.delete_entity({ match_phrase: { url: req.body.url } }).then(
              async (resp) => {
                data = doc._doc;
                delete data._id;
                data.doc_type = "location";
                data["location_type"] = "district"
                if ("details" in data) {
                    data["location_details"] = data["details"]
                }
                delete data["details"]
                data.unique = 1;
                data.updated = doc.updated;
                await Elastic.create_entitiy(data).then((resp) => {
                  res.status(200).json({
                    success: true,
                    message: "district views updated",
                    views: data.views
                  });
                }).catch((updateViewsError) => {
                    console.log(
                      "Error while updating district views in elasticsearch: ",
                      updateViewsError
                    );
                    res.status(200).json({
                      success: false,
                      message: "couldn't update district views",
                    });
                });
              }
            ).catch((updateViewsError) => {
                console.log(
                  "Error while updating district views in elasticsearch: ",
                  updateViewsError
                );
                res.status(200).json({
                  success: false,
                  message: "couldn't update district views",
                });
            });
          }
        }
      );
    }).catch(e => {
      console.log(e);
    })
  });
module.exports = router;