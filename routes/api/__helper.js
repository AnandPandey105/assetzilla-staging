const User = require("../../models/user.model");
const { urlToName } = require("../../_helpers/urlToName");
var phoneUtil = require("google-libphonenumber").PhoneNumberUtil;
const Filters = require("../../classes/filters");
const Elastic = require("../../classes/elasticsearch");
const { groupArray } = require("../../utilities/groupArray");

const removePercent20 = (str) => {
  while (str.includes("%20")) {
    str = str.replace("%20", " ");
  }
  return str;
};

const getPropertiesAvailable = async (url) => {
  try {
    let inquiryAboutUrl = url;
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
            0
          );
          console.log(response);
          return response.count;
        }
      }
    } else {
      return "error";
    }
  } catch (e) {
    console.log("ERROR While interested buyer", e);
    return "ERROR";
  }
};

const getUserLocationLevelAccessInfo = async (email) => {
  let returnObj = undefined;
  await User.findOne({ email: email })
    .then((doc) => {
      if (doc) {
        // if (doc.locationAccessValue && doc.locationAccessLevel){
        //     returnObj = {locationAccessLevel:doc.locationAccessLevel, locationAccessValue:doc.locationAccessValue}
        // } else if(doc.locationAccessLevel === "*"){
        //   returnObj = {locationAccessLevel:'all', locationAccessValue:'all'}
        // }
        if (doc.locationAccess) {
          returnObj = doc.locationAccess;
        }
      } else {
        //user does not exist
        returnObj = undefined;
      }
    })
    .catch((e) => {
      console.log(e);
      returnObj = undefined;
    });
  return returnObj;
};

const getUserPropertyLevelAccessInfo = async (email) => {
  let returnObj = undefined;
  await User.findOne({ email: email })
    .then((doc) => {
      if (doc) {
        if (doc.propertyTypeAccess) {
          returnObj = doc.propertyTypeAccess;
        }
      } else {
        //user does not exist
        returnObj = undefined;
      }
    })
    .catch((e) => {
      console.log(e);
      returnObj = undefined;
    });
  return returnObj;
};

const fetchLeadsData = async (phoneNumber) => {
  let returnObj = {};
  //phoneNumber is username of user
  console.log({ phoneNumber });

  //All Schemas
  const BookingProperty = require("../../models/book_property.model"); //number
  const Consultation = require("../../models/consult.model"); //phone
  const InterestedBuyer = require("../../models/interested_buyer.model"); //number
  const LeadsBuyer = require("../../models/loan_project.model"); //phone
  const Schedule = require("../../models/schedule.model"); //phone
  try {
    // const relevantBookingInquiries =
    //   await BookingProperty.BookingPropertySchema.find({
    //     $or: [{ number: phoneNumber }, { number: "0"+phoneNumber }, { number: "91"+phoneNumber },  { number: "+91"+phoneNumber },
    //     { registeredMobileNumber: phoneNumber }, { registeredMobileNumber: "0"+phoneNumber }, { registeredMobileNumber: "91"+phoneNumber }, { registeredMobileNumber: "+91"+phoneNumber }, ],
    //   }).sort({ created: -1 });

    //   const relevantConsultations = await Consultation.find({
    //   $or: [{ phone: phoneNumber }, { phone: "0"+phoneNumber }, { phone: "91"+phoneNumber },  { phone: "+91"+phoneNumber },
    //   { registeredMobileNumber: phoneNumber }, { registeredMobileNumber: "0"+phoneNumber }, { registeredMobileNumber: "91"+phoneNumber }, { registeredMobileNumber: "+91"+phoneNumber }, ],
    // }).sort({ created: -1 });

    // const relevantInterestedBuyers =
    //   await InterestedBuyer.InterestedBuyerSchema.find({
    //     $or: [{ number: phoneNumber }, { number: "0"+phoneNumber }, { number: "91"+phoneNumber },  { number: "+91"+phoneNumber },
    //     { registeredMobileNumber: phoneNumber }, { registeredMobileNumber: "0"+phoneNumber }, { registeredMobileNumber: "91"+phoneNumber }, { registeredMobileNumber: "+91"+phoneNumber }, ],
    //   }).sort({ created: -1 });

    // const relevantLeadsBuyers = await LeadsBuyer.find({
    //   $or: [{ phone: phoneNumber }, { phone: "0"+phoneNumber }, { phone: "91"+phoneNumber },  { phone: "+91"+phoneNumber },
    //   { registeredMobileNumber: phoneNumber }, { registeredMobileNumber: "0"+phoneNumber }, { registeredMobileNumber: "91"+phoneNumber }, { registeredMobileNumber: "+91"+phoneNumber }, ],
    // }).sort({ updated: -1 });

    // const relevantSchedules = await Schedule.find({
    //   $or: [{ phone: phoneNumber }, { phone: "0"+phoneNumber }, { phone: "91"+phoneNumber },  { phone: "+91"+phoneNumber },
    //   { registeredMobileNumber: phoneNumber }, { registeredMobileNumber: "0"+phoneNumber }, { registeredMobileNumber: "91"+phoneNumber }, { registeredMobileNumber: "+91"+phoneNumber }, ],
    // }).sort({ date: -1 });

    const relevantBookingInquiries =
      await BookingProperty.BookingPropertySchema.find({
        $or: [{ number: phoneNumber }, { registeredMobileNumber: phoneNumber }],
      }).sort({ created: -1 });
    const relevantConsultations = await Consultation.find({
      $or: [{ phone: phoneNumber }, { registeredMobileNumber: phoneNumber }],
    }).sort({ created: -1 });
    const relevantInterestedBuyers =
      await InterestedBuyer.InterestedBuyerSchema.find({
        $or: [{ number: phoneNumber }, { registeredMobileNumber: phoneNumber }],
      }).sort({ created: -1 });
    const relevantLeadsBuyers = await LeadsBuyer.find({
      $or: [{ phone: phoneNumber }, { registeredMobileNumber: phoneNumber }],
    }).sort({ updated: -1 });
    const relevantSchedules = await Schedule.find({
      $or: [{ phone: phoneNumber }, { registeredMobileNumber: phoneNumber }],
    }).sort({ date: -1 });

    const Property = require("../../models/property.model");
    const Project = require("../../models/project.model");

    let relevantBookingInquiries_modified = [];
    for (const entity of relevantBookingInquiries) {
      if (entity.history && entity.history.length > 1) {
        entity.history.sort((a, b) => (a.updated < b.updated ? 1 : -1));
      }
      try {
        const Property = require("../../models/property.model");
        let res = await Property.findOne({ url: entity._doc.property });
        if (res) {
          entity._doc["property_name"] = res._doc.name;
        }
      } catch (e) {
        console.log(e);
      }
      entity._doc.created = entity._doc.created.toDateString();
      relevantBookingInquiries_modified.push(entity._doc);
    }
    returnObj["bookingInquiries"] = relevantBookingInquiries_modified;

    let relevantConsultations_modified = [];
    for (const entity of relevantConsultations) {
      if (entity.history && entity.history.length > 1) {
        entity.history.sort((a, b) => (a.updated < b.updated ? 1 : -1));
      }
      entity._doc.created = entity._doc.created.toDateString();
      relevantConsultations_modified.push(entity._doc);
    }
    returnObj["consultation"] = relevantConsultations_modified;

    let relevantInterestedBuyers_modified = [];
    for (const entity of relevantInterestedBuyers) {
      if (entity._doc.history && entity._doc.history.length > 1) {
        entity._doc.history.sort((a, b) => (a.updated < b.updated ? 1 : -1));
      }
      if (entity.url) {
        entity._doc.name = urlToName(entity.url);
      }

      if (entity.url && entity.url.includes("city")) {
        let temp = entity.url.split("city=")[1];
        temp = temp.split("&")[0];
        entity._doc.city = temp;
      } else {
        await Project.findOne({
          name: entity.inquiry_about.slice(10),
        })
          .then(async (res) => {
            if (res) {
              console.log(res._doc.city);
              entity._doc.city = res._doc.city;
            } else {
              console.log("This project was not found");
            }
          })
          .catch((err) =>
            console.log(
              "Couldn't fetch city for this Interested Buyer " + entity + err
            )
          );
      }
      if (entity._doc.url) {
        if (entity._doc.url.includes("?project=")) {
          let u = entity._doc.url.split("?project=")[1];
          u = removePercent20(u);
          let ur = await Project.findOne({ name: u });
          if (ur) {
            entity._doc.url_with_project = ur.url;
          } else {
            entity._doc.url_with_project = entity._doc.url;
          }
        } else {
          entity._doc.url_with_project = entity._doc.url.replace(
            "properties",
            "projects"
          );
        }
        entity._doc.propertiesAvailable = await getPropertiesAvailable(
          entity._doc.url
        );
      }
      entity._doc.created = entity._doc.created.toDateString();
      relevantInterestedBuyers_modified.push(entity._doc);
    }
    returnObj["interestedBuyers"] = relevantInterestedBuyers_modified;

    let relevantLeadsBuyers_modified = [];
    for (const entity of relevantLeadsBuyers) {
      if (entity.history && entity.history.length > 1) {
        entity.history.sort((a, b) => (a.updated < b.updated ? 1 : -1));
      }
      await Project.findOne({ name: entity.project })
        .then(async (response) => {
          console.log("in projects then");
          if (response) {
            console.log("Found in projects");
            entity._doc["city"] = response._doc.city;
            console.log(entity, response._doc.city);
          } else {
            console.log("Not found in projects also");
          }
        })
        .catch((error) => {
          console.log("Error", error);
        });
      entity._doc.createdAt = entity._doc.createdAt.toDateString();
      relevantLeadsBuyers_modified.push(entity._doc);
      console.log(entity);
    }
    returnObj["leadsBuyers"] = relevantLeadsBuyers_modified;

    let relevantSchedules_modified = [];
    for (const entity of relevantSchedules) {
      if (entity._doc.history && entity._doc.history.length > 1) {
        entity._doc.history.sort((a, b) =>
          a.updateDate < b.updateDate ? 1 : -1
        );
        let oldHistory = entity._doc.history;
        if (oldHistory.length > 1) {
          for (let i = 0; i < oldHistory.length; i++) {
            let show = true;
            if (i === oldHistory.length - 1) {
              show = true;
            } else {
              if (
                oldHistory[i].newAppointmentDate ===
                  oldHistory[i + 1].newAppointmentDate ||
                oldHistory[i].newTimeZone === oldHistory[i + 1].newTimeZone
              ) {
                show = false;
              } else {
                show = true;
              }
            }
            oldHistory[i]._doc.show = show;
          }
        }
        entity._doc.history = oldHistory;
        console.log(oldHistory);
        console.log(entity._doc.history);
      }
      for (const en of entity.project) {
        console.log({ name: en.trim() });
        await Property.findOne({ name: en.trim() })
          .then(async (res) => {
            console.log(res);
            //if res is null then the following will fail and code will move to catch block
            entity.city.push(res.city);
          })
          .catch(async (err) => {
            console.log(
              "Couldn't find this entity in properties, now looking in projects\nError was this btw ",
              err
            );
            await Project.findOne({ name: en })
              .then(async (response) => {
                console.log("in projects then");
                if (response) {
                  console.log("Found in projects");
                  entity.city.push(response.city);
                } else {
                  console.log("Not found in projects also");
                }
              })
              .catch((error) => {
                console.log(
                  "This entity was found neither in projects nor properties",
                  error
                );
              });
          });
      }
      entity._doc.createdAt = entity._doc.createdAt.toDateString();
      entity._doc.date = entity._doc.date.toDateString();
      relevantSchedules_modified.push(entity._doc);
    }
    returnObj["schedules"] = relevantSchedules_modified;

    const submittedProperties = require("../../models/user_submitted_properties.model");
    const Customer = require("../../models/customer.model");

    try {
      let usps = [];
      let thisUser = await Customer.findOne({ username: phoneNumber });

      if (thisUser) {
        let allusps = await submittedProperties.find({
          $or: [{ user: thisUser._id }, { username: phoneNumber }],
        });
        returnObj["submittedProperties"] = allusps;
      } else {
        returnObj["submittedProperties"] = [];
      }
    } catch (e) {
      console.log(e);
    }
    returnObj["success"] = true;
  } catch (e) {
    console.log("Error => ", e);
    returnObj = { success: false, msg: "Error", e };
  }

  return returnObj;
};

const addToNewsletter = async (emailToAdd) => {
  try {
    const Newsletter = require("../../models/newsletter");

    await Newsletter.findOne({ email: emailToAdd })
      .then(async (res) => {
        if (res) {
          console.log(
            "This user is already present in newsletters database.",
            " | ",
            emailToAdd
          );
          if (res.isSubscribed) {
            console.log(
              "And is also subscribed for receiving newletters",
              " | ",
              emailToAdd
            );
          } else {
            console.log(
              "But had earlier unsubscribed from receiving emails, turning it back on.",
              " | ",
              emailToAdd
            );
            await Newsletter.findOneAndUpdate(
              { email: emailToAdd },
              { isSubscribed: true },
              { new: true }
            ).then((doc) => {
              console
                .log(
                  "Successfully turned on the newsletters for the user",
                  " | ",
                  emailToAdd
                )
                .catch((e) => console.log(e));
            });
          }
        } else {
          let newNewsletter = new Newsletter();
          newNewsletter.email = emailToAdd;
          newNewsletter.isSubscribed = true;
          console.log(`${emailToAdd} is being added to newsletters database`);
          console.log(newNewsletter);
          await newNewsletter
            .save()
            .then((res) => {
              console.log(
                `${emailToAdd} was successfully added to newsletters database`
              );
              console.log(res);
            })
            .catch((e) =>
              console.log(
                "Some error occurred while adding this new user to newsletters ",
                emailToAdd,
                e
              )
            );
        }
      })
      .catch((e) =>
        console.log(
          "Some error occurred while finding the user ",
          emailToAdd,
          e
        )
      );
  } catch (error) {
    console.log(
      "Error occurred while adding email to newsletter",
      emailToAdd,
      error
    );
  }
};

const isPhoneNumberValid = (num) => {
  try {
    let tel = new phoneUtil();
    let r = tel.parse(num);
    if (r) {
      var h = {
        a: tel.isPossibleNumberWithReason(r),
        b: tel.isValidNumber(r),
        c: tel.isPossibleNumber(r),
      };
      console.log({ num, ...h });
    }
    // return h.b;
    if (h.b) {
      let ph = tel.getNationalSignificantNumber(r);
      return ph;
    }
    return false;
  } catch (e) {
    console.log(e);
    return false;
  }
};

const getEmiPerLac = async () => {
  try {
    const EMIPerLac = require("../../models/emi_per_lac.model");
    let results = await EMIPerLac.findOne({});
    if (results) {
      return { emi_per_lac: results.emi_per_lac, success: true };
    } else {
      return { success: false, message: "DoesNotExist" };
    }
  } catch (e) {
    console.log(e);
    return { success: false };
  }
};

const findStatusCount = (arr) => {
  let returnObj = {};

  const x = groupArray(arr, "latestStatus");

  if (x) {
    let y = Object.keys(x);
    for (const k of y) {
      if (!k || k === "null") {
        if (!returnObj["Blank"]) {
          returnObj["Blank"] = x[k].length;
        } else {
          returnObj["Blank"] = x[k].length + returnObj["Blank"];
        }
      } else {
        returnObj[k] = x[k].length;
      }
    }
  }
  const ok = Object.keys(returnObj);
  returnObj["All"] = 0;
  for (const i of ok) {
    returnObj["All"] = returnObj["All"] + returnObj[i];
  }

  return returnObj;
};

const findSubStatusCount = (arr, status) => {
  let returnObj = {};

  const x = groupArray(arr, "latestSubStatus");

  if (x) {
    let y = Object.keys(x);
    for (const k of y) {
      if (!k || k === "null" || k === "undefined") {
        if (!returnObj["Blank"]) {
          returnObj["Blank"] = x[k].length;
        } else {
          returnObj["Blank"] = x[k].length + returnObj["Blank"];
        }
      } else {
        returnObj[k] = x[k].length;
        const l = arr.filter(
          (a) => a.latestStatus === status && a.latestSubStatus === k
        );
        if (l.length !== returnObj[k]) {
          returnObj[k] = l.length;
        }
      }
    }
  }

  return returnObj;
};

module.exports = {
  getUserLocationLevelAccessInfo,
  getUserPropertyLevelAccessInfo,
  fetchLeadsData,
  addToNewsletter,
  isPhoneNumberValid,
  getPropertiesAvailable,
  getEmiPerLac,
  findStatusCount,
  findSubStatusCount,
};
