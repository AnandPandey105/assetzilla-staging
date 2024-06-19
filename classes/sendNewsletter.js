const CustomerSchema = require("../models/customer.model");
const NewsletterSchema = require("../models/newsletter");
const NewsSchema = require("../models/news.model");
const CitiesSchema = require("../models/city.model");
const appconstants = require("../appConstants");
const nodemailer = require("nodemailer");
const generateNewsLetter = require("./sendNewsLetterTemplate");
const generateReportTemplate = require("./sendNewsletterReportTemplate");
const transporter = nodemailer.createTransport(appconstants.nodemailerAuthNewsletter);
const moment = require("moment-timezone");

const sendEmailReport = {
  success: {count:0, emails:[]},
  failure: {count:0, emails:[]}
}

const getAllEmailsAndNames = async () => {
  const customerEmailsAndNames = [];
  if (false) {
    const allCustomerObjects = await CustomerSchema.find({});
    allCustomerObjects.forEach((customer) => {
      if (customer.email) {
        customerEmailsAndNames.push({
          email: customer.email,
          name: customer.name,
        });
      }
    });
  } else if (true) {
    const allNewsletterEmails = await NewsletterSchema.find({
      isSubscribed: true,
    });
    // console.log(allNewsletterEmails);
    if (allNewsletterEmails.length > 0) {
      for (customer of allNewsletterEmails) {
        customerEmailsAndNames.push({
          email: customer.email,
          name: "",
        });
      }
    }
  } else {
    // customerEmailsAndNames.push({ email: "tejas@teson.in", name: "" });
    for (let i = 0; i < 3; i++) {
      customerEmailsAndNames.push({ email: "akshay@teson.in", name: "" });
      // customerEmailsAndNames.push({ email: "tejas@teson.in", name: "" });
    }
  }
  return customerEmailsAndNames;
};

const getNewsArticlesToSend = async () => {
  const search_criteria = {
    $and: [{ publish_date: { $exists: true } }, { is_live: "2" }],
  };
  const sort_criteria = { publish_date: -1 };
  const numberOfArticlesToReturn = 5;

  const newsArticlesToSend = await NewsSchema.find(search_criteria)
    .sort(sort_criteria)
    .limit(numberOfArticlesToReturn);

  return newsArticlesToSend;
};

const getTopTags = async () => {
  if (!Elastic) var Elastic = require("./elasticsearch");

  const topTags = await Elastic.get_top_entities(
    [{ term: { doc_type: "news" } }, { term: { is_live: "2" } }],
    "tags",
    {},
    10
  );
  return topTags;
};

const getCityNames = async () => {
  let cityNames = [];
  let allCities = await CitiesSchema.find({ is_live: "2" });
  allCities.forEach((city) => {
    cityNames.push(city.name);
  });
  console.log(cityNames);

  if (!Elastic) var Elastic = require("./elasticsearch");
  
  const topTags = await Elastic.get_top_entities(
    [{ term: { doc_type: "news" } }, { term: { is_live: "2" } }],
    "tags",
    {},
    10000
  );

  // console.table(topTags);
  console.log(topTags.length);
  
  let returnObjs = []
  for(tag of topTags){
    if (cityNames.includes(tag.key)){
      returnObjs.push(tag);
    }
  }
  console.table(returnObjs)
  return returnObjs;
};

const sendEmailReportNow = () => {
  return new Promise((resolve, reject) => {
    let userEmailTemplate = generateReportTemplate(sendEmailReport);
    var mailOptions = {
      from: `AssetZilla Newsletter Report <${appconstants.emailFromNewsletter}>`,
      to: 'udit.sharma_1989@yahoo.com, tejas@teson.in, nayan14jain@gmail.com, sonalikul1999@gmail.com, akshay@teson.in',
      subject: `AssetZilla Sunday Newsletter Report: ${moment(Date.now()).tz("Asia/Kolkata").format("MMMM DD, yyyy")}`,
      html: userEmailTemplate,
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log("Error sending email to ", error);
        resolve(false);
      } else {
        console.log("Email sent successfully: " + info.response);
        resolve(true);
      }
    });
  });
};

const sendEmail = (user, newsArticlesToSend, topTags, cityNames, report) => {
  return new Promise((resolve, reject) => {
    let userEmailTemplate = generateNewsLetter(
      user.name,
      newsArticlesToSend,
      topTags,
      user.email,
      cityNames
    );
    var mailOptions = {
      from: `AssetZilla Newsletter <${appconstants.emailFromNewsletter}>`,
      to: user.email,
      subject: `AssetZilla Sunday Newsletter: ${moment(Date.now())
        .tz("Asia/Kolkata")
        .format("MMMM DD, yyyy")}`,
      html: userEmailTemplate,
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log("Error sending email to ", user, error);
        sendEmailReport.failure.count++;
        sendEmailReport.failure.emails.push(user.email);
        resolve(false);
      } else {
        console.log("Email sent successfully: " + info.response);
        sendEmailReport.success.count++;
        sendEmailReport.success.emails.push(user.email);
        resolve(true);
      }
    });
  });
};

const sendNewsletter = async () => {
  const emailsAndNames = await getAllEmailsAndNames();
  console.table(emailsAndNames);

  const newsArticlesToSend = await getNewsArticlesToSend();
  console.log(newsArticlesToSend);
  console.log(newsArticlesToSend.length);

  const topTags = await getTopTags();
  console.table(topTags);

  const cityNames = await getCityNames();

  console.log("sending newsletter to => ", emailsAndNames);
  console.log("STAGING => ", process.env.STAGING)
  for (const user of emailsAndNames) {
    if (process.env.STAGING === 'false'){
      await sendEmail(user, newsArticlesToSend, topTags, cityNames);
    }
  }
  sendEmailReport.total = emailsAndNames.length
  console.log(sendEmailReport);

  console.log(`============AssetZilla Sunday Newsletter Report: ${moment(Date.now()).tz("Asia/Kolkata").format("MMMM DD, yyyy")}=============`);
  console.log("=======Success Count: ", sendEmailReport.success.count);
  console.log("=======Failure Count: ", sendEmailReport.failure.count);
  console.log("=======Total Count: ", sendEmailReport.total);
  console.log("=================Success Emails:");
  sendEmailReport.success.emails.forEach((r)=>console.log("==== ", r));
  console.log("=================Failure Emails:");
  sendEmailReport.failure.emails.forEach((r)=>console.log("==== ", r));
  console.log("==============================================================================================================")

  if (process.env.STAGING === 'false'){
    await sendEmailReportNow();
  }
};

module.exports = sendNewsletter;
