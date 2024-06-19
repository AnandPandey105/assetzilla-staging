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

const doStuff = async () => {
  console.log("Enter email carefully, there is no validation ...");
  let email = readline.question("Enter an email: ");
  console.log("Your email is: ", email);

  const Newsletter = require("../models/newsletter");

  await Newsletter.findOne({ email: email })
    .then(async (doc) => {
      if (doc) {
        console.error("User already exists...");
      } else {
        console.warn("This user does not exist in the database, inserting");
        let data = {email: email, isSubscribed:true}
        await Newsletter.create(data).then((res)=>{
            if (res)
                console.log("User created.", res)
            else
                console.log("Uh, I don't know this", res)
        }).catch(e=>console.error("Ran into this error while creating..", e))
      }
    })
    .catch((e) => {
      console.error("Some error while finding the user ...", e);
    });
};

doStuff().then(() => {
  mongoose.connection.close();
  console.log(
    "***************************************************************************************************Connection closed"
  );
});
