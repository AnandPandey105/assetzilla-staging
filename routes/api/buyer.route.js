const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
var ObjectId = require("mongoose").Types.ObjectId;
const Elastic = require("../../classes/elasticsearch");
const { groupArray } = require("../../utilities/groupArray");
const { urlToName } = require("../../_helpers/urlToName");
const {fetchLeadsData} = require("./__helper")

// const {authenticate} = require('../../middlewares/authenticate.middleware');

const Buyer = require("../../models/buyer.model");
const Customer = require("../../models/customer.model");

const processUrl = (url) => {
  if (url.includes('/properties')){
    return "property";
  } else if (url.includes('/projects')){
    return "project";
  } else if (url.includes('/news')){
    return "news";
  } else if (url.includes('/locations')){
    return "location";
  } else if (url.includes('/builders')){
    return "builder";
  } else if (url.includes('/banks')){
    return "bank";
  } else if (url.includes('/results')){
    return "search result";
  } else if (url.includes('/authorities')){
    return "authority";
  } else if (url.includes('/sellyourproperty')){
    return "sell your property";
  }
}

const getLocationType = (url) => {
  if (url.includes('subcity')){
    return "subcity";
  } else if (url.includes('city')) {
    return "city";
  } else if (url.includes('state')) {
    return "state";
  } else if (url.includes('district')) {
    return "district";
  } else {
    return "location";
  }
}

router.post("/get-buyer-data", async function (req, res) {
  let username = "";

  if (req.body.username) {
    username = req.body.username;
  }

  if (username) {
    try {
      const buyer = await Customer.findOne({
        username: username,
      });
      if (buyer) {
        if (buyer._doc.bookmark) {
          let buyers_bookmarks = buyer._doc.bookmark;
          let newBookmarks = [];
          for (bookmark of buyers_bookmarks) {
            try{
              let res = await Elastic.get_entity_bookmark(bookmark)
              if (res){
                bookmark.data = res;
                newBookmarks.push(bookmark);
              }
            } catch(e){
              console.log("buyer.route.js line 52 error => ", err);
            }
          }
          buyer._doc.bookmark = newBookmarks;
        }
        if (buyer._doc.viewHistory && buyer._doc.viewHistory.length > 0) {
          let loadedViewHistory = [];
          buyer._doc.viewHistory.sort((a, b) => (a.date < b.date ? 1 : -1));
          for (const history of buyer._doc.viewHistory) {
            try {
              // console.log(history.url);
              await Elastic.get_entity_url(history.url)
                .then(async (docu) => {
                  console.log("Elastic success");
                  // console.log(docu);
                  if (docu.success) {
                    let requiredData = {};
                    if(docu.data.name){
                      requiredData.name = docu.data.name;
                    } else if (docu.data.heading){
                      requiredData.heading = docu.data.heading;
                    }
                    requiredData.url = docu.data.url;
                    requiredData.dateOfViewing = history.date.toDateString();
                    requiredData.doc_type = docu.data.doc_type;
                    if (docu.data && docu.data.location_type)
                      requiredData.location_type = docu.data.location_type;
                    loadedViewHistory.push(requiredData);
                  }
                })
                .catch((e) => {
                  console.log(e);
                });
              const groupedViewHistory = groupArray(
                loadedViewHistory,
                "dateOfViewing"
              );
              // console.log(groupedViewHistory);
              // req.session.user.viewHistory = loadedViewHistory;
              buyer._doc.viewHistory = groupedViewHistory;
            } catch (err) {
              console.log("Error occurred while processing user data => ", err);
            }
          }
        }
        if (buyer._doc.searchHistory && buyer._doc.searchHistory.length > 0) {
          let loadedSearchHistory = [];
          buyer._doc.searchHistory.sort((a, b) => (a.date < b.date ? 1 : -1));
          for (const history of buyer._doc.searchHistory) {
            try {
              // console.log(history.url);
              let toPush = {
                url: history.url,
                dateOfViewing: history.date.toDateString(),
                date: history.date,
                name: urlToName(history.url),
                doc_type: processUrl(history.url),
              };
              if (toPush.doc_type.toLowerCase() === 'location'){
                toPush.location_type = getLocationType(history.url);
              }
              loadedSearchHistory.push(toPush);
              const groupedSearchHistory = groupArray(
                loadedSearchHistory,
                "dateOfViewing"
              );
              // console.log(groupedSearchHistory);
              // req.session.user.searchHistory = loadedSearchHistory;
              buyer._doc.searchHistory = groupedSearchHistory;
            } catch (err) {
              console.log("Error occurred while processing user data => ", err);
            }
          }
        }
        buyer._doc.leadsData = await fetchLeadsData(username)
        res.status(200).json({
          success: true,
          msg: "User found",
          data: buyer,
        });
      } else {
        res.status(200).json({
          success: true,
          msg: "No such user with this username",
        });
      }
    } catch (e) {
      res.status(200).json({
        success: false,
        msg: "Ran into error",
        e,
      });
    }
  } else {
    res.status(200).json({
      success: false,
      msg: "No username was sent",
    });
  }
});

// get list of registered buyers
router.post("/get/registered", function (req, res) {
  var sortBy = req.body.sortBy;
  var sortForm = req.body.sortForm;
  var count;
  var pageIndex = req.body.pageIndex;
  var recordLimit = req.body.recordLimit;
  var skipRecords = (pageIndex - 1) * recordLimit;
  var query = {};
  var mainQuery = {};
  let q = req.body.param;

  if (req.body.hasOwnProperty("param") && q.search.length > 0) {
    query["$or"] = [];
    query["$or"].push({ name: new RegExp(q.search, "i") });
    query["$or"].push({ email: new RegExp(q.search, "i") });
    query["$or"].push({ username: new RegExp(q.search, "i") });
    if (!mainQuery.hasOwnProperty("$and")) {
      mainQuery["$and"] = [];
    }
    mainQuery["$and"].push(query);
  }

  // setting sortBy key in sort object as a variable
  let sortObj = {};
  sortObj[sortBy] = sortForm;

  Customer.find(mainQuery, { password: 0 })
    .sort(sortObj)
    .skip(skipRecords)
    .limit(recordLimit)
    .then(
      async (docs) => {
        let data_to_send = [];
        for (const doc of docs) {
          // // if (doc._doc.bookmark) {
          // //   let buyers_bookmarks = doc._doc.bookmark;
          // //   let newBookmarks = [];
          // //   for (bookmark of buyers_bookmarks) {
          // //     await Elastic.get_entity_bookmark(bookmark)
          // //       .then(async (res) => {
          // //         bookmark.data = res;
          // //         newBookmarks.push(bookmark);
          // //       })
          // //       .catch((err) => {
          // //         console.log("buyer.route.js line 52 error => ", err);
          // //       });
          // //   }
          // // }
          // if (doc._doc.viewHistory && doc._doc.viewHistory.length > 0) {
          //   let loadedViewHistory = [];
          //   doc._doc.viewHistory.sort((a, b) => (a.date < b.date ? 1 : -1));
          //   // for (const history of doc._doc.viewHistory) {
          //   //   try {
          //   //     console.log(history.url);
          //   //     await Elastic.get_entity_url(history.url)
          //   //       .then(async (docu) => {
          //   //         console.log("Elastic success");
          //   //         console.log(docu);
          //   //         if (docu.success) {
          //   //           docu.data.dateOfViewing = history.date.toDateString();
          //   //           loadedViewHistory.push(docu.data);
          //   //         }
          //   //       })
          //   //       .catch((e) => {
          //   //         console.log(e);
          //   //       });
          //   //     const groupedViewHistory = groupArray(
          //   //       loadedViewHistory,
          //   //       "dateOfViewing"
          //   //     );
          //   //     console.log(groupedViewHistory);
          //   //     // req.session.user.viewHistory = loadedViewHistory;
          //   //     doc._doc.viewHistory = groupedViewHistory;
          //   //   } catch (err) {
          //   //     console.log(
          //   //       "Error occurred while processing user data => ",
          //   //       err
          //   //     );
          //   //   }
          //   // }
          // }
          // if (doc._doc.searchHistory && doc._doc.searchHistory.length > 0) {
          //   let loadedSearchHistory = [];
          //   doc._doc.searchHistory.sort((a, b) => (a.date < b.date ? 1 : -1));
          //   // for (const history of doc._doc.searchHistory) {
          //   //   try {
          //   //     console.log(history.url);
          //   //     loadedSearchHistory.push({
          //   //       url: history.url,
          //   //       dateOfViewing: history.date.toDateString(),
          //   //       date: history.date,
          //   //       name: urlToName(history.url),
          //   //     });
          //   //     const groupedSearchHistory = groupArray(
          //   //       loadedSearchHistory,
          //   //       "dateOfViewing"
          //   //     );
          //   //     console.log(groupedSearchHistory);
          //   //     // req.session.user.searchHistory = loadedSearchHistory;
          //   //     doc._doc.searchHistory = groupedSearchHistory;
          //   //   } catch (err) {
          //   //     console.log(
          //   //       "Error occurred while processing user data => ",
          //   //       err
          //   //     );
          //   //   }
          //   // }
          // }
          data_to_send.push(doc);
        }
        console.log("*********************************");
        // console.log(docs);
        Customer.find(query)
          .countDocuments()
          .then(
            (doc) => {
              count = doc;
              // console.log("registered_buyer = ", data_to_send)
              res.status(200).json({
                success: true,
                message: "Fetched Buyer's list",
                count,
                docs: data_to_send,
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
          message: "Couldn't fetch the Buyer's list",
        });
      }
    );
});

// get list of leads buyers - not used anywhere
router.post("/get/leads", function (req, res) {
  var sortBy = req.body.sortBy;
  var sortForm = req.body.sortForm;
  var count;
  var pageIndex = req.body.pageIndex;
  var recordLimit = req.body.recordLimit;
  var skipRecords = (pageIndex - 1) * recordLimit;
  var query = {};
  var mainQuery = {};
  let q = req.body.param;

  if (req.body.hasOwnProperty("param") && q.search.length > 0) {
    query["$or"] = [];
    query["$or"].push({ name: new RegExp(q.search, "i") });
    query["$or"].push({ email: new RegExp(q.search, "i") });
    query["$or"].push({ username: new RegExp(q.search, "i") });
    if (!mainQuery.hasOwnProperty("$and")) {
      mainQuery["$and"] = [];
    }
    mainQuery["$and"].push(query);
  }

  // setting sortBy key in sort object as a variable
  let sortObj = {};
  sortObj[sortBy] = sortForm;

  Buyer.LeadSchema.find(mainQuery)
    .sort(sortObj)
    .skip(skipRecords)
    .limit(recordLimit)
    .then(
      (docs) => {
        Buyer.LeadSchema.find(query)
          .count()
          .then(
            (doc) => {
              count = doc;
              // console.log(docs);
              res.status(200).json({
                success: true,
                message: "Fetched Buyer's list",
                count,
                docs,
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
          message: "Couldn't fetch the Buyer's list",
        });
      }
    );
});

module.exports = router;
