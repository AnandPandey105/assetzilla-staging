const readline = require("readline-sync");
const mongoose = require("mongoose");
var moment = require("moment");
var clc = require("cli-color");
var mapping = {
  log: clc.blue,
  warn: clc.yellow,
  error: clc.red,
};

["log", "warn", "error"].forEach(function (method) {
  var oldMethod = console[method].bind(console);
  console[method] = function () {
    oldMethod.apply(
      console,
      [
        mapping[method](
          "[" + moment(Date.now()).format("MMM Do | HH:mm A") + "]"
        ),
      ].concat(Array.from(arguments))
    );
  };
});

let uri = "mongodb://localhost:27017/realestate";
if (process.argv[2] === "--production") {
  uri =
    "mongodb://realestate:rEAleStAtepWd91608102022@3.87.184.6:27017/realestate?authSource=realestate&w=1&tls=false";
  console.log("******************Using production db...");
} else if (process.argv[2] === "--staging") {
  uri = "mongodb://43.241.135.244:27020/realestate?tls=false";
  console.log("******************Using STAGING db...");
}else {
  console.log(
    "******************Using localdb ..., you can give --production flag to use production db"
  );
}

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.on(
  "error",
  console.error.bind(console, "connection error:")
);
mongoose.connection.once("open", () => {
  console.log(
    "***************************************************************************************************Database Connected"
  );
});
const varToString = varObj => Object.keys(varObj)[0]
const doStuff = async () => {
  const { BookingPropertySchema } = require("../models/book_property.model");
  const cM = require("../models/consult.model");
  const { InterestedBuyerSchema } = require("../models/interested_buyer.model");
  const lPM = require("../models/loan_project.model");
  const sM = require("../models/schedule.model");
  const usp = require("../models/user_submitted_properties.model");

  const buyLeads = [BookingPropertySchema, cM, InterestedBuyerSchema, lPM, sM, usp];
  let count = 0;
  for (const leads of buyLeads) {
    let x = buyLeads[count];
    let allLeads = await leads.find({});
    for (const lead of allLeads){
      let ss = lead.latestSubStatus;
      let s = lead.latestStatus;
      if (lead._doc.history && lead._doc.history.length > 0) {
        if (lead._doc.history[0].updated){
          lead._doc.history.sort((a, b) => (a.updated < b.updated ? 1 : -1));
        } else {
          lead._doc.history.sort((a, b) => (a.updateDate < b.updateDate ? 1 : -1));
        }
        ss = lead._doc.history[0].subStatus || "";
        s = lead._doc.history[0].status || "";
        if (!ss || !s){
          console.log(ss, s);
          console.log({latestStatus:s, latestSubStatus: ss})
          readline.question('=>?');
        }
      } else {
        console.log(lead._doc.history);
        // readline.question("");
      }
      
      let r = await leads.findOneAndUpdate({_id: lead._id}, {latestStatus:s, latestSubStatus: ss}, {timestamps:false, new:true});
      if (r){
        console.log(varToString({x}) + " " + lead._id + " updated", lead._doc.history && lead._doc.history.length > 0);
      }
    }
    count++;
  }
};

doStuff().then(() => {
  mongoose.connection.close();
  console.log(
    "***************************************************************************************************Connection closed"
  );
});
