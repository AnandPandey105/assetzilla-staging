const readline = require("readline-sync");
const mongoose = require("mongoose");
var moment = require("moment");
var clc = require("cli-color");
var mapping = {
  log: clc.blue,
  warn: clc.yellow,
  error: clc.red,
  info: clc.magenta,
};

["log", "warn", "error", "info"].forEach(function (method) {
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
  readline.question("(Press any key to continue)");
} else {
  console.log(
    "******************Using localdb ..., you can give --production flag to use production db"
  );
  readline.question("(Press any key to continue)");
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
  const User = require("../models/user.model");
  try {
    let users = await User.find({});
    console.log(users.length)
    if (users) {
      for (const user of users) {
        console.log(user)
        readline.question("...................")
        if (
          !user._doc.locationAccess ||
          user._doc.locationAccess.length === 0
        ) {
          user._doc.locationAccess = [
            {
              locationAccessLevel: "FULL ACCESS",
              locationAccessValue: "FULL ACCESS",
            },
          ];
        }
        if (
          !user._doc.propertyTypeAccess ||
          user._doc.propertyTypeAccess.length === 0
        ) {
          user._doc.propertyTypeAccess = [
            {
              propertyTypeAccessLevel: "FULL ACCESS",
              propertyTypeAccessValue: "FULL ACCESS",
            },
          ];
        }
        // ---------------------------------------------------------
        console.log(user)
        readline.question(":::::::::::::::::::::")
        try {
          let res = await User.findOneAndUpdate(
            { email: user._doc.email },
            {
              $set: {
                locationAccess: user._doc.locationAccess,
                propertyTypeAccess: user._doc.propertyTypeAccess,
              },
            },
            { timestamps: false, new: true }
          );
          if (res){
            console.log("done",res)
          } else {
            console.error(res)
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  } catch (e) {
    console.error(e);
  }
};

doStuff().then(() => {
  mongoose.connection.close();
  console.log(
    "***************************************************************************************************Connection closed"
  );
});
