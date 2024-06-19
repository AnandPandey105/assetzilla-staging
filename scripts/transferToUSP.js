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
} else {
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

const doStuff = async () => {
  const Customer = require("../models/customer.model");
  const allCustomers = await Customer.find({});
  const totalCustomers = await Customer.countDocuments({});

  const USP = require("../models/user_submitted_properties.model");

  let count = 0;
  for (const lead of allCustomers) {
    console.log(
      count,
      totalCustomers,
      ((count / totalCustomers) * 100).toFixed(2),
      "%"
    );
    // -----------------------------------------------------------------------------------

    let sp_of_lead = lead.submitted_property;
    if (sp_of_lead.length > 0) {
      console.log(`This user (${lead.name + " " + lead.username}) has submitted ${sp_of_lead.length} property(s)`);
      for (const sp of sp_of_lead) {
        let usp = new USP();
        console.log(usp);
        // readline.question();
        let allKeys = Object.keys(sp);
        for (let i = 0; i < allKeys.length; i++) {
          let key = allKeys[i];
          let value = sp[key];
          if (key === 'submittedOn'){
            // readline.question(value);
            value = new Date(value);
            // console.log(value);
            // readline.question()
          }
          usp[key] = value;
        }
        usp.user = lead._id;
        console.log(usp);
        // readline.question();
        try{
          let s = await usp.save();
          console.log(s);
        } catch(e){
          console.log(e);
        }
        // readline.question();
      }
    } else {
      console.log("No Properties Submitted by user: ", lead.username);
    }

    // -----------------------------------------------------------------------------------
    count++;
  }
};

doStuff().then(() => {
  mongoose.connection.close();
  console.log(
    "***************************************************************************************************Connection closed"
  );
});
