const InterestedBuyers = require("../../models/interested_buyer.model");
const Property = require("../../models/property.model");
const generateEmailTemplate = require("./generateEmailTemplate");
const appconstants = require("../../appConstants");
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport(appconstants.nodemailerAuth);
const { urlToName } = require("../../_helpers/urlToName");
Elastic = require("../elasticsearch");
Filters = require("../filters");

const removePercent20 = (str) => {
  while (str.includes("%20")) {
    str = str.replace("%20", " ");
  }
  return str;
};

const sendNotificationToInterestedBuyers = async () => {
  const allInterestedBuyers = await InterestedBuyers.InterestedBuyerSchema.find(
    {}
  );
  const sendEmail = async (user, project, count, url, results) => {
    let emailTemplate = generateEmailTemplate(count, url, project, results, user.email);
    var mailOptions = {
      from: appconstants.emailFrom,
      to: user.email,
      subject: `Properties now available in ${project}`,
      html: emailTemplate,
    };

    const sendEmailPromise = () => {
      return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log("Error sending email to ", user, error);
            resolve(false);
          } else {
            console.log("Email sent successfully: " + info.response);
            resolve(true);
          }
        });
      });
    };

    await sendEmailPromise().then(async (doc) => {
      await InterestedBuyers.InterestedBuyerSchema.findOneAndUpdate(
        { _id: user._id },
        { $set: { notified: { is_notified: true, propertyCount: count } } },
        { new: true, timestamps: false }
      )
        .then((doc) => {
          if (doc) console.log("Successfully updated interested buyer");
          else console.log("Could not find the interested buyer", user);
        })
        .catch((error) => {
          console.log("Error while updating the interested buyer", error);
        });
    });
  };
  for (const thisInterestedBuyer of allInterestedBuyers) {
    if(thisInterestedBuyer._doc.isSubscribed){
      console.log("----------------")
      console.log(`Looking for ${thisInterestedBuyer._doc.email} because isSubscribed = ${thisInterestedBuyer._doc.isSubscribed}`)
      let shouldNotificationBeSent = true;
      //when inquiry is about a project
      if (thisInterestedBuyer._doc.inquiry_about.includes("project = ")) {
        console.log(thisInterestedBuyer._doc.inquiry_about);
        let project_name =
          thisInterestedBuyer._doc.inquiry_about.split("project = ")[1];

        try {
          const numberOfPropertiesAvailable = await Property.find({
            project: project_name,
            is_live: "2",
          });
          console.log(project_name, numberOfPropertiesAvailable.length);
          console.log(thisInterestedBuyer._doc.notified);
          if (numberOfPropertiesAvailable.length > 0) {
            if (thisInterestedBuyer._doc.notified) {
              if (thisInterestedBuyer._doc.notified.is_notified) {
                console.log(
                  `${numberOfPropertiesAvailable.length} <= ${thisInterestedBuyer._doc.notified.propertyCount}`,
                  numberOfPropertiesAvailable.length <=
                    thisInterestedBuyer._doc.notified.propertyCount
                );
                if (
                  numberOfPropertiesAvailable.length <=
                  thisInterestedBuyer._doc.notified.propertyCount
                ) {
                  shouldNotificationBeSent = false;
                }
              }
            }
            if (shouldNotificationBeSent) {
              console.log("Sending Email");
              let url =  "https://assetzilla.com/properties?project=" + project_name;
              if (process.env.STAGING === 'false' || true){
                await sendEmail(
                  thisInterestedBuyer._doc,
                  project_name + " Project",
                  numberOfPropertiesAvailable.length,
                  url,
                  numberOfPropertiesAvailable,
                  thisInterestedBuyer._doc.email
                );
              }
            }
          }
        } catch (e) {
          console.log(e);
        }
      } else {
        try {
          let inquiryAboutUrl = thisInterestedBuyer._doc.url;
          console.log("=-=-=", inquiryAboutUrl);
          if (inquiryAboutUrl) {
            inquiryAboutUrl = inquiryAboutUrl.split("/properties?");
            if (inquiryAboutUrl.length === 2) {
              inquiryAboutUrl = inquiryAboutUrl[1].split("&");
              console.log(">>->>->>", inquiryAboutUrl);
              if (inquiryAboutUrl.length > 0) {
                let query = {};
                for (const ele of inquiryAboutUrl) {
                  let filter = ele.split("=");
                  if (filter.length === 2) {
                    if (filter[1].includes("%20")) {
                      filter[1] = removePercent20(filter[1]);
                    }
                    if (filter[1].includes(",")) {
                      filter[1] = filter[1].split(",");
                    }
                    query[filter[0]] = filter[1];
                  }
                }
                console.log(query);
                let filters = await Filters.property_filters(query);
                filters.must.push({ term: { is_live: "2" } });
                const property_fields = [
                  "name",
                  "url",
                  "subcity",
                  "city",
                  "property_type",
                  "bhk_space",
                  "furnished",
                  "banner_image",
                  "location.location",
                  "id",
                  "condition",
                  "images",
                  "price",
                  "builder",
                  "area",
                  "sq_fit_cost",
                  "views",
                ];
                const response = await Elastic.get_entities(
                  "",
                  "property",
                  1200,
                  property_fields,
                  filters,
                  0,
                );
                console.log(response);
                if (response && response.count && response.count >= 1) {
                  response.results.sort((a,b)=>(a.price && a.price.price && b.price && b.price.price )&& (a.price.price < b.price.price) ? -1 : 1)
                  if (thisInterestedBuyer._doc.notified.is_notified) {
                    console.log(
                      `${response.count} <= ${thisInterestedBuyer._doc.notified.propertyCount}`,
                      response.count <=
                        thisInterestedBuyer._doc.notified.propertyCount
                    );
                    if (
                      response.count <=
                      thisInterestedBuyer._doc.notified.propertyCount
                    ) {
                      shouldNotificationBeSent = false;
                      console.log("Notification is already sent")
                    }
                  }
                  if (shouldNotificationBeSent) {
                    console.log("Sending Email");
                    let url =
                      "https://assetzilla.com" + thisInterestedBuyer._doc.url;
                    let name = urlToName(thisInterestedBuyer._doc.url);
                    thisInterestedBuyer.name = name;
                    console.log(thisInterestedBuyer);

                    await sendEmail(
                      thisInterestedBuyer._doc,
                      thisInterestedBuyer._doc.name,
                      response.count,
                      url,
                      response.results,
                      thisInterestedBuyer._doc.email
                    );
                  }
                }
              }
            }
          }
        } catch (e) {
          console.log("ERROR While interested buyer", e);
        }
      }
    } else{
      console.log(`Skipping ${thisInterestedBuyer._doc.email} because isSubscribed = ${thisInterestedBuyer._doc.isSubscribed}`)
    }
  }
};

module.exports = { sendNotificationToInterestedBuyers };
