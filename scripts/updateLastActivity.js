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

  let count = 0;
  for (const lead of allCustomers) {
    console.log(count, totalCustomers,(count/totalCustomers*100).toFixed(2), "%")
    let la = undefined;

    let sh = lead._doc.searchHistory;
    let vh = lead._doc.viewHistory;

    if (sh.length > 0){
      sh.sort((a,b)=>a.date<b.date?1:-1);
      console.log(`${sh[0].date.toDateString()} ${sh[sh.length-1].date.toDateString()}`);
      la = sh[0].date;
    }
    if (vh.length > 0){
      vh.sort((a,b)=>a.date<b.date?1:-1);
      console.log(`${vh[0].date.toDateString()} ${vh[vh.length-1].date.toDateString()}`);
      if(vh[0].date>la){
        la = vh[0].date;
      }
    }

    if (la) {
      let r = await Customer.findOneAndUpdate(
        { _id: lead._id },
        { lastActivity: la },
        { timestamps: false, new: true }
      );
      if (r) {
        console.log(
          `lastActivity updated for ${r.username} ${r.name}`
        );
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
