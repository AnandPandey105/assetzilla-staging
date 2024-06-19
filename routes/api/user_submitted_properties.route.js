const express = require("express");
const router = express.Router();

const appconstants = require("../../appConstants");
const moment = require("moment");
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport(appconstants.nodemailerAuth);

const { getPropertiesAvailable } = require("./__helper");
const { addToNewsletter } = require("../api/__helper");
const AlphaId = require("../../classes/alphaId");

const userSubmittedProperties = require("../../models/user_submitted_properties.model");
const Customer = require("../../models/customer.model");
const Property = require("../../models/property.model");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

let removePercent20 = (str) => {
  while (str.includes("%20")) {
    str = str.replace("%20", " ");
  }
  return str;
};

// -------------------------------------------------------------------------------

router.get("/get_caseid", function (req, res) {
  userSubmittedProperties.distinct("case_id_display").then((doc, err) => {
    if (err) {
      res.status(200).json({
        success: false,
        message: "Something Went Wrong. Please Try Again",
      });
    } else {
      res.status(200).json({
        success: true,
        data: doc,
      });
    }
  });
});

router.post("/sendSellYourPropertyOtp", function (req, res) {
  console.log("5455", req.body.mobile);
  var sendOTPPath =
    "/api/sendotp.php?sender=" +
    sender +
    "&message=" +
    sellYourPropertymessage +
    "&mobile=" +
    req.body.mobile +
    "&authkey=" +
    authKey;
  var options = {
    method: "POST",
    hostname: "control.msg91.com",
    port: null,
    path: sendOTPPath,
    headers: {},
  };
  var req_ = http.request(options, function (res_) {
    var chunks = [];
    res_.on("data", function (chunk) {
      chunks.push(chunk);
    });

    res_.on("end", function () {
      var body = Buffer.concat(chunks);
      var resType = JSON.parse(body.toString()).type;

      if (resType == "success") {
        res.status(200).json({
          success: true,
        });
      } else {
        res.status(200).json({
          success: false,
        });
      }
    });
  });
  req_.end();
});

router.post("/sellYourPropertyOtpValidate", function (req, res) {
  var verifyOTPPath =
    "/api/verifyRequestOTP.php?authkey=" +
    authKey +
    "&mobile=" +
    req.body.mobile +
    "&otp=" +
    req.body.otp;
  var options = {
    method: "POST",
    hostname: "control.msg91.com",
    port: null,
    path: verifyOTPPath,
    headers: {},
  };
  var req_ = http.request(options, function (res_) {
    var chunks = [];

    res_.on("data", function (chunk) {
      chunks.push(chunk);
    });

    res_.on("end", function () {
      var body = Buffer.concat(chunks);
      var resType = JSON.parse(body.toString()).type;
      var resMessage = JSON.parse(body.toString()).message;
      if (resMessage == "otp_verified" && resType == "success") {
        res.status(200).json({
          success: true,
          message: "OTP Verification successfull",
        });
      } else {
        res.status(200).json({
          success: false,
          message: " OTP Verification Failed",
        });
      }
    });
  });
  req_.end();
});

router.post("/sendEditYourPropertyOtp", function (req, res) {
  console.log("5455", req.body.mobile);
  var sendOTPPath =
    "/api/sendotp.php?sender=" +
    sender +
    "&message=" +
    editYourPropertymessage +
    "&mobile=" +
    req.body.mobile +
    "&authkey=" +
    authKey;
  var options = {
    method: "POST",
    hostname: "control.msg91.com",
    port: null,
    path: sendOTPPath,
    headers: {},
  };
  var req_ = http.request(options, function (res_) {
    var chunks = [];
    res_.on("data", function (chunk) {
      chunks.push(chunk);
    });

    res_.on("end", function () {
      var body = Buffer.concat(chunks);
      var resType = JSON.parse(body.toString()).type;

      if (resType == "success") {
        res.status(200).json({
          success: true,
        });
      } else {
        res.status(200).json({
          success: false,
        });
      }
    });
  });
  req_.end();
});

router.post("/editYourPropertyOtpValidate", function (req, res) {
  var verifyOTPPath =
    "/api/verifyRequestOTP.php?authkey=" +
    authKey +
    "&mobile=" +
    req.body.mobile +
    "&otp=" +
    req.body.otp;
  var options = {
    method: "POST",
    hostname: "control.msg91.com",
    port: null,
    path: verifyOTPPath,
    headers: {},
  };
  var req_ = http.request(options, function (res_) {
    var chunks = [];

    res_.on("data", function (chunk) {
      chunks.push(chunk);
    });

    res_.on("end", function () {
      var body = Buffer.concat(chunks);
      var resType = JSON.parse(body.toString()).type;
      var resMessage = JSON.parse(body.toString()).message;
      if (resMessage == "otp_verified" && resType == "success") {
        res.status(200).json({
          success: true,
          message: "OTP Verification successfull",
        });
      } else {
        res.status(200).json({
          success: false,
          message: " OTP Verification Failed",
        });
      }
    });
  });
  req_.end();
});

//edited ~~
router.post("/delete_submitted_property", async function (req, res) {
  try {
    if (req.session.user) {
      let u = await Customer.findOne({
        username: req.session.user.username,
      });
      let propertyDetails = {};
      try {
        propertyDetails = await userSubmittedProperties.findOneAndUpdate(
          { case_id_display: req.body.case_id, user: u._id },
          { isDeleted: true, status: "Archieved" },
          { new: true }
        );
        console.log(propertyDetails);
      } catch (e) {
        console.log(e);
      }
      // let propertyDetails = x.submitted_property;
      // let objIndex = propertyDetails.findIndex(
      //   (obj) => obj.case_id_display == req.body.case_id
      // );

      // propertyDetails[objIndex].isDeleted = true;
      // propertyDetails[objIndex].status = "Archieved";

      // let email = propertyDetails[objIndex].email;

      // let newuser = await CustomerSchema.findOneAndUpdate(
      //   {
      //     username: req.session.user.username,
      //   },
      //   {
      //     submitted_property: propertyDetails,
      //   },
      //   { new: true }
      // );
      // console.log("++++++++++++++++++", newuser);

      await Property.find({ case_id: req.body.case_id }).then(
        async (propertyDocs) => {
          for (var a = 0; a <= propertyDocs.length; a++) {
            if (propertyDocs && propertyDocs[a]) {
              await Property.findOneAndUpdate(
                {
                  //PICK EACH PROJECT AND UPDATE ITS area OBJECT
                  _id: propertyDocs[a]._id,
                },
                {
                  $set: {
                    is_live: "4",
                  },
                },
                { new: true }
              ).then(
                async (data) => {
                  var clonedObj = { ...data };
                  delete clonedObj._doc._id;
                  await Elastic.delete_entity({
                    match_phrase: { url: clonedObj._doc.url },
                  }).then(
                    async (resp) => {
                      clonedObj._doc.doc_type = "property";
                      clonedObj._doc.unique = 1;
                      await Elastic.create_entitiy(clonedObj._doc).then(
                        async (resp) => {
                          console.log(
                            "_____________________________________________________________________________"
                          );
                        },
                        async (err) => {
                          console.log("error white creating", err);
                        }
                      );
                    },
                    async (error) => {
                      console.log("error white deleting", error);
                    }
                  );
                },
                (updateErr) => console.log("updateErr", updateErr)
              );
            }
          }
        }
      );

      let userEmailTemplate = `<!doctype html>
        <html lang="en">
        
        <head>
            <!-- Required meta tags -->
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@100;400;700&display=swap" rel="stylesheet">
            <title>Assets Zilla</title>
            <style>
                *,
                ::after,
                ::before {
                    box-sizing: border-box;
                }
            </style>
        </head>
        
        <body
            style="background: #f4f4f4;font-size: 15px;line-height:20px; width: 100%; float: left;overflow-x: hidden;margin: 0; padding: 0; padding-bottom: 12px">
            <div style="max-width:650px; margin:0 auto;background:white;font-family: 'Poppins', sans-serif;">
                <div
                    style="width:100%;float:left;margin-top:10px;background: #f3f9ff;padding:10px 28px;box-sizing: border-box;">
                    <div style="width:100%;float:left;text-align: center;padding-top: 50px;">
                        <a href="https://assetzilla.com/"><img
                                src="https://assetzilla-bucket.s3.amazonaws.comtemplate/logo.webp"
                                style="text-align: center;margin: 0 auto;height: 60px;object-fit: contain;"></a>
                    </div>
                    <div style="width:100%;float:left;text-align:center; line-height: 30px;">
                        <h4 style="margin-top: 20px;font-size: 24px;color: #7EB041;font-weight: 600; padding: 20px; padding-bottom:10px;">Property Deleted</h4>
                        

                        <div
                            style="background: #FFFFFF;box-shadow: 0 2px 10px 3px #F6F6F6;border-radius: 29px;padding: 15px;margin-bottom:25px;">
                            <h4
                                style="font-size: 18px;color: #6A6A6A;text-align: center;margin-top: 30px;margin-bottom: 0px;font-weight: 500;">
                                Thanks for submitting property.</h4>
                            <h4
                                style="font-size: 18px;color: #6A6A6A;text-align: center;margin-top: 10px;margin-bottom: 0px;font-weight: 500;">
                                We will contact you soon!</h4>
                                <h4 style="font-size: 18px;color: #000;text-align: center;margin-top: 20px;margin-bottom: 8px; ${
                                  !propertyDetails.property_name
                                    ? "display: none"
                                    : ""
                                }">
                                Project/Society Name: ${
                                  propertyDetails.property_name
                                }</h4>
                            <h4 style="font-size: 18px;color: #000;text-align: center;margin-top: 0px;margin-bottom: 10px; ${
                              !propertyDetails.builder ? "display: none" : ""
                            }">
                                Builder Name: ${propertyDetails.builder}</h4>
                        </div>
                        <div style="padding: 20px 15px; text-align: left; margin-bottom: 35px;">
                            <h5 style="font-size: 18px;color: #000; margin: 0; text-align: center;">More Details</h2>
                                <ul style="padding-left: 0;list-style: none; text-align: center;">
                                    <li style="font-size: 18px;padding: 5px 0px; ${
                                      !propertyDetails.property_type
                                        ? "display: none"
                                        : ""
                                    }">Property Type: <span>${
        propertyDetails.property_type
      }</span>
                                    </li>
                                    <li style="font-size: 18px;padding: 5px 0px; ${
                                      !propertyDetails.city
                                        ? "display: none"
                                        : ""
                                    }">Locality & City: <span>${
        propertyDetails.locality
      } & ${propertyDetails.city}</span></li>
                                    <li style="font-size: 18px;padding: 5px 0px; ${
                                      !propertyDetails.size
                                        ? "display: none"
                                        : ""
                                    }">Price & Size: <span>${
        propertyDetails.price
      } & ${propertyDetails.size}</span></li>
                                    <li style="font-size: 18px;padding:5px 0px;">Phone: <span>${
                                      propertyDetails.username
                                    }</span></li>
                                    <li style="font-size: 18px;padding: 5px 0px;">Email: <span>${
                                      propertyDetails.email
                                    }</span></li>
                                    
                                    <li style="font-size: 18px;padding: 5px 0px;">Deleted on: <span>${moment(
                                      Date.now()
                                    ).format("dddd, MMMM Do YYYY")}</span></li>
        
                                    
                                </ul>
                        </div>
                        <a href="https://assetzilla.com/"><img
                                src="https://assetzilla-bucket.s3.amazonaws.com/email-template/logo.png"
                                style="width:80px;"></a>
                        <ul style="list-style: none;padding-left: 0;">
                            <li style="display: inline-block;margin-right: 30px;"><a
                                    style="font-size: 12px;color: #347BBF;text-align: center;line-height: 20px;font-weight: 600; text-decoration: none;"
                                    href="javascript:;">seller@assetzilla.com</a></li>
                            
                            <li style="display: inline-block;margin-right: 0px;"><a
                                    style="font-size: 12px;color: #347BBF;text-align: center;line-height: 20px;font-weight: 600; text-decoration: none;"
                                    href="javascript:;"> support@assetzilla.com  </a></li>
                        </ul>
        
                        <ul style="list-style: none;padding-left: 0;padding-top: 5px;">
                            <li style="display: inline-block;margin-right: 30px;"><a
                                    href="https://www.facebook.com/AssetZilla-102693262614064/?modal=admin_todo_tour"><img
                                        src="https://assetzilla-bucket.s3.amazonaws.com/email-template/f-icon.png"
                                        alt=""></a></li>
                                        <!--<li style="display: inline-block;margin-right: 30px;">
                                        <a href="https://www.linkedin.com/company/assetzilla/about/?viewAsMember=true"><img src="https://assetzilla-bucket.s3.amazonaws.com/email-template/lk-icon.png" alt=""></a>
                                    </li>-->
                                    <li style="display: inline-block;margin-right: 30px;">
                                      <a href="https://www.instagram.com/assetzilla/"><img src="https://assetzilla-bucket.s3.amazonaws.com/email-template/instagram_.png" width="26px" alt=""></a>
                                    </li>
                            
                        </ul>
                    </div>
        
                </div>
            </div>
        </body>
        
        </html>`;

      let adminEmailTemplate = `<!doctype html>
        <html lang="en">
        
        <head>
            <!-- Required meta tags -->
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@100;400;700&display=swap" rel="stylesheet">
            <title>Assets Zilla</title>
            <style>
                *,
                ::after,
                ::before {
                    box-sizing: border-box;
                }
            </style>
        </head>
        
        <body
            style="background: #f4f4f4;font-size: 15px;line-height:20px; width: 100%; float: left;overflow-x: hidden;margin: 0; padding: 0; padding-bottom: 12px">
            <div style="max-width:650px; margin:0 auto;background:white;font-family: 'Poppins', sans-serif;">
                <div
                    style="width:100%;float:left;margin-top:10px;background: #f3f9ff;padding:10px 28px;box-sizing: border-box;">
                    <div style="width:100%;float:left;text-align: center;padding-top: 50px;">
                        <a href="https://assetzilla.com/"><img
                                src="https://assetzilla-bucket.s3.amazonaws.com/email-template/logo.png"
                                style="text-align: center;margin: 0 auto;height: 60px;object-fit: contain;"></a>
                    </div>
                    <div style="width:100%;float:left;text-align:center; line-height: 30px;">
                        <h4 style="margin-top: 20px;font-size: 24px;color: #7EB041;font-weight: 600; padding: 20px; padding-bottom:10px;">Property Submitted</h4>
                        

                        <div
                            style="background: #FFFFFF;box-shadow: 0 2px 10px 3px #F6F6F6;border-radius: 29px;padding: 15px;margin-bottom:25px;">
                            <h4
                                style="font-size: 18px;color: #6A6A6A;text-align: center;margin-top: 30px;margin-bottom: 0px;font-weight: 500;">
                                A property has been deleted.</h4>
                            <h4
                                style="font-size: 18px;color: #6A6A6A;text-align: center;margin-top: 10px;margin-bottom: 0px;font-weight: 500;">
                                Case Id: ${propertyDetails.case_id_display}</h4>
                                <h4 style="font-size: 18px;color: #000;text-align: center;margin-top: 20px;margin-bottom: 8px;${
                                  !propertyDetails.property_name
                                    ? "display: none"
                                    : ""
                                } ">
                                Project/Society Name: ${
                                  propertyDetails.property_name
                                }</h4>
                            <h4 style="font-size: 18px;color: #000;text-align: center;margin-top: 0px;margin-bottom: 10px;${
                              !propertyDetails.builder ? "display: none" : ""
                            } ">
                                Builder Name: ${propertyDetails.builder}</h4>
                        </div>
                        <div style="padding: 20px 15px; text-align: left; margin-bottom: 35px;">
                            <h5 style="font-size: 18px;color: #000; margin: 0; text-align: center;">More Details</h2>
                                <ul style="padding-left: 0;list-style: none; text-align: center;">
                                    <li style="font-size: 18px;padding: 5px 0px; ${
                                      !propertyDetails.property_type
                                        ? "display: none"
                                        : ""
                                    }">Property Type: <span>${
        propertyDetails.property_type
      }</span>
                                    </li>
                                    <li style="font-size: 18px;padding: 5px 0px; ${
                                      !propertyDetails.city
                                        ? "display: none"
                                        : ""
                                    }">Locality & City: <span>${
        propertyDetails.locality
      } & ${propertyDetails.city}</span></li>
                                    <li style="font-size: 18px;padding: 5px 0px; ${
                                      !propertyDetails.size
                                        ? "display: none"
                                        : ""
                                    }">Price & Size: <span>${
        propertyDetails.price
      } & ${propertyDetails.size}</span></li>
                                    <li style="font-size: 18px;padding:5px 0px;">Phone: <span>${
                                      propertyDetails.username
                                    }</span></li>
                                    <li style="font-size: 18px;padding: 5px 0px;">Email: <span>${
                                      propertyDetails.email
                                    }</span></li>
                                    
                                    <li style="font-size: 18px;padding: 5px 0px;">Deleted on: <span>${moment(
                                      Date.now()
                                    ).format("dddd, MMMM Do YYYY")}</span></li>
        
                                    
                                </ul>
                        </div>
                        <a href="https://assetzilla.com/"><img
                                src="https://assetzilla-bucket.s3.amazonaws.com/email-template/logo.png"
                                style="width:80px;"></a>
                        <ul style="list-style: none;padding-left: 0;">
                            <li style="display: inline-block;margin-right: 30px;"><a
                                    style="font-size: 12px;color: #347BBF;text-align: center;line-height: 20px;font-weight: 600; text-decoration: none;"
                                    href="javascript:;">seller@assetzilla.com</a></li>
                            
                            <li style="display: inline-block;margin-right: 0px;"><a
                                    style="font-size: 12px;color: #347BBF;text-align: center;line-height: 20px;font-weight: 600; text-decoration: none;"
                                    href="javascript:;"> support@assetzilla.com  </a></li>
                        </ul>
        
                        <ul style="list-style: none;padding-left: 0;padding-top: 5px;">
                            <li style="display: inline-block;margin-right: 30px;"><a
                                    href="https://www.facebook.com/AssetZilla-102693262614064/?modal=admin_todo_tour"><img
                                        src="https://assetzilla-bucket.s3.amazonaws.com/email-template/f-icon.png"
                                        alt=""></a></li>
                                        <!--<li style="display: inline-block;margin-right: 30px;">
                                        <a href="https://www.linkedin.com/company/assetzilla/about/?viewAsMember=true"><img src="https://assetzilla-bucket.s3.amazonaws.com/email-template/lk-icon.png" alt=""></a>
                                    </li>-->
                                    <li style="display: inline-block;margin-right: 30px;">
                                      <a href="https://www.instagram.com/assetzilla/"><img src="https://assetzilla-bucket.s3.amazonaws.com/email-template/instagram_.png" width="26px" alt=""></a>
                                    </li>
                            
                        </ul>
                    </div>
        
                </div>
            </div>
        </body>
        
        </html>`;

      var mailOptions3 = {
        from: appconstants.emailFrom,
        to: appconstants.emailTo,
        subject: appconstants.subjectForDeletingProperty.admin,
        html: adminEmailTemplate,
      };

      if (process.env.STAGING === "false") {
        transporter.sendMail(mailOptions3, function (error, info) {
          if (error) {
            console.log("Error sending emails", error);
          } else {
            console.log("Email sent successfully: " + info.response);
          }
        });
      }

      var mailOptions4 = {
        from: appconstants.emailFrom,
        to: propertyDetails.email,
        subject: appconstants.subjectForDeletingProperty.user,
        html: userEmailTemplate,
      };

      if (process.env.STAGING === "false") {
        transporter.sendMail(mailOptions4, function (error, info) {
          if (error) {
            console.log("Error sending emails", error);
          } else {
            console.log("Email sent successfully: " + info.response);
          }
        });
      }

      res.status(200).json({
        success: true,
        message: "Project Submitted",
      });
    } else {
      res.status(200).json({
        success: false,
        message: "Something Went Wrong. Please Try Again",
      });
    }
  } catch (err) {
    console.log("==========", err);
  }
});

//no need to edit
router.post("/getLink", async function (req, res) {
  console.log("++++++++++++++++++++", req.body.caseId);

  Property.findOne({
    $or: [{ case_id: req.body.caseId }, { case_id: req.body.caseIdDisplay }],
  }).then(
    (doc) => {
      // console.log(doc);
      if (doc) {
        res.send({
          success: true,
          url: doc.url,
        });
      } else {
        res.send({
          success: false,
          message: "No property found",
        });
      }
    },
    (err) => {
      res.send({
        success: false,
        err: err,
      });
    }
  );
});

//edited
router.post("/get", async function (req, res) {
  console.log("User Submitted Properties List*****");
  var sortBy = req.body.sortBy;
  var sortForm = req.body.sortForm;
  var cityFilter = req.body.cityFilter;
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

  if (req.body.hasOwnProperty("param") && q.search.length > 0) {
    let temp_q = {};
    temp_q["$or"] = [];

    temp_q["$or"].push({ name: new RegExp(q.search, "i") });
    temp_q["$or"].push({ "country.code": new RegExp(q.search, "i") });
    temp_q["$or"].push({ "country.name": new RegExp(q.search, "i") });
    temp_q["$or"].push({ "user.name": new RegExp(q.search, "i") });
    temp_q["$or"].push({ "user.username": new RegExp(q.search, "i") });
    temp_q["$or"].push({ username: new RegExp(q.search, "i") });
    temp_q["$or"].push({ email: new RegExp(q.search, "i") });
    temp_q["$or"].push({ case_id_display: new RegExp(q.search, "i") });
    temp_q["$or"].push({ property_name: new RegExp(q.search, "i") });
    temp_q["$or"].push({ property_type: new RegExp(q.search, "i") });
    temp_q["$or"].push({ builder: new RegExp(q.search, "i") });
    temp_q["$or"].push({ city: new RegExp(q.search, "i") });
    temp_q["$or"].push({ userSubmittedCity: new RegExp(q.search, "i") });
    temp_q["$or"].push({ size: new RegExp(q.search, "i") });
    temp_q["$or"].push({ price: new RegExp(q.search, "i") });
    temp_q["$or"].push({ status: new RegExp(q.search, "i") });
    temp_q["$or"].push({ latestStatus: new RegExp(q.search, "i") });
    temp_q["$or"].push({ latestSubStatus: new RegExp(q.search, "i") });

    let customerQuery = {};
    customerQuery["$or"] = [];
    customerQuery["$or"].push({ username: new RegExp(q.search, "i") });
    customerQuery["$or"].push({ name: new RegExp(q.search, "i") });

    const customers = await Customer.find(customerQuery, {
      name: 1,
      username: 1,
      _id: 1,
    });
    if (customers && customers.length > 0) {
      for (const customer of customers) {
        temp_q["$or"].push({ user: customer._id });
      }
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

  let sortObj = {};
  sortObj[sortBy] = sortForm;

  console.log(req.body.param);

  try {
    const docs = await userSubmittedProperties
      .find(mainQuery)
      .sort(sortObj)
      .skip(skipRecords)
      .limit(recordLimit)
      .populate("user");

    if (docs) {
      console.log(docs);
      count = await userSubmittedProperties.find(query).count();
      const allCustomers = await Customer.find({}).sort({ name: -1 });
      let matchQuery = {};
      if (query["$and"]) {
        matchQuery = query["$and"][0];
      } else if (query["$or"] && !Array.isArray(query["$or"])) {
        matchQuery = query["$or"];
      }
      if (query.city) {
        matchQuery["city"] = query["city"];
      }
      if (query.user) {
        matchQuery["user"] = new ObjectId(query.user);
      }
      if (query.status) {
        matchQuery["status"] = query["status"];
      }
      const agg = await userSubmittedProperties.aggregate([
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
        const agg = await userSubmittedProperties.aggregate([
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
        message: "Fetched User Submitted Properties list",
        count,
        docs: docs,
        hasFullAccess: true,
        allCustomers,
        aggObjStatus,
        aggObjSubStatus,
      });
    } else {
      throw new Error("Nothing found");
    }
  } catch (e) {
    console.log(e);
    res.status(200).json({
      success: false,
      message: "Error occurred while fetching User Submitted Properties list",
      count,
      docs: [],
      hasFullAccess: true,
    });
  }
});

//edited (not tested)
router.get("/getSubmittedPropertyDetails/:case_id", async function (req, res) {
  try {
    let doc = await userSubmittedProperties
      .findOne({ case_id_display: req.params.case_id })
      .populate("user");
    if (doc) {
      // console.log(doc);
      doc._doc.realUsername = doc._doc.user._doc.username;
      let responseObject = {
        success: true,
        data: doc._doc,
      };
      res.send(responseObject);
    } else {
      res.send({
        success: false,
        message: "No property found",
      });
    }
  } catch (e) {
    console.log(e);
    res.send({
      success: false,
      err: err,
    });
  }
});

//no need to edit
router.post("/getPropertyDetailsAddedByAdmin", async function (req, res) {
  try {
    let doc = await Property.find({ case_id: req.body.case_id });

    if (doc.length > 0) {
      let resp = {};
      resp.results = doc[0];
      res.send({
        success: true,
        data: doc[0],
      });
      //res.render('pages/v1/profile', resp);
    } else {
      res.send({
        success: false,
        message: "No property found",
      });
    }
  } catch (err) {
    console.log("err", err);
  }
});

//not editing because it is not being hit, it is commented in profile
router.post("/getMobileNoForEditProperty", async function (req, res) {
  try {
    if (req.session.user) {
      let x = await CustomerSchema.findOne({
        username: req.session.user.username,
      });
      let propertyDetails = x.submitted_property;
      let objIndex = propertyDetails.findIndex(
        (obj) => obj.case_id_display == req.body.case_id
      );

      res.send({
        success: true,
        data: propertyDetails[objIndex].username,
      });
    } else {
      res.status(200).json({
        success: false,
        message: "Something Went Wrong. Please Try Again",
      });
    }
  } catch (err) {
    console.log("==========", err);
  }
});

//edited
router.post("/addmappedcity", async function (req, res) {
  // console.log(req.body);
  let isUserAnnonymous = req.body.username === "0000000000";
  console.log(isUserAnnonymous);

  try {
    let relevantUSP = await userSubmittedProperties.findOne({
      case_id: req.body.caseid,
    });

    if (relevantUSP) {
      let usc = relevantUSP.city;
      let c = req.body.city;

      let updatedUSP = await userSubmittedProperties.findOneAndUpdate(
        { case_id: req.body.caseid },
        { userSubmittedCity: usc, city: c },
        { new: true }
      );
      if (updatedUSP) {
        console.log("Mapped the city successfully", updatedUSP);
        res
          .status(200)
          .json({ success: true, message: "City mapping successful" });
      } else {
        res.status(200).json({
          success: false,
          message:
            "Something went wrong | Null when updating | Could not happen",
        });
      }
    } else {
      res.status(200).json({
        success: false,
        message: "This case Id has no property associated with it",
      });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
});

//edited
router.post("/addNotes", async function (req, res) {
  try {
    console.log("Adding these notes in User Submitted Property: ", req.body);
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

    try {
      let foundProperty = await userSubmittedProperties.findOne({
        _id: req.body.data._id,
      });
      if (foundProperty) {
        let oldHistory = foundProperty.history;
        oldHistory.push(newHistory);
        let updatedProperty = await userSubmittedProperties.findOneAndUpdate(
          { _id: req.body.data._id },
          {
            history: oldHistory,
            latestStatus: newHistory.status,
            latestSubStatus: newHistory.subStatus,
          },
          { new: true }
        );
        if (updatedProperty) {
          console.log("History updated successfully", foundProperty);
          res
            .status(200)
            .json({ success: true, message: "Successfully updated" });
        } else {
          console.log("Received null during update, could not happen");
          res.status(200).json({
            success: false,
            message: "Error: Received null during update",
          });
        }
      } else {
        console.log("Fetching customer returned null");
        res.status(200).json({
          success: false,
          message: "No customer found with this id",
        });
      }
    } catch (e) {
      console.log("Error occurred while processing the request", e);
      res.status(200).json({
        success: false,
        message: "Error while searching the customer.",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(200).json({
      success: false,
      message: "Some Error Occured",
      err,
    });
  }
});

//edited
router.post("/submit", async function (req, res) {
  if (req.session.user) {
    console.log("you're here", req.body.property_images);
    let payload = {};
    payload.newsletter = req.body.newsletter;
    payload.username = req.body.username;
    payload.email = req.body.email;
    payload.property_name = req.body.property_name;
    payload.property_type = req.body.property_type;
    payload.country = {
      code: req.body.countryCode,
      name: req.body.countryName,
    };
    payload.builder = req.body.builder;
    payload.locality = req.body.locality;
    payload.city = req.body.city;
    payload.price = req.body.price;
    payload.size = req.body.size;
    payload.isApproved = false;
    payload.isDeleted = false;
    payload.submittedOn = new Date();
    payload.property_images = req.body.property_images;
    payload.status = "Under Review";
    payload.history = [
      {
        notes: "",
        status: "",
        subStatus: "",
        whatsappNumber: req.body.username || req.session.user.username,
        country: payload.country,
        updated: Date.now(),
        updatedBy: "System",
      },
    ];
    // if (req.body.property_name != undefined && req.body.property_name.length > 0) {  }
    // if (req.body.property_type != undefined && req.body.property_type.length > 0) {  }
    // if (req.body.builder != undefined && req.body.builder.length > 0) {  }
    // if (req.body.locality != undefined && req.body.locality.length > 0) {  }
    // if (req.body.city != undefined && req.body.city.length > 0) {  }
    // if (req.body.district != undefined && req.body.district.length > 0) { payload.district = req.body.district }
    // if (req.body.pincode != undefined && req.body.pincode.length > 0) { payload.pincode = req.body.pincode }
    // if (req.body.price != undefined && req.body.price.length > 0) {  }
    // if (req.body.size != undefined && req.body.size.length > 0) {  }
    payload.case_id = "case_" + new Date().getTime();
    payload.case_id_display = AlphaId.encode(
      parseInt(payload.case_id.substr(payload.case_id.length - 9))
    );

    let propertyLastSubmittedAt = new Date();

    let userEmailTemplate = `<!doctype html>
        <html lang="en">
        
        <head>
            <!-- Required meta tags -->
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@100;400;700&display=swap" rel="stylesheet">
            <title>Assets Zilla</title>
            <style>
                *,
                ::after,
                ::before {
                    box-sizing: border-box;
                }
            </style>
        </head>
        
        <body
            style="background: #f4f4f4;font-size: 15px;line-height:20px; width: 100%; float: left;overflow-x: hidden;margin: 0; padding: 0; padding-bottom: 12px">
            <div style="max-width:650px; margin:0 auto;background:white;font-family: 'Poppins', sans-serif;">
                <div
                    style="width:100%;float:left;margin-top:10px;background: #f3f9ff;padding:10px 28px;box-sizing: border-box;">
                    <div style="width:100%;float:left;text-align: center;padding-top: 50px;">
                        <a href="https://assetzilla.com/"><img
                                src="https://assetzilla-bucket.s3.amazonaws.com/email-template/logo.png"
                                style="text-align: center;margin: 0 auto;height: 60px;object-fit: contain;"></a>
                    </div>
                    <div style="width:100%;float:left;text-align:center; line-height: 30px;">
                        <h4 style="margin-top: 20px;font-size: 24px;color: #7EB041;font-weight: 600; padding: 20px; padding-bottom:10px;">Property Submitted</h4>
                        

                        <div
                            style="background: #FFFFFF;box-shadow: 0 2px 10px 3px #F6F6F6;border-radius: 29px;padding: 15px;margin-bottom:25px;">
                            <h4
                                style="font-size: 18px;color: #6A6A6A;text-align: center;margin-top: 30px;margin-bottom: 0px;font-weight: 500;">
                                Thanks for submitting property.</h4>
                            <h4
                                style="font-size: 18px;color: #6A6A6A;text-align: center;margin-top: 10px;margin-bottom: 0px;font-weight: 500;">
                                We will contact you soon!</h4>
                                <h4 style="font-size: 18px;color: #000;text-align: center;margin-top: 20px;margin-bottom: 8px; ${
                                  !req.body.property_name ? "display: none" : ""
                                }">
                                Project/Society Name: ${
                                  req.body.property_name
                                }</h4>
                            <h4 style="font-size: 18px;color: #000;text-align: center;margin-top: 0px;margin-bottom: 10px; ${
                              !req.body.builder ? "display: none" : ""
                            }">
                                Builder Name: ${req.body.builder}</h4>
                        </div>
                        <div style="padding: 20px 15px; text-align: left; margin-bottom: 35px;">
                            <h5 style="font-size: 18px;color: #000; margin: 0; text-align: center;">More Details</h2>
                                <ul style="padding-left: 0;list-style: none; text-align: center;">
                                    <li style="font-size: 18px;padding: 5px 0px; ${
                                      !req.body.property_type
                                        ? "display: none"
                                        : ""
                                    }">Property Type: <span>${
      req.body.property_type
    }</span>
                                    </li>
                                    <li style="font-size: 18px;padding: 5px 0px; ${
                                      !req.body.city ? "display: none" : ""
                                    }">Locality & City: <span>${
      req.body.locality
    } & ${req.body.city}</span></li>
                                    <li style="font-size: 18px;padding: 5px 0px; ${
                                      !req.body.size ? "display: none" : ""
                                    }">Price & Size: <span>${
      req.body.price
    } & ${req.body.size}</span></li>
                                    <li style="font-size: 18px;padding:5px 0px;">Phone: <span>${
                                      req.body.username
                                    }</span></li>
                                    <li style="font-size: 18px;padding: 5px 0px;">Email: <span>${
                                      payload.email
                                    }</span></li>
                                    
                                    <li style="font-size: 18px;padding: 5px 0px;">Submitted on: <span>${moment(
                                      Date.now()
                                    ).format("dddd, MMMM Do YYYY")}</span></li>
        
                                    
                                </ul>
                        </div>
                        <a href="https://assetzilla.com/"><img
                                src="https://assetzilla-bucket.s3.amazonaws.com/email-template/logo.png"
                                style="width:80px;"></a>
                        <ul style="list-style: none;padding-left: 0;">
                            <li style="display: inline-block;margin-right: 30px;"><a
                                    style="font-size: 12px;color: #347BBF;text-align: center;line-height: 20px;font-weight: 600; text-decoration: none;"
                                    href="javascript:;">seller@assetzilla.com</a></li>
                            
                            <li style="display: inline-block;margin-right: 0px;"><a
                                    style="font-size: 12px;color: #347BBF;text-align: center;line-height: 20px;font-weight: 600; text-decoration: none;"
                                    href="javascript:;"> support@assetzilla.com  </a></li>
                        </ul>
        
                        <ul style="list-style: none;padding-left: 0;padding-top: 5px;">
                            <li style="display: inline-block;margin-right: 30px;"><a
                                    href="https://www.facebook.com/AssetZilla-102693262614064/?modal=admin_todo_tour"><img
                                        src="https://assetzilla-bucket.s3.amazonaws.com/email-template/f-icon.png"
                                        alt=""></a></li>
                                        <!--<li style="display: inline-block;margin-right: 30px;">
                                        <a href="https://www.linkedin.com/company/assetzilla/about/?viewAsMember=true"><img src="https://assetzilla-bucket.s3.amazonaws.com/email-template/lk-icon.png" alt=""></a>
                                    </li>-->
                                    <li style="display: inline-block;margin-right: 30px;">
                                      <a href="https://www.instagram.com/assetzilla/"><img src="https://assetzilla-bucket.s3.amazonaws.com/email-template/instagram_.png" width="26px" alt=""></a>
                                    </li>
                            
                        </ul>
                    </div>
        
                </div>
            </div>
        </body>
        
        </html>`;

    let adminEmailTemplate = `<!doctype html>
        <html lang="en">
        
        <head>
            <!-- Required meta tags -->
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@100;400;700&display=swap" rel="stylesheet">
            <title>Assets Zilla</title>
            <style>
                *,
                ::after,
                ::before {
                    box-sizing: border-box;
                }
            </style>
        </head>
        
        <body
            style="background: #f4f4f4;font-size: 15px;line-height:20px; width: 100%; float: left;overflow-x: hidden;margin: 0; padding: 0; padding-bottom: 12px">
            <div style="max-width:650px; margin:0 auto;background:white;font-family: 'Poppins', sans-serif;">
                <div
                    style="width:100%;float:left;margin-top:10px;background: #f3f9ff;padding:10px 28px;box-sizing: border-box;">
                    <div style="width:100%;float:left;text-align: center;padding-top: 50px;">
                        <a href="https://assetzilla.com/"><img
                                src="https://assetzilla-bucket.s3.amazonaws.com/email-template/logo.png"
                                style="text-align: center;margin: 0 auto;height: 60px;object-fit: contain;"></a>
                    </div>
                    <div style="width:100%;float:left;text-align:center; line-height: 30px;">
                        <h4 style="margin-top: 20px;font-size: 24px;color: #7EB041;font-weight: 600; padding: 20px; padding-bottom:10px;">Property Submitted</h4>
                        

                        <div
                            style="background: #FFFFFF;box-shadow: 0 2px 10px 3px #F6F6F6;border-radius: 29px;padding: 15px;margin-bottom:25px;">
                            <h4
                                style="font-size: 18px;color: #6A6A6A;text-align: center;margin-top: 30px;margin-bottom: 0px;font-weight: 500;">
                                A new property has been submitted.</h4>
                            <h4
                                style="font-size: 18px;color: #6A6A6A;text-align: center;margin-top: 10px;margin-bottom: 0px;font-weight: 500;">
                                Case Id: ${payload.case_id_display}</h4>
                                <h4 style="font-size: 18px;color: #000;text-align: center;margin-top: 20px;margin-bottom: 8px;${
                                  !req.body.property_name ? "display: none" : ""
                                } ">
                                Project/Society Name: ${
                                  req.body.property_name
                                }</h4>
                            <h4 style="font-size: 18px;color: #000;text-align: center;margin-top: 0px;margin-bottom: 10px;${
                              !req.body.builder ? "display: none" : ""
                            } ">
                                Builder Name: ${req.body.builder}</h4>
                        </div>
                        <div style="padding: 20px 15px; text-align: left; margin-bottom: 35px;">
                            <h5 style="font-size: 18px;color: #000; margin: 0; text-align: center;">More Details</h2>
                                <ul style="padding-left: 0;list-style: none; text-align: center;">
                                    <li style="font-size: 18px;padding: 5px 0px; ${
                                      !req.body.property_type
                                        ? "display: none"
                                        : ""
                                    }">Property Type: <span>${
      req.body.property_type
    }</span>
                                    </li>
                                    <li style="font-size: 18px;padding: 5px 0px; ${
                                      !req.body.city ? "display: none" : ""
                                    }">Locality & City: <span>${
      req.body.locality
    } & ${req.body.city}</span></li>
                                    <li style="font-size: 18px;padding: 5px 0px; ${
                                      !req.body.size ? "display: none" : ""
                                    }">Price & Size: <span>${
      req.body.price
    } & ${req.body.size}</span></li>
                                    <li style="font-size: 18px;padding:5px 0px;">Phone: <span>${
                                      req.body.username
                                    }</span></li>
                                    <li style="font-size: 18px;padding: 5px 0px;">Email: <span>${
                                      payload.email
                                    }</span></li>
                                    
                                    <li style="font-size: 18px;padding: 5px 0px;">Submitted on: <span>${moment(
                                      Date.now()
                                    ).format("dddd, MMMM Do YYYY")}</span></li>
        
                                    
                                </ul>
                        </div>
                        <a href="https://assetzilla.com/"><img
                                src="https://assetzilla-bucket.s3.amazonaws.com/email-template/logo.png"
                                style="width:80px;"></a>
                        <ul style="list-style: none;padding-left: 0;">
                            <li style="display: inline-block;margin-right: 30px;"><a
                                    style="font-size: 12px;color: #347BBF;text-align: center;line-height: 20px;font-weight: 600; text-decoration: none;"
                                    href="javascript:;">seller@assetzilla.com</a></li>
                            
                            <li style="display: inline-block;margin-right: 0px;"><a
                                    style="font-size: 12px;color: #347BBF;text-align: center;line-height: 20px;font-weight: 600; text-decoration: none;"
                                    href="javascript:;"> support@assetzilla.com  </a></li>
                        </ul>
        
                        <ul style="list-style: none;padding-left: 0;padding-top: 5px;">
                            <li style="display: inline-block;margin-right: 30px;"><a
                                    href="https://www.facebook.com/AssetZilla-102693262614064/?modal=admin_todo_tour"><img
                                        src="https://assetzilla-bucket.s3.amazonaws.com/email-template/f-icon.png"
                                        alt=""></a></li>
                                        <!--<li style="display: inline-block;margin-right: 30px;">
                                        <a href="https://www.linkedin.com/company/assetzilla/about/?viewAsMember=true"><img src="https://assetzilla-bucket.s3.amazonaws.com/email-template/lk-icon.png" alt=""></a>
                                    </li>-->
                                    <li style="display: inline-block;margin-right: 30px;">
                                      <a href="https://www.instagram.com/assetzilla/"><img src="https://assetzilla-bucket.s3.amazonaws.com/email-template/instagram_.png" width="26px" alt=""></a>
                                    </li>
                            
                        </ul>
                    </div>
        
                </div>
            </div>
        </body>
        
        </html>`;

    let user = await Customer.findOne({ username: req.session.user.username });
    if (!user) {
      res.status(200).json({
        success: false,
        message: "Failed to update. Could not find the user.",
      });
    } else {
      payload.user = user._id;
      try {
        let newEntry = await userSubmittedProperties.create(payload);
        if (newEntry) {
          console.log("Added", newEntry);
          Object.assign(
            req.session.user.submitted_property.push(payload),
            payload
          );
          var mailOptions1 = {
            from: appconstants.emailFrom,
            to: appconstants.emailTo,
            subject: appconstants.subjectForAddingProperty.admin,
            html: adminEmailTemplate,
          };
          if (process.env.STAGING === "false") {
            transporter.sendMail(mailOptions1, function (error, info) {
              if (error) {
                console.log("Error sending emails", error);
              } else {
                console.log("Email sent successfully: " + info.response);
              }
            });
          }

          var mailOptions2 = {
            from: appconstants.emailFrom,
            to: payload.email,
            subject: appconstants.subjectForAddingProperty.user,
            html: userEmailTemplate,
          };
          if (process.env.STAGING === "false") {
            transporter.sendMail(mailOptions2, function (error, info) {
              if (error) {
                console.log("Error sending emails", error);
              } else {
                console.log("Email sent successfully: " + info.response);
              }
            });
          }
          if (payload.newsletter) {
            console.log(`Adding ${payload.email} to newsletters database.`);
            await addToNewsletter(payload.email);
          }
          Customer.findOneAndUpdate(
            { _id: user._id },
            { propertyLastSubmittedAt: propertyLastSubmittedAt }
          )
            .then((doc) => console.log("property last submitted at updated"))
            .catch((err) => console.log("Error: " + err));
          res.status(200).json({
            success: true,
            message: "Property Submitted",
            redirect_url: "/sellyourproperty/thankyou-sell"
          });
        }
      } catch (e) {
        console.error(e);
        res.status(200).json({
          success: false,
          message: "Some error occurred",
        });
      }
    }
  } else if (!false) {
    let payload1 = {};
    payload1.newsletter = req.body.newsletter;
    payload1.username = req.body.username;
    payload1.email = req.body.email;
    payload1.property_name = req.body.property_name;
    payload1.property_type = req.body.property_type;
    payload1.country = {
      code: req.body.countryCode,
      name: req.body.countryName,
    };
    payload1.builder = req.body.builder;
    payload1.locality = req.body.locality;
    payload1.city = req.body.city;
    payload1.price = req.body.price;
    payload1.size = req.body.size;
    payload1.isApproved = false;
    payload1.isDeleted = false;
    payload1.history = [
      {
        notes: "",
        status: "",
        subStatus: "",
        whatsappNumber: req.body.username || "0000000000",
        country: payload1.country,
        updated: Date.now(),
        updatedBy: "System",
      },
    ];
    payload1.submittedOn = new Date();
    payload1.status = "Under Review";
    payload1.case_id = "case_" + new Date().getTime();
    payload1.case_id_display = AlphaId.encode(
      parseInt(payload1.case_id.substr(payload1.case_id.length - 9))
    );
    payload1.property_images = req.body.property_images;

    let propertyLastSubmittedAt1 = new Date();

    let userEmailTemplate1 = `<!doctype html>
        <html lang="en">
        
        <head>
            <!-- Required meta tags -->
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@100;400;700&display=swap" rel="stylesheet">
            <title>Assets Zilla</title>
            <style>
                *,
                ::after,
                ::before {
                    box-sizing: border-box;
                }
            </style>
        </head>
        
        <body
            style="background: #f4f4f4;font-size: 15px;line-height:20px; width: 100%; float: left;overflow-x: hidden;margin: 0; padding: 0; padding-bottom: 12px">
            <div style="max-width:650px; margin:0 auto;background:white;font-family: 'Poppins', sans-serif;">
                <div
                    style="width:100%;float:left;margin-top:10px;background: #f3f9ff;padding:10px 28px;box-sizing: border-box;">
                    <div style="width:100%;float:left;text-align: center;padding-top: 50px;">
                        <a href="https://assetzilla.com/"><img
                                src="https://assetzilla-bucket.s3.amazonaws.com/email-template/logo.png"
                                style="text-align: center;margin: 0 auto;height: 60px;object-fit: contain;"></a>
                    </div>
                    <div style="width:100%;float:left;text-align:center; line-height: 30px;">
                        <h4 style="margin-top: 20px;font-size: 24px;color: #7EB041;font-weight: 600; padding: 20px; padding-bottom:10px;">Property Submitted</h4>
                        

                        <div
                            style="background: #FFFFFF;box-shadow: 0 2px 10px 3px #F6F6F6;border-radius: 29px;padding: 15px;margin-bottom:25px;">
                            <h4
                                style="font-size: 18px;color: #6A6A6A;text-align: center;margin-top: 30px;margin-bottom: 0px;font-weight: 500;">
                                Thanks for submitting property.</h4>
                            <h4
                                style="font-size: 18px;color: #6A6A6A;text-align: center;margin-top: 10px;margin-bottom: 0px;font-weight: 500;">
                                We will contact you soon!</h4>
                                <h4 style="font-size: 18px;color: #000;text-align: center;margin-top: 20px;margin-bottom: 8px; ${
                                  !req.body.property_name ? "display: none" : ""
                                }">
                                Project/Society Name: ${
                                  req.body.property_name
                                }</h4>
                            <h4 style="font-size: 18px;color: #000;text-align: center;margin-top: 0px;margin-bottom: 10px; ${
                              !req.body.builder ? "display: none" : ""
                            }">
                                Builder Name: ${req.body.builder}</h4>
                        </div>
                        <div style="padding: 20px 15px; text-align: left; margin-bottom: 35px;">
                            <h5 style="font-size: 18px;color: #000; margin: 0; text-align: center;">More Details</h2>
                                <ul style="padding-left: 0;list-style: none; text-align: center;">
                                    <li style="font-size: 18px;padding: 5px 0px; ${
                                      !req.body.property_type
                                        ? "display: none"
                                        : ""
                                    }">Property Type: <span>${
      req.body.property_type
    }</span>
                                    </li>
                                    <li style="font-size: 18px;padding: 5px 0px; ${
                                      !req.body.city ? "display: none" : ""
                                    }">Locality & City: <span>${
      req.body.locality
    } & ${req.body.city}</span></li>
                                    <li style="font-size: 18px;padding: 5px 0px; ${
                                      !req.body.size ? "display: none" : ""
                                    }">Price & Size: <span>${
      req.body.price
    } & ${req.body.size}</span></li>
                                    <li style="font-size: 18px;padding:5px 0px;">Phone: <span>${
                                      req.body.username
                                    }</span></li>
                                    <li style="font-size: 18px;padding: 5px 0px;">Email: <span>${
                                      payload1.email
                                    }</span></li>
                                    
                                    <li style="font-size: 18px;padding: 5px 0px;">Submitted on: <span>${moment(
                                      Date.now()
                                    ).format("dddd, MMMM Do YYYY")}</span></li>
        
                                    
                                </ul>
                        </div>
                        <a href="https://assetzilla.com/"><img
                                src="https://assetzilla-bucket.s3.amazonaws.com/email-template/logo.png"
                                style="width:80px;"></a>
                        <ul style="list-style: none;padding-left: 0;">
                            <li style="display: inline-block;margin-right: 30px;"><a
                                    style="font-size: 12px;color: #347BBF;text-align: center;line-height: 20px;font-weight: 600; text-decoration: none;"
                                    href="javascript:;">seller@assetzilla.com</a></li>
                            
                            <li style="display: inline-block;margin-right: 0px;"><a
                                    style="font-size: 12px;color: #347BBF;text-align: center;line-height: 20px;font-weight: 600; text-decoration: none;"
                                    href="javascript:;"> support@assetzilla.com  </a></li>
                        </ul>
        
                        <ul style="list-style: none;padding-left: 0;padding-top: 5px;">
                            <li style="display: inline-block;margin-right: 30px;"><a
                                    href="https://www.facebook.com/AssetZilla-102693262614064/?modal=admin_todo_tour"><img
                                        src="https://assetzilla-bucket.s3.amazonaws.com/email-template/f-icon.png"
                                        alt=""></a></li>
                                        <!--<li style="display: inline-block;margin-right: 30px;">
                                        <a href="https://www.linkedin.com/company/assetzilla/about/?viewAsMember=true"><img src="https://assetzilla-bucket.s3.amazonaws.com/email-template/lk-icon.png" alt=""></a>
                                    </li>-->
                                    <li style="display: inline-block;margin-right: 30px;">
                                      <a href="https://www.instagram.com/assetzilla/"><img src="https://assetzilla-bucket.s3.amazonaws.com/email-template/instagram_.png" width="26px" alt=""></a>
                                    </li>
                            
                        </ul>
                    </div>
        
                </div>
            </div>
        </body>
        
        </html>`;

    let adminEmailTemplate1 = `<!doctype html>
        <html lang="en">
        
        <head>
            <!-- Required meta tags -->
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@100;400;700&display=swap" rel="stylesheet">
            <title>Assets Zilla</title>
            <style>
                *,
                ::after,
                ::before {
                    box-sizing: border-box;
                }
            </style>
        </head>
        
        <body
            style="background: #f4f4f4;font-size: 15px;line-height:20px; width: 100%; float: left;overflow-x: hidden;margin: 0; padding: 0; padding-bottom: 12px">
            <div style="max-width:650px; margin:0 auto;background:white;font-family: 'Poppins', sans-serif;">
                <div
                    style="width:100%;float:left;margin-top:10px;background: #f3f9ff;padding:10px 28px;box-sizing: border-box;">
                    <div style="width:100%;float:left;text-align: center;padding-top: 50px;">
                        <a href="https://assetzilla.com/"><img
                                src="https://assetzilla-bucket.s3.amazonaws.com/email-template/logo.png"
                                style="text-align: center;margin: 0 auto;height: 60px;object-fit: contain;"></a>
                    </div>
                    <div style="width:100%;float:left;text-align:center; line-height: 30px;">
                        <h4 style="margin-top: 20px;font-size: 24px;color: #7EB041;font-weight: 600; padding: 20px; padding-bottom:10px;">Property Submitted</h4>
                        

                        <div
                            style="background: #FFFFFF;box-shadow: 0 2px 10px 3px #F6F6F6;border-radius: 29px;padding: 15px;margin-bottom:25px;">
                            <h4
                                style="font-size: 18px;color: #6A6A6A;text-align: center;margin-top: 30px;margin-bottom: 0px;font-weight: 500;">
                                A new property has been submitted.</h4>
                            <h4
                                style="font-size: 18px;color: #6A6A6A;text-align: center;margin-top: 10px;margin-bottom: 0px;font-weight: 500;">
                                Case Id: ${payload1.case_id_display}</h4>
                                <h4 style="font-size: 18px;color: #000;text-align: center;margin-top: 20px;margin-bottom: 8px;${
                                  !req.body.property_name ? "display: none" : ""
                                } ">
                                Project/Society Name: ${
                                  req.body.property_name
                                }</h4>
                            <h4 style="font-size: 18px;color: #000;text-align: center;margin-top: 0px;margin-bottom: 10px;${
                              !req.body.builder ? "display: none" : ""
                            } ">
                                Builder Name: ${req.body.builder}</h4>
                        </div>
                        <div style="padding: 20px 15px; text-align: left; margin-bottom: 35px;">
                            <h5 style="font-size: 18px;color: #000; margin: 0; text-align: center;">More Details</h2>
                                <ul style="padding-left: 0;list-style: none; text-align: center;">
                                    <li style="font-size: 18px;padding: 5px 0px; ${
                                      !req.body.property_type
                                        ? "display: none"
                                        : ""
                                    }">Property Type: <span>${
      req.body.property_type
    }</span>
                                    </li>
                                    <li style="font-size: 18px;padding: 5px 0px; ${
                                      !req.body.city ? "display: none" : ""
                                    }">Locality & City: <span>${
      req.body.locality
    } & ${req.body.city}</span></li>
                                    <li style="font-size: 18px;padding: 5px 0px; ${
                                      !req.body.size ? "display: none" : ""
                                    }">Price & Size: <span>${
      req.body.price
    } & ${req.body.size}</span></li>
                                    <li style="font-size: 18px;padding:5px 0px;">Phone: <span>${
                                      req.body.username
                                    }</span></li>
                                    <li style="font-size: 18px;padding: 5px 0px;">Email: <span>${
                                      payload1.email
                                    }</span></li>
                                    
                                    <li style="font-size: 18px;padding: 5px 0px;">Submitted on: <span>${moment(
                                      Date.now()
                                    ).format("dddd, MMMM Do YYYY")}</span></li>
        
                                    
                                </ul>
                        </div>
                        <a href="https://assetzilla.com/"><img
                                src="https://assetzilla-bucket.s3.amazonaws.com/email-template/logo.png"
                                style="width:80px;"></a>
                        <ul style="list-style: none;padding-left: 0;">
                            <li style="display: inline-block;margin-right: 30px;"><a
                                    style="font-size: 12px;color: #347BBF;text-align: center;line-height: 20px;font-weight: 600; text-decoration: none;"
                                    href="javascript:;">seller@assetzilla.com</a></li>
                            
                            <li style="display: inline-block;margin-right: 0px;"><a
                                    style="font-size: 12px;color: #347BBF;text-align: center;line-height: 20px;font-weight: 600; text-decoration: none;"
                                    href="javascript:;"> support@assetzilla.com  </a></li>
                        </ul>
        
                        <ul style="list-style: none;padding-left: 0;padding-top: 5px;">
                            <li style="display: inline-block;margin-right: 30px;"><a
                                    href="https://www.facebook.com/AssetZilla-102693262614064/?modal=admin_todo_tour"><img
                                        src="https://assetzilla-bucket.s3.amazonaws.com/email-template/f-icon.png"
                                        alt=""></a></li>
                                        <!--<li style="display: inline-block;margin-right: 30px;">
                                        <a href="https://www.linkedin.com/company/assetzilla/about/?viewAsMember=true"><img src="https://assetzilla-bucket.s3.amazonaws.com/email-template/lk-icon.png" alt=""></a>
                                    </li>-->
                                    <li style="display: inline-block;margin-right: 30px;">
                                      <a href="https://www.instagram.com/assetzilla/"><img src="https://assetzilla-bucket.s3.amazonaws.com/email-template/instagram_.png" width="26px" alt=""></a>
                                    </li>
                            
                        </ul>
                    </div>
        
                </div>
            </div>
        </body>
        
        </html>`;

    let user = await Customer.findOne({ username: req.body.username });
    if (!user) {
      user = await Customer.findOne({ username: "0000000000" });
    }

    payload1.user = user._id;
    try {
      let newEntry = await userSubmittedProperties.create(payload1);
      if (newEntry) {
        console.log("Added");
        var mailOptions3 = {
          from: appconstants.emailFrom,
          to: appconstants.emailTo,
          subject: appconstants.subjectForAddingProperty.admin,
          html: adminEmailTemplate1,
        };
        if (process.env.STAGING === "false") {
          transporter.sendMail(mailOptions3, function (error, info) {
            if (error) {
              console.log("Error sending emails", error);
            } else {
              console.log("Email sent successfully: " + info.response);
            }
          });
        }

        var mailOptions4 = {
          from: appconstants.emailFrom,
          to: payload1.email,
          subject: appconstants.subjectForAddingProperty.user,
          html: userEmailTemplate1,
        };

        if (process.env.STAGING === "false") {
          transporter.sendMail(mailOptions4, function (error, info) {
            if (error) {
              console.log("Error sending emails", error);
            } else {
              console.log("Email sent successfully: " + info.response);
            }
          });
        }

        if (payload1.newsletter) {
          console.log(`Adding ${payload1.email} to newsletters database.`);
          await addToNewsletter(payload1.email);
        }
        Customer.findOneAndUpdate(
          { _id: user._id },
          { propertyLastSubmittedAt: propertyLastSubmittedAt1 }
        )
          .then((doc) => console.log("property last submitted at updated"))
          .catch((err) => console.log("Error: " + err));
        res.status(200).json({
          success: true,
          message: "Project Submitted",
          redirect_url: "/sellyourproperty/thankyou-sell"
        });
      } else {
        res.status(200).json({
          success: false,
          message: "Something Went Wrong. Please Try Again",
        });
      }
    } catch (e) {
      console.log(e);
      res.status(200).json({
        success: false,
        message: "Something Went Wrong. Please Try Again",
      });
    }
  } else {
    res.status(200).json({
      success: false,
      message: "Something Went Wrong. Please Try Again",
    });
  }
});
// -------------------------------------------------------------------------------

module.exports = router;
