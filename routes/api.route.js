const {isPhoneNumberValid} = require("./api/__helper");
const EMIPerLac = require("../models/emi_per_lac.model");

module.exports = function (app, express) {
  // Calling In all API Routes
  const user = require("./api/user.route");
  const property = require("./api/property.route");
  const builder = require("./api/builder.route");
  const project = require("./api/project.route");
  const propertyType = require("./api/propertyType.route");
  const authority = require("./api/authority.route");
  const subcity = require("./api/subcity.route");
  const city = require("./api/city.route");
  const district = require("./api/district.route");
  const state = require("./api/state.route");
  const graph = require("./api/graph.route");
  const bank = require("./api/bank.route");
  const buyer = require("./api/buyer.route");
  const search = require("./api/search.route");
  const location = require("./api/location.route");
  const customer = require("./api/customer.route");
  const news = require("./api/news.route");
  const mailer = require("./api/mailer.route");
  const reason = require("./api/reason.route");
  const consult = require("./api/consult.route");
  const loan = require("./api/loan.route");
  const loanProject = require("./api/loan_project.route");
  const getFilterData = require("./api/getFilterData.route");
  const newsletter = require("./api/newsletter.route");
  const schedule = require("./api/schedule.route");
  const interested_buyer = require("./api/interestedBuyer.route");
  const booking_property = require("./api/bookingProperty.route");
  const usp = require("./api/user_submitted_properties.route");

  // Mapping URLs
  app.use("/api/user", user);
  app.use("/api/property", property);
  app.use("/api/builder", builder);
  app.use("/api/authority", authority);
  app.use("/api/project", project);
  app.use("/api/propertyType", propertyType);
  app.use("/api/subcity", subcity);
  app.use("/api/city", city);
  app.use("/api/district", district);
  app.use("/api/state", state);
  app.use("/api/graph", graph);
  app.use("/api/bank", bank);
  app.use("/api/buyer", buyer);
  app.use("/api/search", search);
  app.use("/api/location", location);
  app.use("/api/customer", customer);
  app.use("/api/news", news);
  app.use("/api/mailer", mailer);
  app.use("/api/reason", reason);
  app.use("/api/consult", consult);
  app.use("/api/loan", loan);
  app.use("/api/loanProject", loanProject);
  app.use("/api/getFilterData", getFilterData);
  app.use("/api/newsletter", newsletter);
  app.use("/api/schedule", schedule);
  app.use("/api/interested_buyer", interested_buyer);
  app.use("/api/booking_property", booking_property);
  app.use("/api/usp", usp);

  app.post("/api/validatePhoneNumber", (req, res) => {
    if (req.headers.origin && process.env.AXIOS_BASE_URL.includes(req.headers.origin)){
      let x = isPhoneNumberValid(req.body.number);
      res.status(200).json({
        valid:x
      })
    } else {
      res.status(200).json({
        msg:"unauthorized"
      })
    }    
  });

  app.post("/api/setEmiPerLac",async (req, res) => {
    try {
      const results = await EMIPerLac.findOneAndUpdate({}, {emi_per_lac: Number(req.body.emi_per_lac)}, {new:true});
      if (results) {
        res.status(200).json({
          success: true,
          msg: "EMI Per Lac is saved as : " + results.emi_per_lac,
          emi_per_lac: results.emi_per_lac
        })
      } else {
        const emiPerLac = new EMIPerLac();
        emiPerLac.emi_per_lac = Number(req.body.emi_per_lac);
        emiPerLac.save();
        res.status(200).json({
          success: true,
          msg: "EMI Per Lac is saved as : " + req.body.emi_per_lac
        });
      }
    } catch (e) {
      res.status(200).json({
        success: false,
        msg: "error occurred",
        e
      })
    }
  });

  app.post("/api/getEmiPerLac",async (req, res) => {
    try {
      const results = await EMIPerLac.findOne({});
      if (results) {
        res.status(200).json({
          success: true,
          msg: "EMI Per Lac is saved as : " + results.emi_per_lac,
          emi_per_lac: results.emi_per_lac
        })
      } else {
        res.status(200).json({
          success: true,
          msg: "First Time"
        });
      }
    } catch (e) {
      res.status(200).json({
        success: false,
        msg: "error occurred",
        e
      })
    }
  })
};
