const express = require("express");
const router = express.Router();
var newObjectID = require("mongodb").ObjectID;
const {
  addToNewsletter,
  findStatusCount,
  findSubStatusCount,
} = require("./__helper");
const { isPhoneNumberValid } = require("./__helper");

const BookingProperty = require("../../models/book_property.model");

//insert a lead
router.post("/bookthisproperty", async function (req, res) {
  console.log("bookingProperty.route.js => ", req.body);
  req.body.bookingPhone = isPhoneNumberValid(req.body.countryCode + req.body.bookingPhone);

  const newLead = {
    id: new newObjectID(),
    name: req.body.bookingName,
    email: req.body.bookingEmail,
    number: req.body.bookingPhone,
    property: req.body.bookingProperty,
    history: [
      {
        notes: "",
        status: "",
        subStatus: "",
        whatsappNumber: req.body.bookingPhone,
        updated: Date.now(),
        updatedBy: "System",
      },
    ],
    latestStatus: "",
  };

  newLead.country = { code: req.body.countryCode, name: req.body.countryName };
  newLead.history[0].country = {
    code: req.body.countryCode,
    name: req.body.countryName,
  };

  if (req.session.user) {
    newLead.registeredMobileNumber = req.session.user.username;
  }

  await BookingProperty.BookingPropertySchema.create(newLead)
    .then(async (response) => {
      console.log("DONE: ", response);
      if (req.body.newsletter && req.body.newsletter === "on") {
        console.log(`Adding ${req.body.bookingEmail} to newsletters database.`);
        await addToNewsletter(req.body.bookingEmail);
      }
      res.status(200).json({
        success: true,
        message:
          "Our team will contact you shortly to process the booking amount and the next steps.",
        title: "Thank you for sharing your details!",
        redirect_url:"/bookproperty/thankyou-buy"
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
router.post("/get/bookedproperties", async function (req, res) {
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
    temp_q["$or"].push({ latestStatus: new RegExp(q.search, "i") });
    temp_q["$or"].push({ latestSubStatus: new RegExp(q.search, "i") });
    console.log(q.search);
    while (q.search.includes(" ")) {
      console.log(q.search);
      q.search = q.search.replace(" ", "-");
    }
    temp_q["$or"].push({ property: new RegExp(q.search, "i") });
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

  console.log("main query", mainQuery);

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
    await BookingProperty.BookingPropertySchema.find(mainQuery)
      .sort(sortObj)
      .skip(skipRecords)
      .limit(recordLimit)
      .then(
        async (docs) => {
          console.log(docs);
          let dataToSend = [];
          for (const entity of docs) {
            console.log(entity);
            try {
              const Property = require("../../models/property.model");
              let _q = {};
              if (entityQuery["$or"].length > 0) {
                _q = { url: entity.property, ...entityQuery };
              } else {
                _q = { url: entity.property };
              }
              if (entityQueryP["$or"].length > 0) {
                _q = { url: entity.property, $and: [entityQueryP] };
                if (entityQuery["$or"].length > 0) {
                  _q["$and"].push(entityQuery);
                }
              }
              await Property.findOne(_q)
                .then((res) => {
                  if (res) {
                    console.log(userLocationAccessData);
                    // if (userLocationAccessData[0].locationAccessLevel === "FULL ACCESS") {
                    //   dataToSend.push(entity);
                    // } else {
                    //   for (let i = 0; i <= userLocationAccessData.length - 1; i++) {
                    //     console.log(userLocationAccessData[i].locationAccessLevel)
                    //     if (res[userLocationAccessData[i].locationAccessLevel.toLowerCase()]) {
                    //       if (res[userLocationAccessData[i].locationAccessLevel.toLowerCase()] === userLocationAccessData[i].locationAccessValue) {
                    //         dataToSend.push(entity);
                    //       }
                    //     }
                    //   }
                    // }
                    entity._doc.property_name = res.name;
                    dataToSend.push(entity);
                  } else {
                    console.log("No property exists with this url");
                    if (
                      userLocationAccessData[0].locationAccessLevel ===
                        "FULL ACCESS" &&
                      userPropertyTypeAccessData[0].propertyTypeAccessLevel ===
                        "FULL ACCESS"
                    ) {
                      dataToSend.push(entity);
                    }
                  }
                })
                .catch((err) => {
                  console.log(err);
                });
              console.log(dataToSend);
            } catch (e) {
              console.log(e);
            }
          }
          await BookingProperty.BookingPropertySchema.find(query)
            .count()
            .then(
              async (doc) => {
                // console.log("**************", docs);
                count = doc;

                if (hasFullAccess) {
                  let matchQuery = {};
                  if (query["$and"]) {
                    matchQuery = query["$and"][0];
                  } else if (query["$or"] && !Array.isArray(query["$or"])) {
                    matchQuery = query["$or"];
                  }
                  const agg =
                    await BookingProperty.BookingPropertySchema.aggregate([
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
                    const agg =
                      await BookingProperty.BookingPropertySchema.aggregate([
                        { $match: matchQuery },
                        {
                          $group: {
                            _id: "$latestSubStatus",
                            count: { $sum: 1 },
                          },
                        },
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
                  //first time it will iterate with no status filter and second time it will iterate with status filter
                  if (i === 0) {
                    // const dataToAggregate = await BookingProperty.BookingPropertySchema.find(mainQuery);
                    aggObjStatus = findStatusCount(dataToSend);
                    aggObjSubStatus = findSubStatusCount(
                      dataToSend,
                      query.latestStatus
                    );
                  }
                }
                if (i === no_of_times-1) {
                  res.status(200).json({
                    success: true,
                    message: "Fetched Booked Properties List",
                    count,
                    relevantCount: dataToSend.length,
                    docs: dataToSend,
                    hasFullAccess,
                    aggObjStatus,
                    aggObjSubStatus,
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
            message: "Couldn't fetch the Booked Properties List",
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
      country: req.body.data.update.country || { code: "+91", name: "India" },
      whatsappNumber: req.body.data.update.whatsappNumber,
      updated: Date.now(),
      updatedBy: req.body.data.update.updatedBy,
    };
    history.push(newHistory);

    await BookingProperty.BookingPropertySchema.findOneAndUpdate(
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
