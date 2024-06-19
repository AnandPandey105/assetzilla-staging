const express = require("express");
const router = express.Router();
AlphaId = require("../../classes/alphaId");
Elastic = require("../../classes/elasticsearch");

const Schedule = require("../../models/schedule.model");
const AdminConfigSchema = require("../../models/admin_config.model");
const Property = require("../../models/property.model");
const Project = require("../../models/project.model");

const { addToNewsletter, findStatusCount, findSubStatusCount } = require("./__helper");

const nodemailer = require("nodemailer");
const appconstants = require("../../appConstants");
const moment = require("moment");
const transporter = nodemailer.createTransport(appconstants.nodemailerAuth);

router.post("/add", function (req, res) {
  let data = req.body;
  let date = new Date();
  data.history = [
    {
      type: "booked",
      notes: "booked by user",
      newAppointmentDate: data.date,
      updateDate: Date.now(),
      newTimeZone: data.timeZone,
      status: "",
      whatsappNumber: data.phone,
      updateUser: "system",
      subStatus: "",
    },
  ];
  data.country = { code: data.countryCode, name: data.countryName };
  data.history[0].country = { code: data.countryCode, name: data.countryName };
  if (req.session.user) {
    data.registeredMobileNumber = req.session.user.username;
  }
  data.latestStatus = data.history[0].status;
  let id = AlphaId.encode(date.getTime());
  data.id = id;
  data.project = data.project.split(",");

  data.url = data.url.split(",");

  var linkingValues = [];
  for (let i = 0; i < data.project.length; i++) {
    linkingValues[i] = {
      projectname: data.project[i],
      url: data.url[i],
    };
  }

  var schedule = new Schedule();
  Object.assign(schedule, data);
  var emptyUrlString;
  var emptyProjectString;
  let anchorEmailTemplate = "";
  for (let i = 0; i < linkingValues.length; i++) {
    emptyUrlString = linkingValues[i].url;
    emptyProjectString = linkingValues[i].projectname;
    anchorEmailTemplate += `<a style="display:block;" href="https://assetzilla.com${emptyUrlString}">${emptyProjectString}</a>`;
  }

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
                    <h4 style="margin-top: 20px;font-size: 24px;color: #7EB041;font-weight: 600; padding: 20px; padding-bottom:10px;">Appointment
                        Booked</h4>
                       

                    <div
                        style="background: #FFFFFF;box-shadow: 0 2px 10px 3px #F6F6F6;border-radius: 29px;padding: 15px;margin-bottom:25px;">
                        <h4
                            style="font-size: 18px;color: #6A6A6A;text-align: center;margin-top: 30px;margin-bottom: 0px;font-weight: 500;">
                            Thanks for your booking.</h4>
                        <h4
                            style="font-size: 18px;color: #6A6A6A;text-align: center;margin-top: 10px;margin-bottom: 0px;font-weight: 500;">
                            Looking forward to meeting you!</h4>
                            <h4 style="font-size: 18px;color: #000;text-align: center;margin-top: 20px;margin-bottom: 8px; ">
                            Project/Property Name: ${anchorEmailTemplate}</h4>
                        <h4 style="font-size: 18px;color: #000;text-align: center;margin-top: 0px;margin-bottom: 10px; ">
                            Appointment Date: ${moment(data.date).format(
                              "dddd, MMMM Do YYYY"
                            )}</h4>
                    </div>
                    <div style="padding: 20px 15px; text-align: left; margin-bottom: 35px;">
                        <h5 style="font-size: 18px;color: #000; margin: 0; text-align: center;">More Details</h2>
                            <ul style="padding-left: 0;list-style: none; text-align: center;">
                                <li style="font-size: 18px;padding: 5px 0px;">Full Name: <span>${
                                  data.name
                                }</span>
                                </li>
                                <li style="font-size: 18px;padding:5px 0px;">Phone: <span>${
                                  data.phone
                                }</span></li>
                                <li style="font-size: 18px;padding: 5px 0px;">Email: <span>${
                                  data.email
                                }</span></li>
                                <li style="font-size: 18px;padding: 5px 0px;">Booked on: <span>${moment(
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
                                href="javascript:;"> support@assetzilla.com </a></li>
                    </ul>
    
                    <ul style="list-style: none;padding-left: 0;padding-top: 5px;">
                        <li style="display: inline-block;margin-right: 30px;"><a
                                href="https://www.facebook.com/AssetZilla-102693262614064/?modal=admin_todo_tour"><img
                                    src="https://assetzilla-bucket.s3.amazonaws.com/email-template/f-icon.png"
                                    alt=""></a></li>
                        <li style="display: inline-block;margin-right: 30px;"><a
                                href="https://www.linkedin.com/company/assetzilla/about/?viewAsMember=true"><img
                                    src="https://assetzilla-bucket.s3.amazonaws.com/email-template/lk-icon.png"
                                    alt=""></a></li>
                        
                    </ul>
                </div>
    
            </div>
        </div>
    </body>
    
    </html>`;

  schedule.save().then(
    async (doc) => {
      var mailOptions1 = {
        from: appconstants.emailFrom,
        to: data.email,
        subject: appconstants.subject,
        html: userEmailTemplate,
      };

      var mailOptions2 = {
        from: appconstants.emailFrom,
        to: appconstants.emailTo,
        subject: appconstants.subject,
        html: userEmailTemplate,
      };

      if (process.env.STAGING === "false") {
        transporter.sendMail(mailOptions1, function (error, info) {
          if (error) {
            console.log("Error sending emails", error);
          } else {
            console.log("Email sent successfully: " + info.response);
          }
        });
        transporter.sendMail(mailOptions2, function (error, info) {
          if (error) {
            console.log("Error sending emails", error);
          } else {
            console.log("Email sent successfully: " + info.response);
          }
        });
      }
      if (data.newsletter && data.newsletter !== "false") {
        console.log(`Adding ${data.email} to newsletters database.`);
        await addToNewsletter(data.email);
      }
      res.status(200).json({
        success: true,
        message:
          "Our team will contact you shortly to confirm the date and time.",
        title: "Your site visit has been scheduled successfully!",
        redirect_url:"/schedulevisit/thankyou-buy"
      });
    },
    (e) => {
      console.log("Error occurred", e);
      res.status(200).json({
        success: false,
        message: "Couldn't schedule appointment",
      });
    }
  );
});

router.post("/get", async function (req, res) {
  console.log("Appointments*****");
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
    const {
      getUserLocationLevelAccessInfo,
      getUserPropertyLevelAccessInfo,
      addToNewsletter,
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
    temp_q["$or"].push({ phone: new RegExp(q.search, "i") });
    temp_q["$or"].push({ email: new RegExp(q.search, "i") });
    temp_q["$or"].push({ project: new RegExp(q.search, "i") });
    temp_q["$or"].push({ otherintrestedprojects: new RegExp(q.search, "i") });
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

  // let count = Schedule.count()
  if (!hasFullLocationAccessOnly || !hasFullPropertyTypeAccessOnly) {
    recordLimit = 1000;
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
    try {
      const docs = await Schedule.find(mainQuery)
        .sort(sortObj)
        .skip(skipRecords)
        .limit(recordLimit);
      const doc = await Schedule.find(query).count();
      count = doc;
      let docsToSend = [];
      let found = null;
      for (const thisScheduledVisit of docs) {
        thisScheduledVisit._doc.city = [];
        console.log(thisScheduledVisit._doc);
        for (const thisEntityOfScheduledVisit of thisScheduledVisit._doc.project) {
          console.log("------------------------------");
          let _q = {};
          if (entityQuery["$or"].length > 0) {
            _q = { name: thisEntityOfScheduledVisit.trim(), ...entityQuery };
          } else {
            _q = { name: thisEntityOfScheduledVisit.trim() };
          }
          if (entityQueryP["$or"].length > 0) {
            _q = {
              name: thisEntityOfScheduledVisit.trim(),
              $and: [entityQueryP],
            };
            if (entityQuery["$or"].length > 0) {
              _q["$and"].push(entityQuery);
            }
          }
          console.log(_q);
          try {
            const res = await Property.findOne(_q);
            if (res) {
              found = res;
              thisScheduledVisit._doc.city.push(res.city);
              console.log("test");
            } else {
              throw new Error("This name not found in properties");
            }
          } catch (err) {
            console.log(
              "Couldn't find this entity in properties, now looking in projects\nError was this btw ",
              err
            );
            let _q = {};
            if (entityQuery["$or"].length > 0) {
              _q = { name: thisEntityOfScheduledVisit.trim(), ...entityQuery };
            } else {
              _q = { name: thisEntityOfScheduledVisit.trim() };
            }
            if (entityQueryP["$or"].length > 0) {
              _q = {
                name: thisEntityOfScheduledVisit.trim(),
                $and: [entityQueryP],
              };
              if (entityQuery["$or"].length > 0) {
                _q["$and"].push(entityQuery);
              }
            }
            try {
              const response = await Project.findOne(_q);
              if (response) {
                found = response;
                console.log(response);
                console.log("==========");
                thisScheduledVisit._doc.city.push(response.city);
                console.log("test");
              } else {
                console.log(
                  "This entity was found neither in projects nor properties"
                );
              }
            } catch (err) {
              console.log(err);
            }
          }
        }
        if (hasFullAccess) {
          docsToSend.push(thisScheduledVisit);
        } else {
          if (found) {
            docsToSend.push(thisScheduledVisit);
            found = null;
            // for (let i = 0; i <= userLocationAccessData.length - 1; i++) {
            //   if (found[userLocationAccessData[i]._doc.locationAccessLevel.toLowerCase()] === userLocationAccessData[i]._doc.locationAccessValue) {
            //     for(let j=0; j<=userPropertyTypeAccessData.length; i++){
            //       if(found['property_type'] === userPropertyTypeAccessData[j]._doc.PropertyTypeAccessValue){
            //         docsToSend.push(thisScheduledVisit);
            //       } else{
            //         if(hasFullPropertyTypeAccessOnly){
            //           docsToSend.push(thisScheduledVisit)
            //         }
            //       }

            //     }
            //   }
            // }
          }
        }
      }
      if (hasFullAccess) {
        let matchQuery = {};
        if (query["$and"]) {
          matchQuery = query["$and"][0];
        } else if (query["$or"] && !Array.isArray(query["$or"])) {
          matchQuery = query["$or"];
        }
        const agg = await Schedule.aggregate([
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
          const agg = await Schedule.aggregate([
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
        if (i === 0) {
          aggObjStatus = findStatusCount(docsToSend);
          aggObjSubStatus = findSubStatusCount(docsToSend, query.latestStatus);
        }
      }
      if (i === no_of_times-1) {
        res.status(200).json({
          success: true,
          message: "Fetched Appointments list",
          count,
          relevantCount: docsToSend.length,
          docs: docsToSend,
          hasFullAccess,
          aggObjStatus,
          aggObjSubStatus
        });
      }
    } catch (e) {
      console.log("Error is", e);
      if (i === no_of_times-1) {
        res.status(501).json({
          success: false,
          message: "Couldnt fetch Appointments list",
        });
      }
    }
  }
});
router.post("/reschedule", async function (req, res) {
  const dataToUpdate = req.body.data;
  console.log("Starting to reschedule the following appointment");
  console.log(dataToUpdate);

  let newHistory = {
    type: "rescheduled",
    notes: dataToUpdate.notesForRescheduling,
    updateDate: Date.now(),
    newAppointmentDate: dataToUpdate.date,
    newTimeZone: dataToUpdate.timeZone,
    status: dataToUpdate.status,
    whatsappNumber: dataToUpdate.whatsappNumber,
    country: dataToUpdate.historyCountry,
    updateUser: dataToUpdate.updateUser,
    subStatus: dataToUpdate.subStatus,
  };

  dataToUpdate.history.push(newHistory);
  let sendEmailToUser = dataToUpdate.notifyUser;
  console.log({ sendEmailToUser });

  Schedule.findOneAndUpdate(
    { _id: dataToUpdate._id },
    {
      $set: {
        date: dataToUpdate.date,
        timeZone: dataToUpdate.timeZone,
        history: dataToUpdate.history,
        latestStatus: newHistory.status,
        latestSubStatus: newHistory.subStatus,
      },
    },
    { new: true }
  )
    .then((successResponse) => {
      console.log("Successfully rescheduled the following appointment");
      console.log(successResponse);

      var linkingValues = [];
      for (let i = 0; i < successResponse.project.length; i++) {
        linkingValues[i] = {
          projectname: successResponse.project[i],
          // url: successResponse.url[i],
        };
      }

      var emptyUrlString;
      var emptyProjectString;
      let anchorEmailTemplate = "";
      for (let i = 0; i < linkingValues.length; i++) {
        emptyUrlString = "";
        emptyProjectString = linkingValues[i].projectname;
        anchorEmailTemplate += `<a style="display:block;" href="https://assetzilla.com${emptyUrlString}">${emptyProjectString}</a>`;
      }
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
                    <h4 style="margin-top: 20px;font-size: 24px;color: #7EB041;font-weight: 600; padding: 20px; padding-bottom:10px;">Appointment Rescheduled</h4>
                       

                    <div
                        style="background: #FFFFFF;box-shadow: 0 2px 10px 3px #F6F6F6;border-radius: 29px;padding: 15px;margin-bottom:25px;">
                        <h4
                            style="font-size: 18px;color: #6A6A6A;text-align: center;margin-top: 30px;margin-bottom: 0px;font-weight: 500;">
                            Thanks for your booking.</h4>
                        <h4
                            style="font-size: 18px;color: #6A6A6A;text-align: center;margin-top: 10px;margin-bottom: 0px;font-weight: 500;">
                            Looking forward to meeting you!</h4>
                            <h4 style="font-size: 18px;color: #000;text-align: center;margin-top: 20px;margin-bottom: 8px; ">
                            Project/Property Name: ${anchorEmailTemplate}</h4>
                        <h4 style="font-size: 18px;color: #000;text-align: center;margin-top: 0px;margin-bottom: 10px; ">
                            Appointment Date: ${moment(
                              successResponse.date
                            ).format("dddd, MMMM Do YYYY")}</h4>
                    </div>
                    <div style="padding: 20px 15px; text-align: left; margin-bottom: 35px;">
                        <h5 style="font-size: 18px;color: #000; margin: 0; text-align: center;">More Details</h2>
                            <ul style="padding-left: 0;list-style: none; text-align: center;">
                                <li style="font-size: 18px;padding: 5px 0px;">Full Name: <span>${
                                  dataToUpdate.name
                                }</span>
                                </li>
                                <li style="font-size: 18px;padding:5px 0px;">Phone: <span>${
                                  dataToUpdate.phone
                                }</span></li>
                                <li style="font-size: 18px;padding: 5px 0px;">Email: <span>${
                                  dataToUpdate.email
                                }</span></li>
                                <li style="font-size: 18px;padding: 5px 0px;">Booked on: <span>${moment(
                                  successResponse.updatedAt
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
                                href="javascript:;"> support@assetzilla.com </a></li>
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

      var mailOptions1 = {
        from: appconstants.emailFrom,
        to: dataToUpdate.email,
        subject: appconstants.rescheduledSubject,
        html: userEmailTemplate,
      };
      console.log({
        "process.env.STAGING": process.env.STAGING,
        sendEmailToUser,
      });
      if (process.env.STAGING === "false" && sendEmailToUser) {
        transporter.sendMail(mailOptions1, function (error, info) {
          if (error) {
            console.log(
              "Error sending email for rescheduling appointment",
              error
            );
          } else {
            console.log(
              "Email sent successfully for rescheduling appointment: " +
                info.response
            );
          }
        });
      }

      res.status(200).json({
        success: true,
        message: "Appointment successsfully rescheduled",
        user: successResponse,
      });
    })
    .catch((failureError) => {
      console.log(
        "Failed to reschedule the following appointment because of ",
        failureError
      );
      console.log(dataToUpdate);
      res.status(200).json({
        success: false,
        message: "Couldn't Reschedule",
      });
    });
});
router.get("/unseen-schedules", async function (req, res) {
  try {
    let config = await AdminConfigSchema.findOne({});
    let date;
    if (config) {
      date = config.lastScheduleSeenAt;
      let newconfig = await config.update({ lastScheduleSeenAt: new Date() });
    } else {
      date = new Date();
      let newconfig2 = await AdminConfigSchema.create({
        lastScheduleSeenAt: date,
      });
    }

    let unseenCount = await Schedule.count({
      createdAt: { $gt: date },
    });

    console.log("+++++++++++++++++++", unseenCount);

    // res.render("nav.html", unseenCount)
    res.status(200).json({
      success: true,
      message: "Unseen schedules count",
      unseenCount: unseenCount,
    });
  } catch (err) {
    res.status(200).json({
      success: false,
      message: "Couldn't find unseen schedules",
    });
  }
});

module.exports = router;
