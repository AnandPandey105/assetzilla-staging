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
  const Project = require("../models/project.model");
  const names = ['Antriksh Urban Greek',
  'Revanta Smart Residency',
  'Purvanchal Royal Park',
  'Today Ridge Residency',
  'Express Zenith',
  'ATS One Hamlet',
  'ATS Greens 2',
  'ATS Greens 1',
  'Nimbus The Golden Palm',
  'Sunworld Vanalika',
  'JM Aroma',
  'Mahagun Meadows',
  'ACE Platinum',
  'Manisha Marvel Homes',
  'Mahagun Maestro',
  'Supertech Emerald Court',
  'Eldeco Olympia',
  'Eldeco Magnolia Park',
  'Supertech 34 Pavilion',
  'Amrapali Platinum',
  'Mahagun Marvella',
  'Homes 121',
  'Amrapali Cloud Ville',
  'Paramount Golfforeste',
  'Jaypee Greens Star Court',
  'Panchsheel Hynish',
  'Eldeco Mystic Greens',
  'Jaypee Greens Moon Court',
  'Amrapali Tropical Garden',
  'Amrapali Terrace Homes',
  'Purva Atria Platina',
  'Sipani Bliss',
  'Prestige Sunnyside',
  'Prestige Silversun',
  'Pride Pavilion',
  'Pride Pristine',
  'Radiant Silver Bell 2',
  'Radiant Lake View',
  'Radiant White Orchid',
  'Radiant Elitaire',
  'Brigade Orchards',
  'Indiabulls Centrum Park',
  'Indiabulls Centrum Park',
  'Indiabulls Centrum Park',];

  const villaNewV = {
    "g 0": "Ground Floor - Simplex",
    "g 1": "G+1 Floor (Duplex)",
    "g 2": "G+2 Floors",
    "g 3": "G+3 Floors"
  }

  const floorNewV = {

  }

  try {
    for (const one of names) {
      try {
        const filter = { name: one, property_type: "Apartments" };

        const response = await Project.findOne(filter).select({ _id: 0, name: 1, is_live: 1, floors: 1, total_floors: 1 });
        if (response) {
          console.table(response._doc);
          
          // //floors and villas
          // let newval = villaNewV[response._doc.floors];
          // if (newval) {
          //   readline.question(` New Value for floor: ${newval}`);
          // } else {
          //   newval = readline.question(` New Value for floor: `);
          // }
          // if (newval) {
          //   try {
          //     const updateResponse = await Project.findOneAndUpdate(filter, { floors: newval }, { new: true });
          //     console.info(" New Floor Value: " + updateResponse.floors);
          //   } catch (er) {
          //     console.error(" Error updating Floor Value: " + er);
          //     readline.question(" press a key to continue ");
          //   }
          // }

          //for apartments
          if (!response._doc.total_floors){
            const newFloorValue = readline.question(" New Floor Value: ");
            try {
              const updateResponse = await Project.findOneAndUpdate(filter, {total_floors: newFloorValue}, {new: true});
              console.info(" New Floor Value: " + updateResponse.total_floors);
            } catch (er) {
              console.error(" Error updating Floor Value: "+ er);
              readline.question(" press a key to continue ");
            }
          } else {
            // console.info(" Already present");
          }
        } else {
          console.warn(response + one);
          readline.question(" press a key to continue ");
        }
        // readline.question(" press a key to continue ");
      } catch (e) {
        console.error(e);
        readline.question(" press a key to continue ");
      }
    }
  } catch (err) {
    console.error(err);
  }
};

doStuff().then(() => {
  console.warn("Don't forget to run elasticsearch after this");
  mongoose.connection.close();
  console.log(
    "***************************************************************************************************Connection closed"
  );
});
