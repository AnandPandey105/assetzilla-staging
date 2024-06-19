const express = require("express");
const router = express.Router();
AlphaId = require("../../classes/alphaId");
Elastic = require("../../classes/elasticsearch");
const { addToNewsletter } = require("../api/__helper");

const Consult = require("../../models/consult.model");

router.post("/add", async function (req, res) {
  let data = req.body;
  data.country = { code: req.body.countryCode, name: req.body.countryName };
  let date = new Date();
  let id = AlphaId.encode(date.getTime());
  let newHistory = {
    notes: "",
    status: "",
    subStatus: "",
    whatsappNumber: req.body.phone,
    updated: Date.now(),
    country: data.country,
    updatedBy: "System",
  };
  if (req.session.user) {
    data.registeredMobileNumber = req.session.user.username;
  }
  data.history = [];
  data.history.push(newHistory);
  data.latestStatus = newHistory.status;
  data.id = id;
  console.log("data is", data);
  var consult = new Consult();
  Object.assign(consult, data);
  await consult.save().then(
    (doc) => {
      res.status(200).json({
        success: true,
        message:
          "Our team will be in touch with you shortly to discuss your needs and help you make an informed decision",
        title: "Thank you for requesting a free consultation!",
      });
    },
    (e) => {
      console.log("Error occurred", e);
      res.status(200).json({
        success: false,
        message: "Couldn't save consultation query",
      });
    }
  );

  if (data.newsletter === "true") {
    console.log(`Adding ${data.email} to newsletters database.`);
    await addToNewsletter(data.email);
  }
});

// get list of leads buyers
router.post("/get", async function (req, res) {
  console.log("Consultations*****");
  var sortBy = req.body.sortBy;
  var sortForm = req.body.sortForm;
  var count;
  var pageIndex = req.body.pageIndex;
  var recordLimit = req.body.recordLimit;
  var skipRecords = (pageIndex - 1) * recordLimit;
  var query = {};
  if (req.body.filter) {
    query = { ...query, ...req.body.filter };
  }
  var mainQuery = {};
  if (req.body.filter) {
    mainQuery = { ...mainQuery, ...req.body.filter };
  }
  let q = req.body.param;

  let user = req.body.user;
  let userAccessData = [];
  if (user) {
    const { getUserLocationLevelAccessInfo } = require("./__helper");
    var accessData = await getUserLocationLevelAccessInfo(user);
    console.log(accessData);
    // let locationAccessLevel = accessData.locationAccessLevel;
    // let locationAccessValue = accessData.locationAccessValue;
    // if (accessData) {
    //   userAccessData.push(locationAccessLevel.toLowerCase());
    //   userAccessData.push(locationAccessValue);
    // }
  }

  if (req.body.hasOwnProperty("param") && q.search.length > 0) {
    let temp_q = {};
    temp_q["$or"] = [];

    temp_q["$or"].push({ name: new RegExp(q.search, "i") });
    temp_q["$or"].push({ email: new RegExp(q.search, "i") });
    temp_q["$or"].push({ city: new RegExp(q.search, "i") });
    temp_q["$or"].push({ lookingFor: new RegExp(q.search, "i") });
    temp_q["$or"].push({ type_of_user: new RegExp(q.search, "i") });
    temp_q["$or"].push({ phone: new RegExp(q.search, "i") });
    temp_q["$or"].push({ latestStatus: new RegExp(q.search, "i") });
    temp_q["$or"].push({ latestSubStatus: new RegExp(q.search, "i") });

    if (!query.hasOwnProperty("$or")) {
      query["$or"] = [];
      query["$or"].push(temp_q);
    } else {
      //when the status is blank
      let x = {};
      x["$or"] = query["$or"];
      query = {};
      query["$and"] = [];
      query["$and"].push(temp_q);
      query["$and"].push(x);
    }

    if (!mainQuery.hasOwnProperty("$and")) {
      mainQuery["$and"] = [];
    }
    mainQuery["$and"].push(temp_q);
  }

  // setting sortBy key in sort object as a variable
  let sortObj = {};
  sortObj[sortBy] = sortForm;

  Consult.find(mainQuery)
    .sort(sortObj)
    .skip(skipRecords)
    .limit(recordLimit)
    .then(
      (docs) => {
        Consult.find(query)
          .count()
          .then(
            async (doc) => {
              count = doc;
              let matchQuery = {};
              if (query["$and"]) {
                matchQuery = query["$and"][0];
              } else if (query["$or"] && !Array.isArray(query["$or"])) {
                matchQuery = query["$or"];
              }
              const agg = await Consult.aggregate([
                { $match: matchQuery },
                { $group: { _id: "$latestStatus", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
              ]);
              let aggObj = {};
              if (agg) {
                for (const a of agg) {
                  if (!a._id || a._id === "") {
                    if (!aggObj["Blank"]) {
                      aggObj["Blank"] = a.count;
                    } else {
                      aggObj["Blank"] = a.count + aggObj["Blank"];
                    }
                  } else {
                    aggObj[a._id] = a.count;
                  }
                }
              }
              const aggObjStatus = aggObj;
              const ok = Object.keys(aggObjStatus);
              aggObjStatus['All'] = 0;
              for (const i of ok) {
                aggObjStatus['All'] = aggObjStatus['All'] + aggObjStatus[i];
              }
              if (query.latestStatus) {
                matchQuery["latestStatus"] = query.latestStatus;
                const agg = await Consult.aggregate([
                  { $match: matchQuery },
                  { $group: { _id: "$latestSubStatus", count: { $sum: 1 } } },
                  { $sort: { count: -1 } },
                ]);
                aggObj = {};
                if (agg) {
                  for (const a of agg) {
                    aggObj[a._id] = a.count;
                  }
                }
              }
              const aggObjSubStatus = aggObj;
              res.status(200).json({
                success: true,
                message: "Fetched Buyer's list",
                count,
                docs,
                aggObjStatus,
                aggObjSubStatus
              });
            },
            (e) => {
              console.log(e);
            }
          );
      },
      (e) => {
        console.log("Error is", e);
        res.status(501).json({
          success: false,
          message: "Couldnt fetch the Buyer's list",
        });
      }
    );
});

router.post("/addNotes", async function (req, res) {
  try {
    console.log("Adding these notes in Consultation: ", req.body);
    let history = req.body.data.history || [];
    let newHistory = {
      notes: req.body.data.update.notes,
      status: req.body.data.update.status || "",
      subStatus: req.body.data.update.subStatus || "",
      whatsappNumber: req.body.data.update.whatsappNumber,
      country: req.body.data.update.country || { code: "+91", name: "India" },
      updated: Date.now(),
      updatedBy: req.body.data.update.updatedBy,
    };
    history.push(newHistory);

    await Consult.findOneAndUpdate(
      { _id: req.body.data._id },
      {
        $set: {
          history: history,
          latestStatus: newHistory.status,
          latestSubStatus: newHistory.subStatus,
        },
      },
      { new: true }
    )
      .then((success) => {
        if (success) {
          res.status(200).json({
            success: true,
            message: "History added successfully",
          });
        } else {
          res.status(200).json({
            success: false,
            message: "Could not find that entry",
          });
        }
      })
      .catch((err) => {
        res.status(200).json({
          success: false,
          message: "Some Error Occured",
          err,
        });
      });
  } catch (err) {
    console.log(err);
    res.status(200).json({
      success: false,
      message: "Some Error Occured",
      err,
    });
  }
});

module.exports = router;
