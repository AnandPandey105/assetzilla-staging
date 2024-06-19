const readline = require("readline-sync");
const mongoose = require("mongoose");
const fs = require("fs");
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
const varToString = (varObj) => Object.keys(varObj)[0];
const doStuff = async () => {
  const { BookingPropertySchema } = require("../models/book_property.model");
  const cM = require("../models/consult.model");
  const { InterestedBuyerSchema } = require("../models/interested_buyer.model");
  const lPM = require("../models/loan_project.model");
  const sM = require("../models/schedule.model");
  const customer = require("../models/customer.model");

  const all = [
    { model: BookingPropertySchema, name: "Book Property", pre: [] },
    { model: cM, name: "consult", pre: [] },
    { model: InterestedBuyerSchema, name: "interested_buyer", pre: [] },
    { model: lPM, name: "loan_project", pre: [] },
    { model: sM, name: "schedule", pre: [] },
    // { model: customer, name: "customer" },
  ];

  let updateAlso = true;

  let filename = updateAlso ? "poststandardize.json" : "prestandardize.json";
  
  let count = 0;
  for (one of all) {
    console.log(`In ${one.name}`);
    console.log("___________________________________");
    let allDocs = await one.model.find({});

    for (doc of allDocs) {
      let numberField = "phone";
      if (!doc[numberField] && doc["number"]) {
        numberField = "number";
      } else if (!doc["number"] && doc["username"]) {
        numberField = "username";
      }

      let updateObj = {};
      console.log(numberField);
      if (doc[numberField]) {
        if (doc[numberField].length !== 10) {
          if (doc[numberField].length === 11) {
            if (doc[numberField][0] === "0") {
              if (numberField === 'phone'){
                updateObj = {phone: doc[numberField].slice(1)}
              } else if (numberField === 'number'){
                updateObj = {number: doc[numberField].slice(1)}
              }
              all[count].pre.push({pre:doc[numberField], post:updateObj});
            }
          }
          if (doc[numberField].length === 12) {
            if (doc[numberField][0] === "9" && doc[numberField][1] === "1") {
              if (numberField === 'phone'){
                updateObj = {phone: doc[numberField].slice(2)}
              } else if (numberField === 'number'){
                updateObj = {number: doc[numberField].slice(2)}
              }
              all[count].pre.push({pre:doc[numberField], post:updateObj});
            }
          }
          if (doc[numberField].length === 13) {
            if (
              doc[numberField][0] === "+" &&
              doc[numberField][1] === "9" &&
              doc[numberField][2] === "1"
            ) {
              if (numberField === 'phone'){
                updateObj = {phone: doc[numberField].slice(3)}
              } else if (numberField === 'number'){
                updateObj = {number: doc[numberField].slice(3)}
              }
              all[count].pre.push({pre:doc[numberField], post:updateObj});
            }
          }
        }

        // if (updateAlso && Object.keys(updateObj).length === 1){
        //   console.log({_id:doc._id},updateObj, {new:true, timestamps:false});
        //   readline.question("?")
        //   try{
        //     let res = await one.model.findOneAndUpdate({_id:doc._id},updateObj, {new:true, timestamps:false});
        //     if (res){
        //       console.log("DONE!")
        //     }
        //   } catch(e){
        //     console.error(e);
        //     readline.question("e");
        //   }
          
        // }
      }
    }

    count++;
  }
  console.log("Proceeding for customers");
  
  const allCustomers = await customer.find({});
  for (const one of allCustomers){
    console.log("For " + one.username)
    if (one.submitted_property.length > 0){
      let newSubmittedProperty = [];
      for (const sp of one.submitted_property){
        console.log("******",sp.username);
        if (!sp.country){
          sp.country = {code: "+91", name: "India (भारत)"}
          newSubmittedProperty.push(sp);
          console.log("******","Added country code", sp.country)
        } else {
          console.log("******","already has country code", sp.country);
          newSubmittedProperty.push(sp);
        }
      }
      if (updateAlso && one.submitted_property.length === newSubmittedProperty.length) {
        try{
          let res = await customer.findOneAndUpdate({_id:one._id}, {submitted_property:newSubmittedProperty}, {new:true, timestamps:false});
          if (res){
            console.log("******","DONE!")
          }
        } catch(e){
          console.error(e);
          readline.question("e");
        }
      }
    } else {
      console.log("******","No submitted property");
    }
  }

  exportJson(all, process.argv[2]+filename);
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
