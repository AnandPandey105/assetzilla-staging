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

const buildersToRename = [
  { old: "Prestige Group", new: "Prestige Estates Projects Ltd." },
  { old: "BPTP", new: "BPTP Ltd." },
  { old: "Ansal API", new: "Ansal API Group" },
  { old: "Unitech Group", new: "Unitech Ltd." },
  { old: "Gaursons India", new: "Gaurs Group" },
  { old: "Ajnara India", new: "Ajnara India Ltd." },
  { old: "Adarsh Developers", new: "Adarsh Group" },
  { old: "Aditya Builder", new: "Aditya Builders" },
  { old: "M3M India Pvt Limited", new: "M3M India Pvt. Ltd." },
  { old: "Experion Developers", new: "Experion Developers Pvt Ltd" },
  { old: "NBCC (India) Limited", new: "NBCC (India) Ltd." },
  { old: "Ansal Housing Limited", new: "Ansal Housing Ltd" },
  { old: " Sobha Developers ltd.", new: "Sobha Ltd." },
  { old: "Arihant Group", new: "Arihant Buildcon Pvt. Ltd" },
  { old: "Mapsko Group", new: "Mapsko Group Pvt. Ltd" },
  { old: "Purvanchal Group", new: "Purvanchal Construction Works Pvt. Ltd." },
  { old: "Chartered Housing", new: "Chartered Housing Pvt. Ltd." },
  { old: "Alpha Corp", new: "Alpha Corp Development Pvt. Ltd." },
  { old: "ABA Corp Builders", new: "ABA Corp. Ltd." },
  { old: "Rise Group", new: "Rise Projects Pvt Ltd" },
  { old: "SHALIMAR CORP LIMITED", new: "Shalimar Corp. Ltd." },
  { old: "INDUSVALLEY Empires Pvt. Ltd", new: "Indus Valley Promoters Ltd." },
  { old: "Omaxe Group", new: "Omaxe Ltd." },
  {
    old: "Conscient Infrastructure Private Limited",
    new: "Conscient Infrastructure Pvt. Ltd.",
  },
  { old: "Laureate Buildwell", new: "Laureate Buildwell Pvt. Ltd" },
  {
    old: "Eldeco Infrastructure and Properties Limited",
    new: "Eldeco Infrastructure & Properties Ltd.",
  },
  { old: "Brigade Group", new: "Brigade Enterprises Ltd." },
  { old: "Sunworld Infrastructures", new: "Sunworld Developers Pvt. Ltd." },
  { old: "Assotech Group", new: "Assotech Limited" },
  { old: "Civitech Group", new: "Civitech Developers Pvt. Ltd." },
  { old: "Casagrand Builder P.Ltd", new: "Casagrand Builder Pvt. Ltd." },
  { old: "Ansal API", new: "ROF Infratech & Housing Pvt. Ltd." },
  { old: "SS Group", new: "SS Group Pvt. Ltd" },
  { old: "VRR Builders and Company", new: "V. R. R. Builders and Company" },
  { old: "CHD Developers", new: "CHD Developers Ltd." },
  { old: "Sukritha Buildmann Pvt Ltd", new: "Sukritha Buildmann (P) Ltd." },
  { old: "Sidhartha Buildhome (P) Ltd", new: "Sidhartha Group " },
  { old: "K Raheja Realty", new: "K Raheja Realty Pvt. Ltd." },
  { old: "Dosti Realty", new: "Dosti Realty Limited" },
  { old: "Umang Realtech", new: "Umang Realtech Pvt. Ltd." },
  { old: "Central Park", new: "Central Park Group" },
  {
    old: "Exotica Housing",
    new: "Exotica Housing and Infrastructure Pvt. Ltd.",
  },
  { old: "MGH Homes", new: "MG Housing Pvt. Ltd." },
  { old: "Pareena Group", new: "Pareena Infrastructures Pvt. Ltd." },
  { old: "Apex Buildcon", new: "Apex Group" },
  { old: "ILD Group", new: "International Land Developers Pvt. Ltd. (ILD)" },
  { old: "Lotus Greens", new: "Lotus Greens Developers Pvt. Ltd." },
  { old: "TDI", new: "TDI Infratech Ltd." },
  { old: "Galaxy Dream Home", new: "Galaxy Group" },
  { old: "Radiant Group", new: "Radiant Structures Pvt. Ltd." },
  { old: "Shiram Group", new: "Shriram Properties Pvt. Ltd." },
  { old: "Indosam Infra", new: "Indosam Infra Pvt. Ltd." },
  { old: "sipani group", new: "Sipani Properties Pvt. Ltd." },
  { old: "Gulshan Group", new: "Gulshan Pvt. Ltd." },
  {
    old: "Hiranandani Group of Companies",
    new: "Hiranandani Constructions Pvt.Ltd",
  },
  { old: "Chintel Group", new: "Chintels India Pvt. Ltd." },
  { old: "Signature Global Pvt. ltd.", new: "Signature Global" },
  { old: "SNN Estates", new: "SNN Builders Pvt. Ltd" },
  { old: "Aims Group", new: "Aims Promoters Pvt. Ltd." },
  { old: "Artha Group", new: "Artha Real Estate Corporation Ltd." },
  {
    old: "CENTRAL GOVERNMENT EMPLOYEES WELFARE HOUSING ORGANISATION",
    new: "Central Govt. Employees Welfare Housing Organisation",
  },
  { old: "NVT Group", new: "NVT Quality Lifestyle Pvt. Ltd." },
  {
    old: "Value and Budget Housing Corporation Pvt.Ltd.(VBHC)",
    new: "VBHC Value Homes Pvt. Ltd.",
  },
  { old: "Saya Homes", new: "Saya Homes Pvt. Ltd" },
  { old: "SS Group", new: "SS Group Pvt. Ltd." },
  { old: "Ashish Group", new: "Ashish Estates & Properties Pvt. Ltd" },
  { old: "Chaitanya Group", new: "Chaithanya Projects Pvt. Ltd." },
  {
    old: "Crescent Constructions",
    new: "Crescent Group Builders & Developers",
  },
  { old: "Panchsheel Group", new: "Panchsheel Buildtech Pvt. Ltd." },
  {
    old: "ORRIS INFRASTRUCTURE PRIVATE LIMITED",
    new: "Orris Infrastructure Pvt. Ltd.",
  },
  { old: "Sunworld Infrastructures", new: "Sunworld Developers Pvt. Ltd." },
  { old: "Divyasree Group", new: "DivyaSree Developers (P) Ltd." },
  { old: "Migsun", new: "Migsun Group" },
  { old: "Jaypee Group", new: "Jaiprakash Associates Limited" },
  { old: "Nagpal Builders", new: "Nagpal Builders India Pvt. Ltd" },
];

const doStuff = async () => {
  for (const b of buildersToRename) {
    // let oldName = readline.question(
    //   "What is the old name of the Builder? ==> "
    // );
    console.warn("*****************************************")
    console.table(b)
    console.warn("*****************************************")
    let oldName = b.old
    readline.question(`OLD NAME is ==> ${oldName}`);
    const Builder = require("../models/builder.model");
    try {
      const relevantBuilder = await Builder.findOne({ name: oldName });
      if (relevantBuilder) {
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
            // let newName = readline.question(
            //   "What is the new name of the builder? ==> "
            // );
            let newName = b.new
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
                );
                if (newbuilder) {
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
  }
};

doStuff().then(() => {
  console.warn("Don't forget to run elasticsearch after this");
  mongoose.connection.close();
  console.log(
    "***************************************************************************************************Connection closed"
  );
});
