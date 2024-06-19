const { addToNewsletter } = require("../__helper");

const mongoose = require("mongoose");
var clc = require("cli-color");
var moment = require("moment");

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

const doStuff = async () => {
  //
}


doStuff().then(() => {
  console.warn("Don't forget to run elasticsearch after this");
  mongoose.connection.close();
  console.log(
    "***************************************************************************************************Connection closed"
  );
});
