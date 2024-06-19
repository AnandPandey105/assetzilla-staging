const express = require("express");
const router = express.Router();
const { urlToName } = require("../../_helpers/urlToName");
const City = require("../../models/city.model");
const Subcity = require("../../models/subcity.model");
const District = require("../../models/district.model");
const State = require("../../models/state.model");
var newObjectID = require("mongodb").ObjectID;

const { getPropertiesAvailable } = require("./__helper");

const InterestedBuyer = require("../../models/interested_buyer.model");
const Project = require("../../models/project.model");

const { addToNewsletter, isPhoneNumberValid, findStatusCount, findSubStatusCount } = require("../api/__helper");

let removePercent20 = (str) => {
  while (str.includes("%20")) {
    str = str.replace("%20", " ");
  }
  return str;
};

//insert a lead
router.post("/project/interested", async function (req, res) {
  let { referer } = req.headers;
  const arrReferer = referer.split("/");
  const x = arrReferer[3].split("?");
  // console.log(x[1].replace("%20", " ").replace("=", " = "));
  // console.log("==========================\n", referer);
  // console.log(req.body.email);

  let name = x[1].replace("%20", " ").replace("=", " = ");

  req.body.number = isPhoneNumberValid(req.body.countryCode + req.body.number);

  while (name.includes("%20")) {
    name = name.replace("%20", " ");
  }
  let newHistory = {
    notes: "",
    status: "",
    subStatus: "",
    whatsappNumber: req.body.number,
    updated: Date.now(),
    updatedBy: "System",
  };
  const newLead = {
    id: new newObjectID(),
    email: req.body.email,
    number: req.body.number,
    inquiry_about: name,
    url: req.body.url,
    history: [newHistory],
    latestStatus: newHistory.status,
  };

  newLead.country = { code: req.body.countryCode, name: req.body.countryName };
  newLead.history[0].country = {
    code: req.body.countryCode,
    name: req.body.countryName,
  };

  if (req.session.user) {
    newLead.registeredMobileNumber = req.session.user.username;
  }

  await InterestedBuyer.InterestedBuyerSchema.create(newLead)
    .then(async (response) => {
      console.log("DONE: ", response);
      let sendStr =
        urlToName(req.body.url) || response._doc.inquiry_about.split(" = ")[1];
      if (sendStr.includes("Properties in")) {
        sendStr = sendStr.replace("Properties in", "Property in");
      }
      if (req.body.newsletter && req.body.newsletter !== "false") {
        console.log(`Adding ${req.body.email} to newsletters database.`);
        await addToNewsletter(req.body.email);
      }
      res.status(200).json({
        success: true,
        message:
          "Our team will reach out to you as soon as we have any " + sendStr,
        title: "Thanks for sharing your interest with us!",
      });
    })
    .catch((err) => {
      console.log("Error creating ", err);
      res.status(400).json({
        success: true,
        message: "Uh Oh! There was some error. Can you try again later?",
      });
    });
});

// get list of leads buyers
router.post("/get/project/interested", async function (req, res) {
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
  let entityQuery = { $or: [] };
  let entityQueryP = { $or: [] };

  let userLocationAccessData = [];
  let userPropertyTypeAccessData = [];

  let hasFullAccess = false;
  let hasFullPropertyTypeAccessOnly = false;
  let hasFullLocationAccessOnly = false;

  if (user) {
    const {
      getUserLocationLevelAccessInfo,
      getUserPropertyLevelAccessInfo,
    } = require("./__helper");
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
      if (
        userPropertyTypeAccessData[0].propertyTypeAccessLevel === "FULL ACCESS"
      ) {
        //do nothing;
        hasFullPropertyTypeAccessOnly = true;
      } else {
        for (let i = 0; i <= userPropertyTypeAccessData.length - 1; i++) {
          let _query = {};
          _query.property_type =
            userPropertyTypeAccessData[i].propertyTypeAccessValue;
          entityQueryP["$or"].push(_query);
        }
      }
    }
    if (hasFullLocationAccessOnly && hasFullPropertyTypeAccessOnly) {
      hasFullAccess = true;
    }
  }

  if (req.body.hasOwnProperty("param") && q.search.length > 0) {
    let temp_q = {};
    temp_q["$or"] = [];

    temp_q["$or"].push({ name: new RegExp(q.search, "i") });
    temp_q["$or"].push({ email: new RegExp(q.search, "i") });
    temp_q["$or"].push({ inquiry_about: new RegExp(q.search, "i") });
    temp_q["$or"].push({ latestStatus: new RegExp(q.search, "i") });
    temp_q["$or"].push({ latestSubStatus: new RegExp(q.search, "i") });
    if (Number(q.search)) {
      console.log(Number(q.search));
      temp_q["$or"].push({ number: Number(q.search) });
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
        userLocationAccessData[0]._doc.locationAccessLevel !== "FULL ACCESS") ||
      (userPropertyTypeAccessData.length > 0 &&
        userPropertyTypeAccessData[0]._doc.propertyTypeAccessLevel !==
          "FULL ACCESS")
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
    await InterestedBuyer.InterestedBuyerSchema.find(mainQuery)
      .sort(sortObj)
      .skip(skipRecords)
      .limit(recordLimit)
      .then(
        async (docs) => {
          console.log(docs);
          docs.forEach((d) => d.latestStatus);
          await InterestedBuyer.InterestedBuyerSchema.find(query)
            .count()
            .then(
              async (doc) => {
                // console.log("**************", docs);
                count = doc;
                console.log(docs);
                let docsToSend = [];
                for (const thisInterestedBuyer of docs) {
                  if (
                    thisInterestedBuyer.url &&
                    thisInterestedBuyer.url.includes("city=") &&
                    !thisInterestedBuyer.url.includes("subcity")
                  ) {
                    let temp = thisInterestedBuyer.url.split("city=")[1];
                    temp = temp.split("&")[0];
                    thisInterestedBuyer._doc.city = temp;
                    if (thisInterestedBuyer._doc.url) {
                      thisInterestedBuyer._doc.name = urlToName(
                        thisInterestedBuyer._doc.url
                      );
                    }
                    if (thisInterestedBuyer._doc.url) {
                      if (thisInterestedBuyer._doc.url.includes("?project=")) {
                        let u =
                          thisInterestedBuyer._doc.url.split("?project=")[1];
                        u = removePercent20(u);
                        let ur = await Project.findOne({ name: u });
                        if (ur) {
                          thisInterestedBuyer._doc.url_with_project = ur.url;
                        } else {
                          thisInterestedBuyer._doc.url_with_project =
                            thisInterestedBuyer._doc.url;
                        }
                      } else {
                        thisInterestedBuyer._doc.url_with_project =
                          thisInterestedBuyer._doc.url.replace(
                            "properties",
                            "projects"
                          );
                      }
                      thisInterestedBuyer._doc.propertiesAvailable =
                        await getPropertiesAvailable(thisInterestedBuyer.url);
                    }
                    docsToSend.push(thisInterestedBuyer);
                  } else {
                    try {
                      await Project.findOne({
                        name: thisInterestedBuyer.inquiry_about
                          .slice(10)
                          .split("&")[0],
                      })
                        .then(async (res) => {
                          console.log(res._doc.city);
                          thisInterestedBuyer._doc.city = res._doc.city;
                        })
                        .catch((err) =>
                          console.log(
                            "Couldn't fetch city for this Interested Buyer " +
                              thisInterestedBuyer +
                              err
                          )
                        );
                      if (thisInterestedBuyer._doc.url) {
                        thisInterestedBuyer._doc.name = urlToName(
                          thisInterestedBuyer._doc.url
                        );
                        thisInterestedBuyer._doc.propertiesAvailable =
                          await getPropertiesAvailable(thisInterestedBuyer.url);
                      }
                      if (thisInterestedBuyer._doc.url) {
                        if (thisInterestedBuyer._doc.url.includes("?project=")) {
                          let u =
                            thisInterestedBuyer._doc.url.split("?project=")[1];
                          u = removePercent20(u);
                          let ur = await Project.findOne({ name: u });
                          if (ur) {
                            thisInterestedBuyer._doc.url_with_project = ur.url;
                          } else {
                            thisInterestedBuyer._doc.url_with_project =
                              thisInterestedBuyer._doc.url;
                          }
                        } else {
                          thisInterestedBuyer._doc.url_with_project =
                            thisInterestedBuyer._doc.url.replace(
                              "properties",
                              "projects"
                            );
                        }
                      }
                      docsToSend.push(thisInterestedBuyer);
                    } catch (e) {
                      console.log(e);
                    }
                  }
                }
                let hasAccess = (project) => {
                  let returnObj = false;
                  if (hasFullAccess) {
                    returnObj = true;
                  } else if (hasFullLocationAccessOnly) {
                    userPropertyTypeAccessData.forEach((pa) => {
                      if (
                        project._doc.property_type === pa.propertyTypeAccessValue
                      ) {
                        returnObj = true;
                      }
                    });
                  } else if (hasFullPropertyTypeAccessOnly) {
                    userLocationAccessData.forEach((la) => {
                      if (
                        project._doc[
                          la._doc.locationAccessLevel.toLowerCase()
                        ] === la._doc.locationAccessValue
                      ) {
                        returnObj = true;
                      }
                    });
                  } else {
                    userLocationAccessData.forEach((la) => {
                      if (
                        project._doc[
                          la._doc.locationAccessLevel.toLowerCase()
                        ] === la._doc.locationAccessValue
                      ) {
                        userPropertyTypeAccessData.forEach((pa) => {
                          if (
                            project._doc.property_type ===
                              pa._doc.propertyTypeAccessValue ||
                            pa._doc.propertyTypeAccessValue.includes(
                              project._doc.property_type
                            )
                          ) {
                            returnObj = true;
                          }
                        });
                      }
                    });
                  }
                  return returnObj;
                };

                let urlHasLocationType = (url) => {
                  if (url.includes("&city=")) {
                    return true;
                  } else if (url.includes("&subcity=")) {
                    return true;
                  } else if (url.includes("&state=")) {
                    return true;
                  } else if (url.includes("&district=")) {
                    return true;
                  } else {
                    return false;
                  }
                };

                let getLocationsData = async (url) => {
                  let city = undefined;
                  let subcity = undefined;
                  let district = undefined;
                  let state = undefined;

                  let returnObj = {};
                  let returnArr = [];
                  try {
                    if (url.includes("&city=")) {
                      city = removePercent20(
                        url.split("&city=")[1].split("&")[0]
                      ).split(",");
                      let obj = [];
                      for (const c of city) {
                        let data = await City.findOne({ name: c });
                        if (data) {
                          obj.push({ name: c, data: data._doc });
                          returnArr.push(data._doc);
                        }
                      }
                      returnObj.city = obj;
                    }
                    if (url.includes("&subcity=")) {
                      subcity = removePercent20(
                        url.split("&subcity=")[1].split("&")[0]
                      ).split(",");
                      let obj = [];
                      for (const c of subcity) {
                        let data = await Subcity.findOne({ name: c });
                        if (data) {
                          obj.push({ name: c, data: data._doc });
                          returnArr.push(data._doc);
                        }
                      }
                      returnObj.subcity = obj;
                    }
                    if (url.includes("&district=")) {
                      district = removePercent20(
                        url.split("&district=")[1].split("&")[0]
                      ).split(",");
                      let obj = [];
                      for (const c of district) {
                        let data = await District.findOne({ name: c });
                        if (data) {
                          obj.push({ name: c, data: data._doc });
                          returnArr.push(data._doc);
                        }
                      }
                      returnObj.district = obj;
                    }
                    if (url.includes("&state=")) {
                      state = removePercent20(
                        url.split("&state=")[1].split("&")[0]
                      ).split(",");
                      let obj = [];
                      for (const c of state) {
                        let data = await State.findOne({ name: c });
                        if (data) {
                          obj.push({ name: c, data: data._doc });
                          returnArr.push(data._doc);
                        }
                      }
                      returnObj.state = obj;
                    }
                  } catch (e) {
                    console.log(e);
                  }
                  return returnArr;
                  // return returnObj;
                };

                let docsWithAccess = [];
                for (const ib of docsToSend) {
                  if (ib._doc.inquiry_about.includes("project =")) {
                    try {
                      let rp = await Project.findOne({
                        name: ib._doc.inquiry_about.slice(10).split("&")[0],
                      });
                      let added = false;
                      if (rp) {
                        if (hasAccess(rp)) {
                          docsWithAccess.push(ib);
                          added = true;
                        }
                      }
                      if (!added && hasFullAccess) {
                        docsWithAccess.push(ib);
                      }
                    } catch (e) {
                      console.log(e);
                      if (hasFullAccess) {
                        docsWithAccess.push(ib);
                      }
                    }
                  } else if (ib._doc.url && ib._doc.url.includes("project=")) {
                    //this condition will never be reached because inquiry_about will always catch the urls which have project in it.
                    try {
                      let project_name = ib._doc.url.split("/properties/");
                      let rp = await Project.findOne({ name: project_name });
                      let added = false;
                      if (rp) {
                        if (hasAccess(rp)) {
                          docsWithAccess.push(ib);
                          added = true;
                        }
                      }
                      if (!added && hasFullAccess) {
                        docsWithAccess.push(ib);
                        added = true;
                      }
                    } catch (e) {
                      console.log(e);
                      if (hasFullAccess) {
                        docsWithAccess.push(ib);
                      }
                    }
                  } else if (
                    ib._doc.url &&
                    ib._doc.url.includes("&type=") &&
                    !urlHasLocationType(ib._doc.url)
                  ) {
                    let pty = removePercent20(
                      ib._doc.url.split("&type=")[1].split("&")[0]
                    );
                    //this will only be visible when the user has
                    //1. full location access and selected property type access
                    //2. full location access and full residential type access
                    if (hasFullLocationAccessOnly || hasFullAccess) {
                      if (pty.includes(",")) {
                        pty = pty.split(",");
                        let added = false;
                        pty.forEach((p) => {
                          userPropertyTypeAccessData.forEach((d) => {
                            if (
                              d._doc.propertyTypeAccessValue === p ||
                              d._doc.propertyTypeAccessValue.includes(p)
                            ) {
                              if (!added) {
                                docsWithAccess.push(ib);
                                added = true;
                              }
                            }
                          });
                          if (!added && hasFullAccess) {
                            docsWithAccess.push(ib);
                          }
                        });
                      } else {
                        let added = false;
                        userPropertyTypeAccessData.forEach((d) => {
                          if (
                            d._doc.propertyTypeAccessValue === pty ||
                            d._doc.propertyTypeAccessValue.includes(pty)
                          ) {
                            if (!added) {
                              docsWithAccess.push(ib);
                              added = true;
                            }
                          }
                        });
                        if (!added && hasFullAccess) {
                          docsWithAccess.push(ib);
                        }
                      }
                    }
                  } else if (
                    ib._doc.url &&
                    ib._doc.url.includes("&type=") &&
                    urlHasLocationType(ib._doc.url)
                  ) {
                    let pty = removePercent20(
                      ib._doc.url.split("&type=")[1].split("&")[0]
                    );
                    let locationsData = await getLocationsData(ib._doc.url);
                    if (pty.includes(",")) {
                      pty = pty.split(",");
                      let added = false;
                      pty.forEach((p) => {
                        userPropertyTypeAccessData.forEach((d) => {
                          if (
                            d._doc.propertyTypeAccessValue === p ||
                            d._doc.propertyTypeAccessValue.includes(p)
                          ) {
                            for (const l of locationsData) {
                              userLocationAccessData.forEach((la) => {
                                if (
                                  l[la._doc.locationAccessLevel.toLowerCase()] ===
                                  la._doc.locationAccessValue
                                ) {
                                  if (!added) {
                                    docsWithAccess.push(ib);
                                    added = true;
                                  }
                                }
                              });
                            }
                          }
                        });
                      });
                      if (!added && hasFullAccess) {
                        docsWithAccess.push(ib);
                      }
                    } else {
                      let added = false;
                      userPropertyTypeAccessData.forEach((d) => {
                        if (
                          d._doc.propertyTypeAccessValue === pty ||
                          d._doc.propertyTypeAccessValue.includes(pty)
                        ) {
                          for (const l of locationsData) {
                            userLocationAccessData.forEach((la) => {
                              if (
                                l[la._doc.locationAccessLevel.toLowerCase()] ===
                                la._doc.locationAccessValue
                              ) {
                                if (!added) {
                                  docsWithAccess.push(ib);
                                  added = true;
                                }
                              }
                            });
                          }
                        }
                      });
                      if (!added && hasFullAccess) {
                        docsWithAccess.push(ib);
                      }
                    }
                  } else if (
                    ib._doc.url &&
                    !ib._doc.url.includes("&type=") &&
                    urlHasLocationType(ib._doc.url)
                  ) {
                    let added = false;
                    if (hasFullPropertyTypeAccessOnly) {
                      let locationsData = await getLocationsData(ib._doc.url);
                      for (l of locationsData) {
                        userLocationAccessData.forEach((la) => {
                          if (
                            l[la._doc.locationAccessLevel.toLowerCase()] ===
                            la._doc.locationAccessValue
                          ) {
                            if (!added) {
                              docsWithAccess.push(ib);
                              added = true;
                            }
                          }
                        });
                      }
                    }
                    if (!added && hasFullAccess) {
                      docsWithAccess.push(ib);
                    }
                  } else {
                    if (hasFullAccess) {
                      docsWithAccess.push(ib);
                    }
                  }
                }
                console.log(docsWithAccess);

                if (hasFullAccess) {
                  let matchQuery = {};
                  if (query["$and"]) {
                    matchQuery = query["$and"][0];
                  }
                  if (query["$or"] && !Array.isArray(query["$or"])) {
                    matchQuery = query["$or"];
                  }
                  if (query.hasOwnProperty('isSubscribed')) {
                    matchQuery['isSubscribed'] = query['isSubscribed'];
                  }
                  const agg = await InterestedBuyer.InterestedBuyerSchema.aggregate([
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
                    const agg = await InterestedBuyer.InterestedBuyerSchema.aggregate([
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
                    aggObjStatus = findStatusCount(docsWithAccess);
                    aggObjSubStatus = findSubStatusCount(docsWithAccess, query.latestStatus);
                  }
                }
                if (i === no_of_times - 1){
                  res.status(200).json({
                    success: true,
                    message: "Fetched Interested Buyer's list",
                    count,
                    docs: docsWithAccess,
                    hasFullAccess,
                    aggObjStatus,
                    aggObjSubStatus
                  });
                }                
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
            message: "Couldn't fetch the Interested Buyer's list",
          });
        }
      );
  }
});
router.post("/addNotes", async function (req, res) {
  try {
    console.log("Adding these notes: ", req.body);
    let history = req.body.data.history || [];

    let newHistory = {
      notes: req.body.data.update.notes,
      status: req.body.data.update.status || "",
      subStatus: req.body.data.update.subStatus || "",
      whatsappNumber: req.body.data.update.whatsappNumber,
      country: {
        code: req.body.data.update.country.code,
        name: req.body.data.update.country.name,
      },
      updated: Date.now(),
      updatedBy: req.body.data.update.updatedBy,
    };

    history.push(newHistory);

    await InterestedBuyer.InterestedBuyerSchema.findOneAndUpdate(
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
