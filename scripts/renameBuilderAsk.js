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
    oldMethod.apply(console, [
      mapping[method](
        "[" +
          moment(Date.now()).format("MMM Do | HH:mm A") +
          "]" +
          Array.from(arguments)
      ),
    ]);
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

const allErrors = [];
const all = [];

const doStuff = async () => {
  let oldName = readline.question(
    "What is the old name of the Builder? ==> "
  );
  
  const Builder = require("../models/builder.model");
  try {
    const relevantBuilder = await Builder.findOne({ name: oldName });
    if (relevantBuilder || true) {
      console.log(relevantBuilder);
      console.log("Above is the builder you are looking for");

      let propertyPermissionToSearch = readline.question(
        "Should I look into the properties now?[y/n]"
      );
      if (propertyPermissionToSearch === "y") {
        const Property = require("../models/property.model");
        let correspondingPropertiesByName = await Property.find({
          builder: oldName,
        });
        console.log(
          `There are ${correspondingPropertiesByName.length} properties with matching name`
        );

        let projectPermissionToSearch = readline.question(
          "Should I look into the project now?[y/n]"
        );
        if (projectPermissionToSearch === "y") {
          const Project = require("../models/project.model");
          let correspondingProjectByName = await Project.find({
            builder: oldName,
          });

          console.log(
            `There are ${correspondingProjectByName.length} projects with matching name`
          );

          console.log("************************************************");
          let newName = readline.question(
            "What is the new name of the builder? ==> "
          );
          readline.question(`NEW NAME ==> ${newName}`);
          if (newName !== "") {
            let verify = readline.question(
              `New name is ${newName}. Enter y to continue...: `
            );
            if (verify === "y" && newName !== "") {
              console.log("Renaming the builder now:");
              const newbuilder = await Builder.findOneAndUpdate(
                { name: oldName },
                { name: newName },
                { timestamps: false, new: true }
              ).then((d)=>console.log(d)).catch((e)=>console.log(e));
              if (newbuilder || true) {
                console.log(newbuilder);
                console.info(
                  "builder was successfully renamed, above is the builder with new name"
                );

                const renameProperty = readline.question(
                  "Should I rename the corresponding properties now? [y/n]"
                );
                if (renameProperty === "y") {
                  let count = 0;
                  for (const property of correspondingPropertiesByName) {
                    if (count > 0) console.log("Updating another ... ");
                    await Property.findOneAndUpdate(
                      { url: property.url, builder: oldName },
                      { builder: newName },
                      { new: true, timestamps: false }
                    ).then((success) => {
                      if (success) {
                        count++;
                        console.info(`${count} property(s) uddated.`);
                      } else {
                        console.warn("Could not update, response was null");
                      }
                    });
                  }
                }
                const renameProject = readline.question(
                  "Should I rename the corresponding projects now? [y/n]"
                );
                if (renameProject === "y") {
                  let count = 0;
                  for (const project of correspondingProjectByName) {
                    if (count > 0) console.log("Updating another ... ");
                    await Project.findOneAndUpdate(
                      { builder: oldName },
                      { builder: newName },
                      { new: true, timestamps: false }
                    ).then((success) => {
                      if (success) {
                        count++;
                        console.info(`${count} project(s) uddated.`);
                      } else {
                        console.warn("Could not update, response was null");
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
    }
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
