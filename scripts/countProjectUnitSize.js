const readline = require("readline-sync");
const fs = require("fs");
const mongoose = require("mongoose");
var moment = require("moment");

var clc = require("cli-color");
var mapping = {
  log: clc.blue,
  warn: clc.yellow,
  error: clc.red,
  info: clc.green,
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
} else {
  console.log(
    "******************Using localdb ..., you can give --production flag to use production db"
  );
}

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
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
  const Project = require("../models/project.model");
  const projects = await Project.find({is_live:"2"});

  const count = {others:0};
  const c = ["1 BHK", "2 BHK", "3 BHK", "4 BHK", "5 BHK", "6 BHK", "7 BHK", "8 BHK", "9 BHK", "10 BHK"];
  for (const i of c){
    count[i] = 0;
  }
  for (const project of projects) {
    if (project.details && project.details.length > 0) {
      for (const i of c){
        if (project.details.filter(j=>j.unit_size === i).length > 0){
          if (i === "5 BHK" || i === "6 BHK" || i === "7 BHK" || i === "8 BHK" || i === "9 BHK" || i === "10 BHK"){
            count["5 BHK"] ++;
          } else {
            count[i] ++;
          }
        }
      }
    } else {
      count['others'] ++;
    }
  }
  console.log(count);
};

doStuff().then(() => {
  console.warn("Don't forget to run elasticsearch after this");
  mongoose.connection.close();
  console.log(
    "***************************************************************************************************Connection closed"
  );
});
