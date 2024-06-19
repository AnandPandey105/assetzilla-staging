const express = require("express");
const router = express.Router();
AlphaId = require("../../classes/alphaId");
Elastic = require("../../classes/elasticsearch");
const nodemailer = require("nodemailer");
const Newsletter = require("../../models/newsletter");
const Templates = require("./template");
const Handlebars = require("handlebars");
var csv = require("csv");
var moment = require("moment");
const appconstants = require("../../appConstants");
const renderMessageFromTemplateAndVariables = (templateData, variablesData) => {
  return Handlebars.compile(templateData)(variablesData);
};

const transporter = nodemailer.createTransport(appconstants.nodemailerAuth);

router.post("/add", function (req, res) {
  const sendEmail = () => {
    var mailOptions = {
      from: appconstants.emailFrom,
      to: data.email,
      subject: null,
      html: null,
    };
    mailOptions.subject = Templates.newsletterSubscribe.subject;
    mailOptions.html = renderMessageFromTemplateAndVariables(
      Templates.newsletterSubscribe.html,
      {
        email: data.email,
      }
    );
    if (process.env.STAGING === 'false'){
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log("Error sending emails", error);
        } else {
          console.log("Email sent successfully: " + info.response);
        }
      });
    }
    res.status(200).json({
      success: true,
      message: "<strong>To explore latest Infra related news and regulations in your city, you can explore our</strong><br> <a href='/news' target='_blank'>News Section</a>",
      title:"Thanks for subscribing to our weekly newsletters!"
    });
  };

  let data = req.body;
  let date = new Date();
  let id = AlphaId.encode(date.getTime());
  data.id = id;
  data.email = data.email.toLowerCase()
  console.log("data is", data);
  var newsletter = new Newsletter();
  Object.assign(newsletter, data);
  newsletter.save().then(
    (doc) => {
      sendEmail();
    },
    async (e) => {
      console.log("Error occured", e);
      console.log("Checking if the user already has subscribed ...");
      await Newsletter.findOne({ email: data.email.toLowerCase() })
        .then(async (foundUser) => {
          console.log("user already exists, checking their status ...");
          if (foundUser.isSubscribed) {
            console.log("user has already subscribed");
            res.status(200).json({
              success: false,
              message: "You are already subscribed to our newsletter.",
            });
          } else {
            console.log(
              "user had earlier unsubscribed, re subscribing them now ..."
            );
            Newsletter.findOneAndUpdate(
              { email: data.email.toLowerCase() },
              { $set: { isSubscribed: true } },
              { new: true }
            )
              .then((successResponse) => {
                if (successResponse) {
                  console.log("User is now subscribed");
                  sendEmail();
                }
              })
              .catch((failureResponse) => {
                console.log(
                  "Some error occured and it should not have : ",
                  failureResponse
                );
                res.status(200).json({
                  success: false,
                  message: "Couldn't save newsletter subscription",
                });
              });
          }
        })
        .catch((userNotFound) => {
          res.status(200).json({
            success: false,
            message: "Couldn't save newsletter subscription",
          });
        });
    }
  );
});

router.get("/download", function (req, res) {
  let cursor = Newsletter.find({});

  const transformer = (obj) => {
    return {
      Email: obj.email,
      "Subscribed At": moment(obj.created).format("DD MMM YYYY"),
    };
  };

  const filename = "Newsletter_Subscriber_list.csv";

  // Set approrpiate download headers
  res.setHeader("Content-disposition", `attachment; filename=${filename}`);
  res.writeHead(200, { "Content-Type": "text/csv" });

  // Flush the headers before we start pushing the CSV content
  res.flushHeaders();
  // Pipe/stream the query result to the response via the CSV transformer stream
  cursor
    .stream()
    .pipe(csv.transform(transformer))
    .pipe(csv.stringify({ header: true }))
    .pipe(res);
});

// get list of leads buyers
router.post("/get", function (req, res) {
  console.log("Newsletter*****");
  var sortBy = req.body.sortBy;
  var sortForm = req.body.sortForm;
  var count;
  var pageIndex = req.body.pageIndex;
  var recordLimit = req.body.recordLimit;
  var skipRecords = (pageIndex - 1) * recordLimit;
  var query = {};
  if (req.body.filter){
    query = {...query, ...req.body.filter}
  }
  var mainQuery = {};
  if (req.body.filter){
    mainQuery = {...mainQuery, ...req.body.filter}
  }
  let q = req.body.param;

  if (req.body.hasOwnProperty("param") && q.search.length > 0) {
    query["$or"] = [];
    query["$or"].push({ email: new RegExp(q.search, "i") });
    if (!mainQuery.hasOwnProperty("$and")) {
      mainQuery["$and"] = [];
    }
    mainQuery["$and"].push(query);
  }


  // setting sortBy key in sort object as a variable
  let sortObj = {};
  sortObj[sortBy] = sortForm;

  Newsletter.find(mainQuery)
    .sort(sortObj)
    .skip(skipRecords)
    .limit(recordLimit)
    .then(
      (docs) => {
        Newsletter.find(query)
          .count()
          .then(
            (doc) => {
              count = doc;
              res.status(200).json({
                success: true,
                message: "Fetched Newsletter subscribers's list",
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
          message: "Couldnt fetch the subscribers's list",
        });
      }
    );
});

module.exports = router;
