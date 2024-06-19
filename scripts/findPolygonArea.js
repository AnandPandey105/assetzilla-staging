const readline = require("readline-sync");
const mongoose = require("mongoose");
var moment = require("moment");
const fs = require("fs");
var clc = require("cli-color");
const turf = require("@turf/turf");
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

const area = (boundary) => {
  let returnObj = {};

  try {
    let polygon = turf.polygon([boundary]);
    let polyTurfArea = turf.area(polygon).toLocaleString();
    returnObj["sq-m"] = polyTurfArea;
    polyTurfArea = (turf.area(polygon) * 0.000001).toLocaleString();
    returnObj["sq-km"] = polyTurfArea;
  } catch (e) {
    returnObj = {};
    returnObj["error"] = e;
    // returnObj["boundary"] = boundary;
  }
  return returnObj;
};

const doStuff = async () => {
  const boundaryDataModel = require("../models/boundary.model");

  const stateModel = require("../models/state.model");
  const cityModel = require("../models/city.model");
  const districtModel = require("../models/district.model");
  const subcityModel = require("../models/subcity.model");

  const allBoundaryData = await boundaryDataModel.find({});
  const allStates = await stateModel.find({});
  const allDistricts = await districtModel.find({});
  const allCities = await cityModel.find({});
  const allSubcities = await subcityModel.find({});

  const statesObj = [];

  for (const state of allStates) {
    let toPrint = {
      name: state.name,
    };

    let stateInBoundary = allBoundaryData.filter(
      (b) => b.id === state.id && b.location_type.includes("state")
    );

    if (stateInBoundary.length > 0) {
      stateInBoundary = stateInBoundary[0];
      if (stateInBoundary.boundary) {
        // toPrint['boundary'] = stateInBoundary.boundary;
        toPrint["area"] = area(stateInBoundary.boundary);
      }
    }
    console.log(toPrint);
    statesObj.push(toPrint);
  }
  exportJson(statesObj, "findPolygonArea_state.json");

  const districtObj = [];
  for (const district of allDistricts) {
    let toPrint = {
      name: district.name,
    };

    let districtInBoundary = allBoundaryData.filter(
      (b) => b.id === district.id && b.location_type.includes("district")
    );

    if (districtInBoundary.length > 0) {
      districtInBoundary = districtInBoundary[0];
      if (districtInBoundary.boundary) {
        // toPrint['boundary'] = districtInBoundary.boundary;
        toPrint["area"] = area(districtInBoundary.boundary);
      }
    }
    console.log(toPrint);
    districtObj.push(toPrint);
  }
  exportJson(districtObj, "findPolygonArea_district.json");
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
