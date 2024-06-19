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
} else if (process.argv[2] === "--staging") {
  uri = "mongodb://43.241.135.244:27020/realestate?tls=false";
  console.log("******************Using STAGING db...");
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

const allErrors = [];
const all = [];

const doStuff = async () => {
  const SubcityModel = require("../models/subcity.model");
  const PropertyModel = require("../models/property.model");
  const ProjectModel = require("../models/project.model");
  const BuilderModel = require("../models/builder.model");

  try {
    const oldName = readline.question(
      "What is the old name of the Subcity? ==> "
    );

    const subcity = await SubcityModel.findOne({ name: oldName });
    console.log({ subcity });

    const properties = await PropertyModel.find({ subcity: oldName });
    const projects = await ProjectModel.find({ subcity: oldName });
    const builders = await BuilderModel.find({ subcity: oldName });

    console.log({
      projects: projects.length,
      builders: builders.length,
      properties: properties.length,
    });

    console.log("........................................................");

    const newName = readline.question(
      "What is the NEW name of the Subcity? ==> "
    );

    await SubcityModel.findOneAndUpdate(
      { name: oldName },
      { name: newName },
      { new: true, timestamps: false }
    )
      .then((doc) => console.log("subcity name updated successfully", doc))
      .catch((err) => console.error(err));

    await PropertyModel.updateMany(
      { subcity: oldName },
      { subcity: newName },
      { timestamps: false }
    )
      .then((doc) => console.log("Properties updated successfully", doc))
      .catch((err) => console.error(err));
    
    await ProjectModel.updateMany(
      { subcity: oldName },
      { subcity: newName },
      { timestamps: false }
    )
      .then((doc) => console.log("Projects updated successfully", doc))
      .catch((err) => console.error(err));

    await BuilderModel.updateMany(
      { subcity: oldName },
      { subcity: newName },
      { timestamps: false }
    )
      .then((doc) => console.log("Builders updated successfully", doc))
      .catch((err) => console.error(err));
  } catch (error) {
    console.error(error);
  }
};

doStuff().then(() => {
  console.warn("Don't forget to run elasticsearch after this");
  mongoose.connection.close();
  console.log(
    "***************************************************************************************************Connection closed"
  );
});
