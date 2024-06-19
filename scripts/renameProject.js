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

["log", "warn", "error", "info"].forEach(function (method) {
  var oldMethod = console[method].bind(console);
  console[method] = function () {
    oldMethod.apply(
      console,
      [
        mapping[method](
          "[" + moment(Date.now()).format("MMM Do | HH:mm A") + "]" + Array.from(arguments)
        ),
      ]
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
  let oldName = readline.question("What is the old name of the project? ==> ");
  const Project = require("../models/project.model");
  try {
    const relevantProject = await Project.findOne({ name: oldName });
    if (relevantProject) {
      console.log(relevantProject);
      console.log("Above is the project you are looking for");

      let propertyPermissionToSearch = readline.question(
        "Should I look into the properties now?[y/n]"
      );
      if (propertyPermissionToSearch === "y") {
        const Property = require("../models/property.model");
        let correspondingPropertiesByName = await Property.find({
          project: oldName,
        });
        let correspondingPropertiesByUrl = await Property.find({
          project_url: relevantProject.url,
        });

        console.log(
          `There are ${correspondingPropertiesByName.length} properties with matching name`
        );
        console.log(
          `And ${correspondingPropertiesByUrl.length} properties with matching url`
        );

        console.log("************************************************");
        let newName = readline.question(
          "What is the new name of the project? ==> "
        );
        if (newName !== "") {
          let verify = readline.question(
            `New name is ${newName}. Enter y to continue...: `
          );
          if (verify === "y" && newName !== "") {
            console.log("Renaming the project now:");
            const newProject = await Project.findOneAndUpdate(
              { name: oldName },
              { name: newName },
              { timestamps: false, new: true }
            );
            if (newProject) {
              console.log(newProject);
              console.info(
                "Project was successfully renamed, above is the project with new name"
              );

              const renameProperty = readline.question(
                "Should I rename the corresponding properties now? [y/n]"
              );
              if (renameProperty === "y") {
                let count = 0;
                for (const property of correspondingPropertiesByName) {
                    if (count > 0) console.log("Updating another ... ")
                  await Property.findOneAndUpdate(
                    { url: property.url, project:oldName },
                    { project: newName },
                    {new:true, timestamps:false}
                  ).then((success)=>{
                    if (success){
                        count++;
                        console.info(`${count} property(s) uddated.`);
                    } else{
                        console.warn("Could not update, response was null")
                    }
                  });
                }
              }
            }
          }
        } else {
          console.error("Not A Name");
        }
      }
    }
  } catch (error) {
    console.error(error);
  }
};

doStuff().then(() => {
    console.warn("Don't forget to run elasticsearch after this")
  mongoose.connection.close();
  console.log(
    "***************************************************************************************************Connection closed"
  );
});
