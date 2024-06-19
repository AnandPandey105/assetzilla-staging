var http = require("https");
const axios = require("axios");
var mongoose = require("mongoose");
const express = require("express");
Elastic = require("../../classes/elasticsearch");
Images = require("../../classes/images");
const { is_bookmarked, is_bookmarked_list } = require("../../classes/bookmark");
const {addToNewsletter} = require("../api/__helper");


const router = express.Router();
const authKey = process.env.MSG_KEY;
const sender = "AssetZ";
const message = "Your%20SignUp%20Verification%20Code%20is%20%23%23OTP%23%23";
const resetPasswordmessage =
  "Your%Reset%20Password%20Verification%20Code%20is%20%23%23OTP%23%23";
const sellYourPropertymessage =
  "Your%Sell%20Your%20Property%20Verification%20Code%20is%20%23%23OTP%23%23";
const editYourPropertymessage =
  "Your%Edit%20Your%20Property%20Verification%20Code%20is%20%23%23OTP%23%23";
const CustomerSchema = require("../../models/customer.model");
const Property = require("../../models/property.model");
const nodemailer = require("nodemailer");
const appconstants = require("../../appConstants");
const transporter = nodemailer.createTransport(appconstants.nodemailerAuth);
const moment = require("moment");
AlphaId = require("../../classes/alphaId");
const {
  changeNumberFormat,
  numberWithCommas,
} = require("../../classes/numberFormatter");
const Customer = require("../../models/customer.model");

var create_user = async function (user, password) {
  let err,
    doc = await CustomerSchema.findOne({ username: user }).exec();
  if (doc) {
    return false;
  } else {
    var Customer = new CustomerSchema();
    Customer.username = user;
    Customer.password = Customer.generateHash(password);
    err, (doc = await Customer.save());
    return doc;
  }
};
router.post("/signUp", function (req, res) {
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
        create_user(req.body.mobile, req.body.password).then((data) => {
          if (data) {
            req.session.user = data;
            res.status(200).json({
              success: true,
            });
          } else {
            res.status(200).json({
              success: false,
              message: "Account Already Exists. Please Login",
            });
          }
        });
      } else if (resMessage == "already_verified" && resType == "error") {
        if (data) {
          req.session.user = data;
          res.status(200).json({
            success: true,
          });
        } else {
          res.status(200).json({
            success: false,
            message: "Account Already Exists. Please Login",
          });
        }
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

// const createFixtureUser = async () => {
//   try {
//     const alreadyExist = await CustomerSchema.findOne({
//       username: "0000000000",
//     });
//     if (alreadyExist) {
//       console.log("Admin User Created");
//     } else {
//       const user = await CustomerSchema.create({
//         username: "0000000000",
//         password: "123456789",
//         name: "Unknown User",
//       });
//       console.log("Admin User Created");
//     }
//   } catch (err) {
//     console.log("Admin User Not Created", err);
//   }
// };
// createFixtureUser();

router.post("/sendOtp", function (req, res) {
  var sendOTPPath =
    "/api/sendotp.php?sender=" +
    sender +
    "&message=" +
    message +
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

router.post("/sendOtpPasswordReset", function (req, res) {
  var sendOTPPath =
    "/api/sendotp.php?sender=" +
    sender +
    "&message=" +
    resetPasswordmessage +
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

router.post("/resetPasswordOtpValidate", function (req, res) {
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

router.post("/reset_password", function (req, res) {
  if (!req.body.password || !req.body.username) {
    return res.status(200).json({
      success: true,
      message: "Missing Parameters.",
    });
  }

  let payload = {};

  var Customer = new CustomerSchema();
  payload.password = Customer.generateHash(req.body.password);
  CustomerSchema.findOneAndUpdate(
    { username: req.body.username },
    payload
  ).then((doc, err) => {
    if (err) {
      res.status(200).json({
        success: false,
        message: "Something Went Wrong. Please Try Again",
      });
    } else {
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
               <body style="background: #f4f4f4;font-size: 15px;line-height:20px;">
                  <div style="max-width:650px; margin:0 auto;background:white;font-family: 'Poppins', sans-serif;">
                     <div style="width:100%;float:left;margin-top:10px;background: #f3f9ff;padding: 15px 50px;box-sizing: border-box;">
                        <div style="width:100%;float:left;text-align: center;padding-top: 25px;">
                          <a href="https://assetzilla.com/"><img src="https://assetzilla-bucket.s3.amazonaws.com/email-template/logo.png" style="text-align: center;margin: 0 auto;height: 60px;object-fit: contain;"></a>
                        </div>
                        <div style="width:100%;float:left;text-align:center;">
                           <img src="https://assetzilla-bucket.s3.amazonaws.com/email-template/prop.webp" style="margin-top:25px;margin-bottom:15px;max-width: 100%;height: 200px;object-fit: contain;">
                           <div style="background: #FFFFFF;box-shadow: 0 2px 10px 3px #F6F6F6;border-radius: 29px;padding: 15px;margin-bottom:25px;">
                              <h4 style="font-size: 14px;color: #000;text-align: center;margin-top: 0;margin-bottom: 5px;">Hello ${doc.username}</h4>
                           <h4 style="font-size: 16px;color: #7EB041;text-align: center;margin-top: 10px;font-weight: 600;margin-bottom: 0px;">Your password has been changed successfully.</h4>
                          
                           <p style="max-width: 500px;margin: 0 auto;
                           font-size: 14px;
                           color: #6A6A6A;
                           text-align: center;
                           font-weight: 400;
                           line-height: 180%;
                           padding-top: 20px;
                            ">
                           If you did not perform this action, you should go to <a href="https://assetzilla.com/profile ">https://assetzilla.com/profile </a> immediately to reset your password.
                           </p>
                           <br>
                           <h4 style="margin-bottom: 0px;font-size: 20px;">Thanks!</h4>
                           <a href="https://assetzilla.com/"><img src="https://assetzilla-bucket.s3.amazonaws.com/email-template/logo.png" style="width:80px;"></a>
                           <ul style="list-style: none;padding-left: 0;">
                            <li style="display: inline-block;margin-right: 30px;"><a style="font-size: 12px;color: #347BBF;text-align: center;line-height: 20px;font-weight: 600; text-decoration: none;" href="javascript:;">seller@assetzilla.com</a></li>
                            
                            <li style="display: inline-block;margin-right: 0px;"><a style="font-size: 12px;color: #347BBF;text-align: center;line-height: 20px;font-weight: 600; text-decoration: none;" href="javascript:;"> support@assetzilla.com  </a></li>
                         </ul>
                            
                             <ul style="list-style: none;padding-left: 0;padding-top: 5px;">
                                <li style="display: inline-block;margin-right: 30px;"><a href="https://www.facebook.com/AssetZilla-102693262614064/?modal=admin_todo_tour"><img src="https://assetzilla-bucket.s3.amazonaws.com/email-template/f-icon.png" alt=""></a></li>
                                <!--<li style="display: inline-block;margin-right: 30px;">
          <a href="https://www.linkedin.com/company/assetzilla/about/?viewAsMember=true"><img src="https://assetzilla-bucket.s3.amazonaws.com/email-template/lk-icon.png" alt=""></a>
      </li>-->
      <li style="display: inline-block;margin-right: 30px;">
        <a href="https://www.instagram.com/assetzilla/"><img src="https://assetzilla-bucket.s3.amazonaws.com/email-template/instagram_.png" width="26px" alt=""></a>
      </li>
                                
                             </ul>
                           </p>
                        </div>
                     </div>
                  </div>
               </body>
            </html>`;
      if (doc.email) {
        var mailOptions = {
          from: appconstants.emailFrom,
          to: doc.email,
          subject: appconstants.subjectForForgotPassword,
          html: userEmailTemplate,
        };
        if (process.env.STAGING === 'false'){
          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log("Error sending emails", error);
            } else {
              console.log("Email sent successfully: " + info.response);
            }
          });
        }
      } else {
        console.log("can't send email");
      }
      res.status(200).json({
        success: true,
        message: "Password Updated",
      });
    }
  });
});

router.post("/logIn", async function (req, res) {
  console.log("user is ", req.body);
  if (req.body.viewHistory) {
    // console.log("viewHistory = ", JSON.parse(req.body.viewHistory));
  }
  await CustomerSchema.findOne({ username: req.body.userid }).then(
    async (doc, err) => {
      if (err) {
        res.status(200).json({
          success: false,
          message: "Something Went Wrong. Please Try Again",
        });
      } else {
        if (doc) {
          try {
            let updateObj = {};
            if (req.body.viewHistory) {
              updateObj.viewHistory = doc.viewHistory.concat(
                JSON.parse(req.body.viewHistory)
              );
            } else{ 
              // console.log(updateObj.viewHistory);
            }
            if (req.body.searchHistory) {
              updateObj.searchHistory = doc.searchHistory.concat(
                JSON.parse(req.body.searchHistory)
              );
            }
            // console.log(updateObj.searchHistory);
            if (Object.keys(updateObj).length > 0) {
              await CustomerSchema.findOneAndUpdate(
                { username: req.body.userid },
                updateObj
              )
                .then((doc) =>
                  doc
                    ? console.log("user history updated when logging in")
                    : doc
                )
                .catch((e) =>
                  console.log("error occurred while updating history at loging")
                );
            } else{
              console.log("No history to update")
            }
          } catch (err) {
            console.log(
              "Error occurred while processing and saving the history", err
            );
          }
          var Customer = new CustomerSchema();
          doc.password = !doc.password ? "nopassword" : doc.password;
          let correct_password = Customer.validPassword(
            req.body.password,
            doc.password
          );
          if (correct_password || req.body.isLoggingThroughWhatsapp) {
            req.session.user = doc;
            let total_bookmarks = req.session.user.bookmark
              ? req.session.user.bookmark.length
              : 0;
            if (total_bookmarks > 0) {
              req.session.user.bookmark.map(async (bm, index) => {
                await Elastic.get_entity_bookmark(bm).then((doc) => {
                  if (doc) {
                    doc.resp.custSkip = 1 * 12;
                    // if (doc.resp.price)
                    //   doc.resp.price.str = changeNumberFormat(doc.resp.price.price);
                    bm.data = doc;
                  }
                });
                if (index === total_bookmarks - 1) {
                  // req.session.user.bookmark.forEach((i) => {
                  //   console.log(i.data);
                  //   console.log(i);
                  // });
                  if (req.body.isLoggingThroughWhatsapp) {
                    CustomerSchema.updateOne(
                      { username: req.body.userid },
                      { lastLogin: Date.now() },
                      function (err, docs) {
                        if (err) {
                          console.log(
                            "Couldn't update the last login time for " +
                              req.body.userid +
                              " because : ",
                            err
                          );
                        } else {
                          console.log(
                            "Updated Last Login time for " +
                              req.body.userid +
                              " : ",
                            "docs"
                          );
                        }
                      }
                    );
                    res.status(200).json({
                      success: true,
                      message: "you are now logged in",
                      gtp: req.body.gtp,
                      session: req.session.user,
                    });
                  } else {
                    CustomerSchema.updateOne(
                      { username: req.body.userid },
                      { lastLogin: Date.now() },
                      function (err, docs) {
                        if (err) {
                          console.log(
                            "Couldn't update the last login time for " +
                              req.body.userid +
                              " because : ",
                            err
                          );
                        } else {
                          console.log(
                            "Updated Last Loging time for " +
                              req.body.userid +
                              " : ",
                            "docs"
                          );
                        }
                      }
                    );
                    res.status(200).json({
                      success: true,
                      message: "you are now logged in",
                      gtp: req.body.gtp,
                      session: req.session.user,
                    });
                  }
                }
              });
            } else {
              await CustomerSchema.updateOne(
                { username: req.body.userid },
                { lastLogin: Date.now() },
                async function (err, docs) {
                  if (err) {
                    console.log(
                      "Couldn't update the last login time for " +
                        req.body.userid +
                        " because : ",
                      err
                    );
                  } else {
                    console.log(
                      "Updated Last Login time for " + req.body.userid + " : ",
                      "docs"
                    );
                  }
                }
              );
              res.status(200).json({
                success: true,
                message: "You are now logged in",
                session: req.session.user,
              });
            }
          } else {
            res.status(200).json({
              success: false,
              message:
                "Wrong Password and Number Combination<br>Try logging in with WhatsApp, if that is how you signed up",
            });
          }
        } else {
          res.status(200).json({
            success: false,
            message: "User Not found. Please SignUp",
          });
        }
      }
    }
  );
});

router.post("/edit", function (req, res) {
  if (req.session.user) {
    let payload = {};
    if (req.body.email != undefined && req.body.email.length > 0) {
      payload.email = req.body.email;
    }
    if (req.body.name != undefined && req.body.name.length > 0) {
      payload.name = req.body.name;
    }
    CustomerSchema.findOneAndUpdate(
      { username: req.session.user.username },
      payload
    ).then((doc, err) => {
      Object.assign(req.session.user, payload);
      if (err) {
        res.status(200).json({
          success: false,
          message: "Something Went Wrong. Please Try Againg",
        });
      } else {
        res.status(200).json({
          success: true,
          message: "Profile Updated",
        });
      }
    });
  } else {
    res.status(200).json({
      success: false,
      message: "Something Went Wrong. Please Try Againg",
    });
  }
});

router.post("/change_password", function (req, res) {
  if (req.session.user) {
    let payload = {};
    if (req.body.password != undefined && req.body.password.length > 0) {
      var Customer = new CustomerSchema();
      payload.password = Customer.generateHash(req.body.password);
    }
    CustomerSchema.findOneAndUpdate(
      { username: req.session.user.username },
      payload
    ).then((doc, err) => {
      Object.assign(req.session.user, payload);
      if (err) {
        res.status(200).json({
          success: false,
          message: "Something Went Wrong. Please Try Againg",
        });
      } else {
        res.status(200).json({
          success: true,
          message: "Password Updated",
        });
      }
    });
  } else {
    res.status(200).json({
      success: false,
      message: "Something Went Wrong. Please Try Againg",
    });
  }
});

const check_if_bookmark_limit_has_reached = (bookmarks, type) => {
  let type_bookmark_count = 0;
  bookmarks.forEach((current_bookmark) => {
    if (current_bookmark.type === type) type_bookmark_count++;
  });
  console.log(type, type_bookmark_count);
  return type_bookmark_count >= 12;
};

router.post("/bookmark", function (req, res) {
  if (req.session.user) {
    let payload = {};
    // console.log(
    //   req.session.user.bookmark.findIndex((i) => i.url === req.body.url)
    // );
    // console.log(req.session.user.bookmark);
    const all_bookmarks_of_user = req.session.user.bookmark;
    let is_bookmarking_limit_reached = check_if_bookmark_limit_has_reached(
      all_bookmarks_of_user,
      req.body.type
    );

    if (
      req.session.user.bookmark.findIndex((i) => i.url === req.body.url) > -1
    ) {
      req.session.user.bookmark.splice(
        req.session.user.bookmark.findIndex((i) => i.url === req.body.url),
        1
      );
      payload.bookmark = req.session.user.bookmark;
      CustomerSchema.findOneAndUpdate(
        { username: req.session.user.username },
        payload
      ).then((doc, err) => {
        req.session.user = doc._doc;
        Object.assign(req.session.user, payload);
        if (err) {
          res.status(200).json({
            success: false,
            message: "Something Went Wrong. Please Try Again",
          });
        } else {
          res.status(200).json({
            success: true,
            message: "Bookmark Successfully Removed",
          });
        }
      });
    } else if (!is_bookmarking_limit_reached) {
      req.session.user.bookmark.push({
        url: req.body.url,
        name: req.body.name,
        builder: req.body.builder,
        type: req.body.type,
      });
      payload.bookmark = req.session.user.bookmark;
      // console.log(payload.bookmark);
      CustomerSchema.findOneAndUpdate(
        { username: req.session.user.username },
        payload
      ).then((doc, err) => {
        req.session.user = doc._doc;
        Object.assign(req.session.user, payload);
        if (err) {
          res.status(200).json({
            success: false,
            message: "Something Went Wrong. Please Try Again",
          });
        } else {
          res.status(200).json({
            success: true,
            message: "Bookmark Updated",
          });
        }
      });
    } else {
      res.status(200).json({
        success: false,
        message: `You can only bookmark 12 ${req.body.type} at a time.`,
        bookmark_limit_reached: true,
      });
    }
  } else {
    res.status(200).json({
      success: false,
      message: "You need to be logged in.",
    });
  }
});

router.post("/submit", async function (req, res) {
  if (req.session.user) {
    console.log("you're here", req.body.property_images);
    let payload = {};
    payload.newsletter = req.body.newsletter;
    payload.username = req.body.username;
    payload.email = req.body.email;
    payload.property_name = req.body.property_name;
    payload.property_type = req.body.property_type;
    payload.country = {code:req.body.countryCode, name:req.body.countryName};
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
    payload.history = [{
      notes: "",
      status: "",
      subStatus: "",
      whatsappNumber: req.body.username || req.session.user.username,
      country:payload.country,
      updated: Date.now(),
      updatedBy: "System",
    }];
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

    CustomerSchema.findOneAndUpdate(
      { username: req.session.user.username },
      {
        propertyLastSubmittedAt: propertyLastSubmittedAt,
        $push: { submitted_property: payload },
      },
      { upsert: true }
    ).then(async(doc, err) => {
      if (err) {
        res.status(200).json({
          success: false,
          message: "Something Went Wrong. Please Try Again",
        });
      } else {
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
        if (process.env.STAGING === 'false'){
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
        if (process.env.STAGING === 'false'){
          transporter.sendMail(mailOptions2, function (error, info) {
            if (error) {
              console.log("Error sending emails", error);
            } else {
              console.log("Email sent successfully: " + info.response);
            }
          });
        }
        if (payload.newsletter){
          console.log(`Adding ${payload.email} to newsletters database.`);
          await addToNewsletter(payload.email);
        }

        res.status(200).json({
          success: true,
          message: "Project Submitted",
        });
      }
    });
  } else if (!false) {
    let payload1 = {};
    payload1.newsletter = req.body.newsletter;
    payload1.username = req.body.username;
    payload1.email = req.body.email;
    payload1.property_name = req.body.property_name;
    payload1.property_type = req.body.property_type;
    payload1.country = {code:req.body.countryCode, name:req.body.countryName};
    payload1.builder = req.body.builder;
    payload1.locality = req.body.locality;
    payload1.city = req.body.city;
    payload1.price = req.body.price;
    payload1.size = req.body.size;
    payload1.isApproved = false;
    payload1.isDeleted = false;
    payload1.history = [{
      notes: "",
      status: "",
      subStatus: "",
      whatsappNumber: req.body.username || "0000000000",
      country:payload1.country,
      updated: Date.now(),
      updatedBy: "System",
    }];
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
    

    let user = await CustomerSchema.findOne({username:req.body.username});
    let userToInsertIn = "0000000000"
    if (user) {
      userToInsertIn = req.body.username;
    }

    
    CustomerSchema.findOneAndUpdate(
      { username: userToInsertIn },
      {
        $push: { submitted_property: payload1 },
        propertyLastSubmittedAt: propertyLastSubmittedAt1,
      },
      { upsert: true }
    ).then(async (doc, err) => {
      if (err) {
        res.status(200).json({
          success: false,
          message: "Something Went Wrong. Please Try Again",
        });
      } else {
        // Object.assign(req.session.user.submitted_property.push(payload), payload);
        var mailOptions3 = {
          from: appconstants.emailFrom,
          to: appconstants.emailTo,
          subject: appconstants.subjectForAddingProperty.admin,
          html: adminEmailTemplate1,
        };
        if (process.env.STAGING === 'false'){
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

        if (process.env.STAGING === 'false'){
          transporter.sendMail(mailOptions4, function (error, info) {
            if (error) {
              console.log("Error sending emails", error);
            } else {
              console.log("Email sent successfully: " + info.response);
            }
          });
        }

        if (payload1.newsletter){
          console.log(`Adding ${payload1.email} to newsletters database.`);
          await addToNewsletter(payload1.email);
        }

        res.status(200).json({
          success: true,
          message: "Project Submitted",
        });
      }
    });
  } else {
    res.status(200).json({
      success: false,
      message: "Something Went Wrong. Please Try Again",
    });
  }
});

router.post("/delete_submitted_property", async function (req, res) {
  try {
    if (req.session.user) {
      let x = await CustomerSchema.findOne({
        username: req.session.user.username,
      });
      let propertyDetails = x.submitted_property;
      let objIndex = propertyDetails.findIndex(
        (obj) => obj.case_id_display == req.body.case_id
      );

      propertyDetails[objIndex].isDeleted = true;
      propertyDetails[objIndex].status = "Archieved";

      let email = propertyDetails[objIndex].email;

      let newuser = await CustomerSchema.findOneAndUpdate(
        {
          username: req.session.user.username,
        },
        {
          submitted_property: propertyDetails,
        },
        { new: true }
      );
      console.log("++++++++++++++++++", newuser);

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
                                  !propertyDetails[objIndex].property_name
                                    ? "display: none"
                                    : ""
                                }">
                                Project/Society Name: ${
                                  propertyDetails[objIndex].property_name
                                }</h4>
                            <h4 style="font-size: 18px;color: #000;text-align: center;margin-top: 0px;margin-bottom: 10px; ${
                              !propertyDetails[objIndex].builder
                                ? "display: none"
                                : ""
                            }">
                                Builder Name: ${
                                  propertyDetails[objIndex].builder
                                }</h4>
                        </div>
                        <div style="padding: 20px 15px; text-align: left; margin-bottom: 35px;">
                            <h5 style="font-size: 18px;color: #000; margin: 0; text-align: center;">More Details</h2>
                                <ul style="padding-left: 0;list-style: none; text-align: center;">
                                    <li style="font-size: 18px;padding: 5px 0px; ${
                                      !propertyDetails[objIndex].property_type
                                        ? "display: none"
                                        : ""
                                    }">Property Type: <span>${
        propertyDetails[objIndex].property_type
      }</span>
                                    </li>
                                    <li style="font-size: 18px;padding: 5px 0px; ${
                                      !propertyDetails[objIndex].city
                                        ? "display: none"
                                        : ""
                                    }">Locality & City: <span>${
        propertyDetails[objIndex].locality
      } & ${propertyDetails[objIndex].city}</span></li>
                                    <li style="font-size: 18px;padding: 5px 0px; ${
                                      !propertyDetails[objIndex].size
                                        ? "display: none"
                                        : ""
                                    }">Price & Size: <span>${
        propertyDetails[objIndex].price
      } & ${propertyDetails[objIndex].size}</span></li>
                                    <li style="font-size: 18px;padding:5px 0px;">Phone: <span>${
                                      propertyDetails[objIndex].username
                                    }</span></li>
                                    <li style="font-size: 18px;padding: 5px 0px;">Email: <span>${
                                      propertyDetails[objIndex].email
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
                                Case Id: ${
                                  propertyDetails[objIndex].case_id_display
                                }</h4>
                                <h4 style="font-size: 18px;color: #000;text-align: center;margin-top: 20px;margin-bottom: 8px;${
                                  !propertyDetails[objIndex].property_name
                                    ? "display: none"
                                    : ""
                                } ">
                                Project/Society Name: ${
                                  propertyDetails[objIndex].property_name
                                }</h4>
                            <h4 style="font-size: 18px;color: #000;text-align: center;margin-top: 0px;margin-bottom: 10px;${
                              !propertyDetails[objIndex].builder
                                ? "display: none"
                                : ""
                            } ">
                                Builder Name: ${
                                  propertyDetails[objIndex].builder
                                }</h4>
                        </div>
                        <div style="padding: 20px 15px; text-align: left; margin-bottom: 35px;">
                            <h5 style="font-size: 18px;color: #000; margin: 0; text-align: center;">More Details</h2>
                                <ul style="padding-left: 0;list-style: none; text-align: center;">
                                    <li style="font-size: 18px;padding: 5px 0px; ${
                                      !propertyDetails[objIndex].property_type
                                        ? "display: none"
                                        : ""
                                    }">Property Type: <span>${
        propertyDetails[objIndex].property_type
      }</span>
                                    </li>
                                    <li style="font-size: 18px;padding: 5px 0px; ${
                                      !propertyDetails[objIndex].city
                                        ? "display: none"
                                        : ""
                                    }">Locality & City: <span>${
        propertyDetails[objIndex].locality
      } & ${propertyDetails[objIndex].city}</span></li>
                                    <li style="font-size: 18px;padding: 5px 0px; ${
                                      !propertyDetails[objIndex].size
                                        ? "display: none"
                                        : ""
                                    }">Price & Size: <span>${
        propertyDetails[objIndex].price
      } & ${propertyDetails[objIndex].size}</span></li>
                                    <li style="font-size: 18px;padding:5px 0px;">Phone: <span>${
                                      propertyDetails[objIndex].username
                                    }</span></li>
                                    <li style="font-size: 18px;padding: 5px 0px;">Email: <span>${
                                      propertyDetails[objIndex].email
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

      if (process.env.STAGING === 'false'){
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
        to: propertyDetails[objIndex].email,
        subject: appconstants.subjectForDeletingProperty.user,
        html: userEmailTemplate,
      };

      if (process.env.STAGING === 'false'){
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

router.get("/get_caseid", function (req, res) {
  CustomerSchema.distinct("submitted_property.case_id_display").then(
    (doc, err) => {
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
    }
  );
});

router.post("/getLink", async function (req, res) {
  console.log("++++++++++++++++++++", req.body.caseId);

  Property.findOne({ $or:[{case_id: req.body.caseId},{case_id:req.body.caseIdDisplay}] }).then(
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

router.post("/get", function (req, res) {
  console.log("User Submitted Properties List*****");
  var sortBy = req.body.sortBy;
  var sortForm = req.body.sortForm;
  var cityFilter = req.body.cityFilter;
  var count;
  var pageIndex = req.body.pageIndex;
  var recordLimit = req.body.recordLimit;
  var skipRecords = (pageIndex - 1) * recordLimit;
  var query = {};
  var mainQuery = { "submitted_property.0": { $exists: true } };
  let q = req.body.param;

  if (req.body.hasOwnProperty("param") && q.search.length > 0) {
    query["$or"] = [];
    query["$or"].push({ name: new RegExp(q.search, "i") });
    query["$or"].push({ username: new RegExp(q.search, "i") });
    query["$or"].push({ email: new RegExp(q.search, "i") });
    query["$or"].push({submitted_property:{$elemMatch:{email:new RegExp(q.search, "i")}}})
    query["$or"].push({submitted_property:{$elemMatch:{case_id_display:new RegExp(q.search, "i")}}})
    query["$or"].push({submitted_property:{$elemMatch:{username:new RegExp(q.search, "i")}}})
    query["$or"].push({submitted_property:{$elemMatch:{property_name:new RegExp(q.search, "i")}}})
    query["$or"].push({submitted_property:{$elemMatch:{property_type:new RegExp(q.search, "i")}}})
    query["$or"].push({submitted_property:{$elemMatch:{builder:new RegExp(q.search, "i")}}})
    query["$or"].push({submitted_property:{$elemMatch:{city:new RegExp(q.search, "i")}}})
    query["$or"].push({submitted_property:{$elemMatch:{userSubmittedCity:new RegExp(q.search, "i")}}})
    query["$or"].push({submitted_property:{$elemMatch:{size:new RegExp(q.search, "i")}}})
    query["$or"].push({submitted_property:{$elemMatch:{price:new RegExp(q.search, "i")}}})
    query["$or"].push({submitted_property:{$elemMatch:{status:new RegExp(q.search, "i")}}})
    query["$or"].push({submitted_property:{$elemMatch:{latestStatus:new RegExp(q.search, "i")}}})
    query["$or"].push({submitted_property:{$elemMatch:{latestSubStatus:new RegExp(q.search, "i")}}})

    if (!mainQuery.hasOwnProperty("$and")) {
      mainQuery["$and"] = [];
    }
    mainQuery["$and"].push(query);
  }

  let sortObj = { propertyLastSubmittedAt: -1 };
  sortObj[sortBy] = sortForm;

  console.log(req.body.param);

  if (!cityFilter) {
    CustomerSchema.find(mainQuery)
      .sort(sortObj)
      .skip(skipRecords)
      .limit(recordLimit)
      .then(
        async (docs) => {
          await CustomerSchema.find(query)
            .count()
            .then(
              async (doc) => {
                count = doc;
                let docsToSend = [];
                if (cityFilter) {
                  console.log("------------------------------------------");
                  console.log(cityFilter);
                  console.log("------------------------------------------");
                  // console.log(docs);
                  for (const user of docs) {
                    let newSubmittedProperties = [];
                    user._doc.submitted_property.forEach(
                      (submittedProperty) => {
                        console.log(submittedProperty.city);
                        if (submittedProperty.city.includes(cityFilter)) {
                          newSubmittedProperties.push(submittedProperty);
                        }
                        // console.log(newSubmittedProperties);
                      }
                    );
                    if (newSubmittedProperties.length > 0) {
                      user._doc.submitted_property = newSubmittedProperties;
                      docsToSend.push(user);
                      // console.log(user);
                    }
                  }
                  // console.log(docsToSend);
                } else {
                  docsToSend = docs;
                }
                res.status(200).json({
                  success: true,
                  message: "Fetched User Submitted Properties list",
                  count,
                  docs: docsToSend,
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
            message: "Couldn't fetch User Submitted Properties list",
          });
        }
      );
  } else if (cityFilter && req.body.param.search === "") {
    CustomerSchema.find({}).then(
      async (docs) => {
        await CustomerSchema.find(query)
          .count()
          .then(
            async (doc) => {
              count = doc;
              let docsToSend = [];
              if (cityFilter) {
                console.log("------------------------------------------");
                console.log(cityFilter);
                console.log("------------------------------------------");
                // console.log(docs);
                for (const user of docs) {
                  let newSubmittedProperties = [];
                  user._doc.submitted_property.forEach((submittedProperty) => {
                    console.log(submittedProperty.city);

                    if (
                      submittedProperty.city.toLowerCase() ===
                      cityFilter.toLowerCase()
                    ) {
                      newSubmittedProperties.push(submittedProperty);
                    }

                    // console.log(newSubmittedProperties);
                  });
                  if (newSubmittedProperties.length > 0) {
                    user._doc.submitted_property = newSubmittedProperties;
                    docsToSend.push(user);
                    // console.log(user);
                  }
                }
                // console.log(docsToSend);
              } else {
              }
              res.status(200).json({
                success: true,
                message: "Fetched User Submitted Properties list",
                count,
                docs: docsToSend,
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
          message: "Couldnt fetch User Submitted Properties list",
        });
      }
    );
  } else {
    CustomerSchema.find(mainQuery)
      .sort(sortObj)
      .skip(skipRecords)
      .limit(recordLimit)
      .then(
        async (docs) => {
          await CustomerSchema.find(query)
            .count()
            .then(
              async (doc) => {
                count = doc;
                let docsToSend = [];
                if (cityFilter) {
                  console.log("------------------------------------------");
                  console.log(cityFilter);
                  console.log("------------------------------------------");
                  // console.log(docs);
                  for (const user of docs) {
                    let newSubmittedProperties = [];
                    user._doc.submitted_property.forEach(
                      (submittedProperty) => {
                        console.log(submittedProperty.city);
                        if (submittedProperty.city.includes(cityFilter)) {
                          newSubmittedProperties.push(submittedProperty);
                        }
                        // console.log(newSubmittedProperties);
                      }
                    );
                    if (newSubmittedProperties.length > 0) {
                      user._doc.submitted_property = newSubmittedProperties;
                      docsToSend.push(user);
                      // console.log(user);
                    }
                  }
                  // console.log(docsToSend);
                } else {
                  docsToSend = docs;
                }
                res.status(200).json({
                  success: true,
                  message: "Fetched User Submitted Properties list",
                  count,
                  docs: docsToSend,
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
            message: "Couldnt fetch User Submitted Properties list",
          });
        }
      );
  }
});

router.get("/getSubmittedPropertyDetails/:case_id", async function (req, res) {
  CustomerSchema.findOne(
    { "submitted_property.case_id_display": req.params.case_id },
    { "submitted_property.$": 1 }
  ).then(
    async (doc) => {
      if (doc) {
        // console.log(doc);
        await CustomerSchema.findOne({ _id: doc._id }).then((document) => {
          console.log(document._doc.username);

          let dataToSend =
            doc && doc.submitted_property && doc.submitted_property.length > 0
              ? doc.submitted_property[0]
              : {};
          dataToSend.realUsername = document._doc.username;
          res.send({
            success: true,
            data: dataToSend,
          });
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

router.post("/submittedproperty/addmappedcity", async function (req, res) {
  // console.log(req.body);
  let isUserAnnonymous = req.body.username === "0000000000";
  console.log(isUserAnnonymous);
  await CustomerSchema.findOne({ username: req.body.username })
    .then(async (doc) => {
      isUserAnnonymous = false;
      let newSubmittedPropertiesArray = [];
      for (const property of doc._doc.submitted_property) {
        if (property.case_id === req.body.caseid) {
          if (!property.userSubmittedCity)
            property.userSubmittedCity = property.city;
          property.city = req.body.city;
          newSubmittedPropertiesArray.push(property);
        } else {
          newSubmittedPropertiesArray.push(property);
        }
      }

      await CustomerSchema.findOneAndUpdate(
        { username: req.body.username },
        { submitted_property: newSubmittedPropertiesArray },
        { new: true }
      )
        .then(async (response) => {
          console.log(response);
          let newUsersList = await CustomerSchema.find({});
          res.status(200).json({
            success: true,
            message: "City Saved successfully!",
            response,
            newUsersList,
          });
        })
        .catch((err) => {
          console.log("I ran into error while adding the city: ", err);
          res.status(200).json({
            success: false,
            message: "Couldn't update the city!",
            response: err,
          });
        });
    })
    .catch(async (err) => {
      console.log(err);
      res.status(200).json({
        success: false,
        message: "User was not found",
      });
    });
});

router.post("/addNotes", async function (req, res) {
  try {
    console.log("Adding these notes in User Submitted Property: ", req.body);
    let history = {
      notes: req.body.data.update.notes,
      status: req.body.data.update.status || "",
      subStatus: req.body.data.update.subStatus || "",
      whatsappNumber: req.body.data.update.whatsappNumber,
      country:{code:req.body.data.update.country.code, name:req.body.data.update.country.name},
      updated: Date.now(),
      updatedBy: req.body.data.update.updatedBy,
    };

    await Customer.findOne({
      _id: req.body.data._id,
    })
      .then(async (foundCustomer) => {
        if (foundCustomer) {
          console.log(foundCustomer);

          let newSubmittedProperties = [];

          foundCustomer.submitted_property.forEach((property) => {
            if (property.case_id === req.body.data.case_id) {
              if (!property.history) {
                property.history = [];
                property.history.push(history);
                property.latestStatus = history.status;
                property.latestSubStatus = history.subStatus;
              } else {
                property.history.push(history);
                property.latestStatus = history.status;
                property.latestSubStatus = history.subStatus;
              }
              newSubmittedProperties.push(property);
            } else {
              newSubmittedProperties.push(property);
            }
          });

          foundCustomer.submitted_property = null;
          foundCustomer.submitted_property = newSubmittedProperties;

          await Customer.findOneAndUpdate(
            {
              _id: req.body.data._id,
            },
            { $set: { submitted_property: newSubmittedProperties } },
            { new: true }
          )
            .then((response) => {
              if (response) {
                console.log("Successfully saved the history");
                res.status(200).json({
                  success: true,
                  message: "Notes were added successfully",
                });
              } else {
                console.log(
                  "Response was null while while saving the notes to database. Shouldn't have happen"
                );
                res.status(200).json({
                  success: false,
                  message:
                    "Error while saving notes to database. This should not have happened. ",
                });
              }
            })
            .catch((e) => {
              console.log("Error occurred while saving history to the db", e);
              res.status(200).json({
                success: false,
                message: "Error occurred while saving history to the db",
                err: e,
              });
            });
        } else {
          console.log("Fetching customer returned null");
          res.status(200).json({
            success: false,
            message: "No customer found with this id",
          });
        }
      })
      .catch((e) => {
        console.log("Error occured while processing the request", e);
        res.status(200).json({
          success: false,
          message: "Error while searching the customer.",
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

router.post("/add_to_view_history", async function (req, res) {
  console.log(req.body);

  if (req.body.user) {
    let thisView = { url: req.body.url };
    CustomerSchema.findOne({ username: req.body.user })
      .then(async (response) => {
        if (response) {
          // console.log(response);
          // console.log(response.viewHistory);
          let newViewHistory = response.viewHistory;
          newViewHistory.push(thisView);
          // console.log(newViewHistory);
          await CustomerSchema.findOneAndUpdate(
            { username: req.body.user },
            { $set: { viewHistory: newViewHistory, lastActivity: Date.now() } },
            { new: true, timestamps: false }
          )
            .then((success) => {
              if (success) {
                console.log("History updated successfully");
                res.status(200).json({
                  success: true,
                });
              } else {
                console.log("Could not find the user while updating");
                res.status(200).json({
                  success: false,
                  msg: "This should have never happened, User was not found while updating history",
                });
              }
            })
            .catch((err) => {
              console.log(
                "Error occurred while updating the user's history.",
                err
              );
              res.status(200).json({
                success: false,
                msg: "Error occurred while updating the user's history",
              });
            });
        } else {
          console.log(`User with username ${req.body.user} does not exist`);
          res.status(200).json({
            success: false,
            msg: "This user does not exist",
          });
        }
      })
      .catch((err) => {
        console.log("Error while getting this user", err);
        res.status(200).json({
          success: false,
          msg: "Error while getting the information of this user",
        });
      });
  } else {
    res.status(200).json({
      success: false,
      msg: "Anonymous user",
    });
  }
});

router.post("/add_to_search_history", async function (req, res) {
  console.log(req.body);

  if (req.body.user) {
    let thisSearch = { url: req.body.url };
    CustomerSchema.findOne({ username: req.body.user })
      .then(async (response) => {
        if (response) {
          // console.log(response);
          // console.log(response.searchHistory);
          let newSearchHistory = response.searchHistory;
          newSearchHistory.push(thisSearch);
          // console.log(newSearchHistory);
          await CustomerSchema.findOneAndUpdate(
            { username: req.body.user },
            { $set: { searchHistory: newSearchHistory, lastActivity: Date.now() } },
            { new: true, timestamps: false }
          )
            .then((success) => {
              if (success) {
                console.log("Search History updated successfully");
                res.status(200).json({
                  success: true,
                });
              } else {
                console.log("Could not find the user while updating");
                res.status(200).json({
                  success: false,
                  msg: "This should have never happened, User was not found while updating Search history",
                });
              }
            })
            .catch((err) => {
              console.log(
                "Error occurred while updating the user's Search history.",
                err
              );
              res.status(200).json({
                success: false,
                msg: "Error occurred while updating the user's Search history",
              });
            });
        } else {
          console.log(`User with username ${req.body.user} does not exist`);
          res.status(200).json({
            success: false,
            msg: "This user does not exist",
          });
        }
      })
      .catch((err) => {
        console.log("Error while getting this user", err);
        res.status(200).json({
          success: false,
          msg: "Error while getting the information of this user",
        });
      });
  } else {
    res.status(200).json({
      success: false,
      msg: "Anonymous user",
    });
  }
});

module.exports = router;
