const readline = require("readline-sync");
const mongoose = require("mongoose");
var moment = require("moment");
const fs = require("fs");
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

const pp = [];
const pj = [];

const doStuff = async () => {
  const Properties = require("../models/property.model");
  const Projects = require("../models/project.model");

  const allProperties = await Properties.find({});
  const allProjects = await Projects.find({});

  let propCount = 0;
  for (const property of allProperties) {
    propCount++;
    console.log(propCount, " / ", allProperties.length);

    if (property.banner_image) {
      if (property.banner_image.length > 1 && property.banner_image[1] !== null) {
        //has banner image
        console.log(property.banner_image);
        // readline.question();
      } else {
        console.log(property.banner_image);
        pp.push({
          id: property._id,
          name: property.name,
          is_live:property.is_live,
        });
      }
    } else {
      console.error("No Banner Image in " + property._id);
      pp.push({
        id: property._id,
        name: property.name,
        is_live:property.is_live,
      });
    }
  }
  exportJson(pp, process.argv[2] + "property_banner.json");

  let projCount = 0;
  for (const project of allProjects) {
    projCount++;
    console.log(projCount, " / ", allProjects.length);

    if (project.banner_image) {
      if (project.banner_image.length > 1 && project.banner_image[1] !== null) {
        //has banner image
        console.log(project.banner_image);
        // readline.question();
      } else {
        console.log(project.banner_image);
        pj.push({
          id: project._id,
          name: project.name,
          is_live:project.is_live,
        });
      }
    } else {
      console.error("No Banner Image in " + project._id);
      pj.push({
        id: project._id,
        name: project.name,
        is_live:project.is_live,
      });
    }
  }
  exportJson(pj, process.argv[2] + "project_banner.json");
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
