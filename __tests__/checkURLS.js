const axios = require("axios");
const fs = require("fs");

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

await mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
await mongoose.connection.on(
  "error",
  console.error.bind(console, "connection error:")
);
await mongoose.connection.once("open", () => {
  console.log(
    "***************************************************************************************************Database Connected"
  );
});

const Property = require("../models/property.model");
const Project = require("../models/project.model");
const Builder = require("../models/builder.model");
const Authority = require("../models/authority.model");
const Bank = require("../models/bank.model");
const City = require("../models/city.model");
const Subcity = require("../models/subcity.model");
const District = require("../models/district.model");
const State = require("../models/state.model");

const results = [];

const doStuff = async () => {
  const allProperties = await Property.find({});
  const allProjects = await Project.find({});
  const allBuilders = await Builder.find({});
  const allAuthorities = await Authority.find({});
  const allBanks = await Bank.find({});
  const allCities = await City.find({});
  const allSubcities = await Subcity.find({});
  const allDistricts = await District.find({});
  const allStates = await State.find({});

  const allUrls = [];

  allProperties.forEach(e=>allUrls.push({url:e.url,is_live: e.is_live}));
  allProjects.forEach(e=>allUrls.push({url:e.url,is_live: e.is_live}));
  allBuilders.forEach(e=>allUrls.push({url:e.url,is_live: e.is_live}));
  allAuthorities.forEach(e=>allUrls.push({url:e.url,is_live: e.is_live}));
  allBanks.forEach(e=>allUrls.push({url:e.url,is_live: e.is_live}));
  allCities.forEach(e=>allUrls.push({url:e.url,is_live: e.is_live}));
  allSubcities.forEach(e=>allUrls.push({url:e.url,is_live: e.is_live}));
  allDistricts.forEach(e=>allUrls.push({url:e.url,is_live: e.is_live}));
  allStates.forEach(e=>allUrls.push({url:e.url,is_live: e.is_live}));

  console.log({length: allUrls.length, url: allUrls[0]});

  let count = 0;
  for (const u of allUrls) {
    count += 1;
    console.log(`${count} of ${allUrls.length}`)
    results.push(await checkUrl(u.url, u.is_live));
  }
  exportJson(results, "checkURLS_Hit.json");
}

const checkUrl = async (url, is_live) => {
  const domain = "http://localhost:5100";
  let returnObj = {url: url, is_live: is_live};
  try{
    const response = await axios.get(domain + url, {timeout:2000});
    // returnObj['response_success'] = {status: response.status, statusText: response.statusText}
    returnObj = {OK:"OK"}
  } catch (e) {
    console.log(e);
    returnObj['response_error'] = {error: e}
  }
  return returnObj;
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
