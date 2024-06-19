const express = require("express");
const router = express.Router();
AlphaId = require("../../classes/alphaId");
Elastic = require("../../classes/elasticsearch");

const LoanProject = require("../../models/loan_project.model");
const Project = require("../../models/project.model");
const Property = require("../../models/property.model");
const { addToNewsletter, findStatusCount, findSubStatusCount } = require("../api/__helper");

router.post("/add", async function (req, res) {
  // console.log('loan_project ----------req body', req.body);
  let data = req.body;
  let date = new Date();
  let id = AlphaId.encode(date.getTime());
  data.id = id;
  let newHistory = {
    notes: "",
    status: "",
    subStatus: "",
    whatsappNumber: req.body.phone,
    updated: Date.now(),
    updatedBy: "System",
  };
  data.country = {code:data.countryCode, name:data.countryName};
  newHistory.country = {code:data.countryCode, name:data.countryName};
  data.latestStatus = newHistory.status;
  data.history = [];
  data.history.push(newHistory);
  if(req.session.user) {
    data.registeredMobileNumber = req.session.user.username;
  }
  data.url = "";
  try {
    if (data.project !== "Others") {
      const doc = await Project.findOne({ name: data.project });
      if (doc) {
        data.url = doc.url;
      } else {
        console.log("No data found for this project name: ", data.project);
        const doc2 = await Property.findOne({ name: data.project });
        if (doc2) {
          data.url = doc2.url;
        } else {
          console.log(
            `${data.project} was not found in projects as well as properties.`
          );
        }
      }
    } else {
      data.url = "Others";
    }
  } catch (er) {
    console.log(err);
  }

  var loanProject = new LoanProject();
  Object.assign(loanProject, data);
  loanProject.save().then(
    (doc) => {
      // console.log('Loan request saved succesfully')
      res.status(200).json({
        success: true,
        message:
          "Our team will contact you shortly to discuss the next steps.",
        title:"Thank you for submitting your loan requirement!",
      });
    },
    (e) => {
      console.log("Error occured", e);
      res.status(200).json({
        success: false,
        message: "Couldn't save loan request",
      });
    }
  );
  if (data.newsletter === "true"){
    console.log(`Adding ${data.email} to newsletters database.`);
    await addToNewsletter(data.email)
  }
});

// get list of leads buyers
router.post("/get", async function (req, res) {
  console.log("From Loan PRojects*****");
  var sortBy = req.body.sortBy;
  var sortForm = req.body.sortForm;
  var count;
  var relevantCount = 0;
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
  let entityQuery = { $or: [] };
  let entityQueryP = { $or: [] };

  let user = req.body.user;
  let userLocationAccessData = [];
  let userPropertyTypeAccessData = [];

  let hasFullAccess = false;
  let hasFullPropertyTypeAccessOnly = false;
  let hasFullLocationAccessOnly = false;

  if (user) {
    const { getUserLocationLevelAccessInfo,getUserPropertyLevelAccessInfo } = require("./__helper");
    userLocationAccessData = await getUserLocationLevelAccessInfo(user);
    userPropertyTypeAccessData = await getUserPropertyLevelAccessInfo(user);
    // let locationAccessLevel = accessData.locationAccessLevel;
    // let locationAccessValue = accessData.locationAccessValue;
    // if (accessData) {
    //   userLocationAccessData.push(locationAccessLevel.toLowerCase());
    //   userLocationAccessData.push(locationAccessValue);
    // }
    if (userLocationAccessData.length > 0) {
      if (userLocationAccessData[0].locationAccessLevel === "FULL ACCESS") {
        //do nothing;
        hasFullLocationAccessOnly = true;
      } else {
        for (let i = 0; i <= userLocationAccessData.length - 1; i++) {
          let _query = {};
          _query[userLocationAccessData[i].locationAccessLevel.toLowerCase()] =
            userLocationAccessData[i].locationAccessValue;
          entityQuery["$or"].push(_query);
        }
      }
    }
    if (userPropertyTypeAccessData.length > 0) {
      if (userPropertyTypeAccessData[0].propertyTypeAccessLevel === "FULL ACCESS") {
        //do nothing;
        hasFullPropertyTypeAccessOnly = true;
      } else {
        for (let i = 0; i <= userPropertyTypeAccessData.length - 1; i++) {
          let _query = {};
          _query.property_type = userPropertyTypeAccessData[i].propertyTypeAccessValue;
          entityQueryP["$or"].push(_query);
        }
      }
    }
    if(hasFullLocationAccessOnly && hasFullPropertyTypeAccessOnly){
      hasFullAccess = true;
    }
  }

  if (req.body.hasOwnProperty("param") && q.search.length > 0) {
    let temp_q = {};
    temp_q["$or"] = [];

    temp_q["$or"].push({ name: new RegExp(q.search, "i") });
    temp_q["$or"].push({ email: new RegExp(q.search, "i") });
    temp_q["$or"].push({ bank: new RegExp(q.search, "i") });
    // temp_q["$or"].push({ "username": new RegExp(q.search, "i") });
    temp_q["$or"].push({ user: new RegExp(q.search, "i") });
    temp_q["$or"].push({ project: new RegExp(q.search, "i") });
    temp_q["$or"].push({ latestStatus: new RegExp(q.search, "i") });
    temp_q["$or"].push({ latestSubStatus: new RegExp(q.search, "i") });
    if (Number(q.search)) {
      console.log(Number(q.search));
      temp_q["$or"].push({ phone: Number(q.search) });
    }

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

  if (userLocationAccessData && userPropertyTypeAccessData) {
    if (
      (userLocationAccessData.length > 0 &&
        userLocationAccessData[0]._doc.locationAccessLevel !== "FULL ACCESS")
      ||
      (userPropertyTypeAccessData.length > 0 &&
        userPropertyTypeAccessData[0]._doc.propertyTypeAccessLevel !== "FULL ACCESS")
    ) {
      recordLimit = 1000;
    }
  }
  let aggObjStatus = {};
  let aggObjSubStatus = {};
  let no_of_times = 1;
  let temp_mainQuery = {};
  if (mainQuery.latestStatus){
    no_of_times = 2;
    temp_mainQuery['latestStatus'] = mainQuery.latestStatus;
    delete mainQuery.latestStatus;
    if (mainQuery.latestSubStatus){
      temp_mainQuery['latestSubStatus'] = mainQuery.latestSubStatus;
      delete mainQuery.latestSubStatus;
    }
  }
  if (mainQuery['$or'] && mainQuery['$or'][0] && mainQuery['$or'][0].latestStatus === ''){
    no_of_times = 2;
    temp_mainQuery['$or'] = mainQuery['$or'].filter(a => !a.latestStatus);
    const arr = mainQuery['$or'].filter(a => a.latestStatus);
    mainQuery['$or'] = arr;
    if (mainQuery['$or'].length === 0) {
      delete mainQuery['$or'];
    }
  }
  let indexArr = [];
  for (let i = 0; i <= no_of_times-1; i++) {
    indexArr.push(i)
  }
  for (const i of indexArr) {
    if (i === no_of_times -1) {
      mainQuery = {...mainQuery, ...temp_mainQuery};
    }
    try{
      const docs = await LoanProject.find(mainQuery).sort(sortObj).skip(skipRecords).limit(recordLimit);
      const doc = await LoanProject.find(query).count();
      count = doc;
      console.log(docs);
      let docsToSend = [];
      for (const thisLoanProject of docs) {
        let _q = {};
        if (entityQuery["$or"].length > 0) {
          if (!thisLoanProject._doc.url){
            _q = { name: thisLoanProject.project, ...entityQuery };
          } else{
            _q = { url: thisLoanProject.url, ...entityQuery };
          }
        } else {
          _q = { name: thisLoanProject.project };
          if (!thisLoanProject._doc.url){
            _q = { name: thisLoanProject.project};
          } else{
            _q = { url: thisLoanProject.url};
          }
        }
        if (entityQueryP["$or"].length > 0) {
          if (!thisLoanProject._doc.url){
            _q = { name: thisLoanProject.project, $and:[entityQueryP] };
            if(entityQuery['$or'].length > 0 ){
              _q['$and'].push(entityQuery);
            }
          } else{
            _q = { url: thisLoanProject.url, $and:[entityQueryP] };
            if(entityQuery['$or'].length > 0 ){
              _q['$and'].push(entityQuery);
            }
          }
        }
        let found = null;
        try {
          const res = await Project.findOne(_q);
          if (res) {
            found = res;
            console.log(res._doc.city);
            thisLoanProject._doc.city = res._doc.city;
            if (!thisLoanProject._doc.url) {
              thisLoanProject._doc.url = res._doc.url;
            }
          } else {
            throw new Error('Did not find this entity in projects')
          }
        } catch (err) {
          console.log("Couldn't fetch city for this Loan project " + thisLoanProject + err);
          if(thisLoanProject._doc.url){
            try{
              const response = await Property.findOne(_q);
              if (response){
                found = response;
                thisLoanProject._doc.city = response._doc.city;
                if (!thisLoanProject._doc.url) {
                  thisLoanProject._doc.url = response._doc.url;
                }
              }
            } catch(e) {
              console.log(e);
            }
          }
        }

        if (hasFullAccess) {
            docsToSend.push(thisLoanProject);
        } else if (found && (hasFullLocationAccessOnly || hasFullPropertyTypeAccessOnly)){
          docsToSend.push(thisLoanProject);
        } else {
          for (let i = 0; i <= userLocationAccessData.length - 1; i++) {
            if (found){
              let resp = res ? res: response;
              if (
                found[userLocationAccessData[i].locationAccessLevel.toLowerCase()] === userLocationAccessData[i].locationAccessValue
              ) {
                docsToSend.push(thisLoanProject);
                  relevantCount++;
              }
            }          
          }
        }
      }
      console.log(docsToSend);

      if (hasFullAccess) {
        let matchQuery = {};
        if (query["$and"]) {
          matchQuery = query["$and"][0];
        } else if (query["$or"] && !Array.isArray(query["$or"])) {
          matchQuery = query["$or"];
        }
        const agg = await LoanProject.aggregate([
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
        aggObjStatus = aggObj;
        const ok = Object.keys(aggObjStatus);
        aggObjStatus['All'] = 0;
        for (const i of ok) {
          aggObjStatus['All'] = aggObjStatus['All'] + aggObjStatus[i];
        }
        if (query.latestStatus) {
          matchQuery["latestStatus"] = query.latestStatus;
          const agg = await LoanProject.aggregate([
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
        aggObjSubStatus = aggObj;
      } else {
        if (i === 0){
          aggObjStatus = findStatusCount(docsToSend);
          aggObjSubStatus = findSubStatusCount(docsToSend, query.latestStatus);
        }
      }
      if (i === no_of_times-1) {
        res.status(200).json({
          success: true,
          message: "Fetched Loan Project Leads list",
          count,
          relevantCount:docsToSend.length,
          docs: docsToSend,
          hasFullAccess,
          aggObjStatus,
          aggObjSubStatus
        });
      }
    } catch(e){
      console.log(e)
    }
  }
});

router.post("/addNotes", async function (req, res) {
  try {
    console.log("Adding these notes in leads buyer loan property: ", req.body);
    let history = req.body.data.history || [];
    let newHistory = {
      notes: req.body.data.update.notes,
      status: req.body.data.update.status || "",
      subStatus: req.body.data.update.subStatus || "",
      whatsappNumber: req.body.data.update.whatsappNumber,
      country:req.body.data.update.country,
      updated: Date.now(),
      updatedBy: req.body.data.update.updatedBy,
    };
    history.push(newHistory);

    await LoanProject.findOneAndUpdate(
      { _id: req.body.data._id },
      { $set: { history: history, latestStatus: newHistory.status, latestSubStatus: newHistory.subStatus } },
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
