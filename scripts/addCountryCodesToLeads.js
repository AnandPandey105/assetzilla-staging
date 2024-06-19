const readline = require("readline-sync");
const mongoose = require("mongoose");
var moment = require("moment");
var clc = require("cli-color");
const fs = require("fs");
var mapping = {
  log: clc.blue,
  warn: clc.yellow,
  error: clc.red,
  info: clc.magenta,
};

["log", "warn", "error", "info"].forEach(function (method) {
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
  readline.question("(Press any key to continue)");
} else if (process.argv[2] === "--staging") {
  uri = "mongodb://43.241.135.244:27020/realestate?tls=false";
  console.log("******************Using STAGING db...");
} else {
  console.log(
    "******************Using localdb ..., you can give --production flag to use production db"
  );
  readline.question("(Press any key to continue)");
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

const varToString = (varObj) => Object.keys(varObj)[0];
const doStuff = async () => {
  const { BookingPropertySchema } = require("../models/book_property.model");
  const cM = require("../models/consult.model");
  const { InterestedBuyerSchema } = require("../models/interested_buyer.model");
  const lPM = require("../models/loan_project.model");
  const sM = require("../models/schedule.model");
  const customer = require("../models/customer.model");

  const all = [
    { model: BookingPropertySchema, name: "Book Property", pre: [] },
    { model: cM, name: "consult", pre: [] },
    { model: InterestedBuyerSchema, name: "interested_buyer", pre: [] },
    { model: lPM, name: "loan_project", pre: [] },
    { model: sM, name: "schedule", pre: [] },
    // { model: customer, name: "customer" },
  ];

  let updateAlso = false;

  let filename = updateAlso ? "post_addcountry.json" : "pre_addcountry.json";

  let count = 0;
  for (one of all) {
    console.log(`In ${one.name}`);
    console.log("___________________________________");
    let allDocs = await one.model.find({});
    let country = { code: "+91", name: "India (भारत)" };
    for (doc of allDocs) {
      let currentData = doc._doc;
      let newData = currentData;

      if (!currentData.country) {
        newData.country = country;
      }

      let oldHistory = currentData.history;
      let newHistory = currentData.history;

      for (let i = 0; i < oldHistory.length; i++) {
        if (!oldHistory[i].country) {
          newHistory[i].country = country;
        }
      }
      newData.history = newHistory;

      all[count].pre.push(newData);
      if (updateAlso) {
        try {
          let response = await one.model.findOneAndUpdate(
            { _id: currentData._id },
            newData,
            { timestamps: false, new: true }
          );
          if (response) {
            console.log("updated");
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  }
  count++;
  exportJson(all, process.argv[2] + filename);
};
const exportJson = (data, fn) => {
  let jsonString = JSON.stringify(data);

  fs.writeFile(`./${fn}`, jsonString, (err) => {
    if (err) {
      console.log("Error writing file", err);
    } else {
      console.log("Successfully wrote file");
    }
  });
};

doStuff().then(() => {
  mongoose.connection.close();
  console.log(
    "***************************************************************************************************Connection closed"
  );
});
