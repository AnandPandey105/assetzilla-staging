const mongoose = require("mongoose");
const Builder = require("../models/property.model");
const readline = require("readline-sync");
const fs = require("fs");

let realestateBuilders = [];
let realestate10AprBuilders = [];
let realestate19JunBuilders = [];
let realestate26NovBuilders = [];

const getData = async () => {
  let data = await Builder.find({});
  return data;
};

mongoose.connect("mongodb://localhost:27017/realestate", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.on(
  "error",
  console.error.bind(console, "connection error:")
);
mongoose.connection.once("open", () => {
  console.log(
    "************************************************Database Connected to realestate"
  );
});

getData()
  .then((resp) => {
    realestateBuilders = resp;
    mongoose.connection.close();
    console.log(resp.length);
    console.log(
      "************************************************Connection closed to realestate"
    );

    mongoose.connect("mongodb://localhost:27017/realestate_10_april_22", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    mongoose.connection.on(
      "error",
      console.error.bind(console, "connection error:")
    );
    mongoose.connection.once("open", () => {
      console.log(
        "************************************************Database Connected to realestate_10_april_22"
      );

      getData()
        .then((resp) => {
          realestate10AprBuilders = resp;
          mongoose.connection.close();
          console.log(resp.length);
          console.log(
            "************************************************Connection closed to realestate_10_april_22"
          );

          mongoose.connect(
            "mongodb://localhost:27017/realestate_19_jul_22",
            { useNewUrlParser: true, useUnifiedTopology: true }
          );
          mongoose.connection.on(
            "error",
            console.error.bind(console, "connection error:")
          );
          mongoose.connection.once("open", () => {
            console.log(
              "************************************************Database Connected to realestate_19_jul_22"
            );

            getData()
              .then((resp) => {
                realestate19JunBuilders = resp;
                mongoose.connection.close();
                console.log(resp.length);
                console.log(
                  "************************************************Connection closed to realestate_19_jul_22"
                );

                mongoose.connect(
                  "mongodb://localhost:27017/realestate_26_nov_22",
                  { useNewUrlParser: true, useUnifiedTopology: true }
                );
                mongoose.connection.on(
                  "error",
                  console.error.bind(console, "connection error:")
                );
                mongoose.connection.once("open", () => {
                  console.log(
                    "************************************************Database Connected to realestate_26_nov_22"
                  );

                  getData()
                    .then((resp) => {
                      realestate26NovBuilders = resp;
                      mongoose.connection.close();
                      console.log(resp.length);
                      console.log(
                        "************************************************Connection closed to realestate_26_nov_22"
                      );
                      compareData();
                    })
                    .catch((e) => console.log(e));
                });
              })
              .catch((e) => console.error(e));
          });
        })
        .catch((e) => console.error(e));
    });
  })
  .catch((e) => console.error(e));

const compareData = () => {
  console.log("Initiating comparison");
  console.log(
    realestateBuilders.length,
    realestate10AprBuilders.length,
    realestate19JunBuilders.length
  );

  const rb_names = realestateBuilders.map((rb) => rb.url);
  console.log(rb_names.length);
  // rb_names.forEach((n)=>console.log(n))

  const rb10apr_names = realestate10AprBuilders.map((rb) => rb.url);
  console.log(rb10apr_names.length);
  // rb10apr_names.forEach((n)=>console.log(n))

  const rb19jun_names = realestate19JunBuilders.map((rb) => rb.url);
  console.log(rb19jun_names.length);
  // rb19jun_names.forEach((n)=>console.log(n))

  const rb26nov_names = realestate26NovBuilders.map((rb) => rb.url);
  console.log(rb26nov_names.length);
  // rb26nov_names.forEach((n)=>console.log(n))

  let data = [];
  let count = 0;
  console.log(
    "__________checking if realestate has data from 10 April backup",
    rb10apr_names.length
  );
  rb10apr_names.forEach((rb) => {
    // console.log(rb)
    if (!rb_names.includes(rb)) data.push(rb);
    else count++;

    // console.log(count);
  });

  let data2 = [];
  console.log(
    "__________checking if realestate has data from 19 Jun backup",
    rb19jun_names.length
  );
  rb19jun_names.forEach((rb) => {
    // console.log(rb)
    if (!rb_names.includes(rb)) data2.push(rb);
  });

  let data3 = [];
  console.log("__________checking if realestate has data from 26 nov backup", rb26nov_names.length);
  rb26nov_names.forEach((rb) => {
    // console.log(rb)
    if (!rb_names.includes(rb)) data3.push(rb);
  });

  console.log(data);
  console.log(data2);
  console.log(data3);

  const jsonData = realestate10AprBuilders.filter((b) => data.includes(b.url));
  console.log(jsonData.length);
  exportJson(jsonData, "10Apr.json");

  const jsonData2 = realestate10AprBuilders.filter((b) =>
    data2.includes(b.url)
  );
  console.log(jsonData2.length);
  exportJson(jsonData2, "19Jun.json");

  const jsonData3 = realestate26NovBuilders.filter((b) =>
    data3.includes(b.url)
  );
  console.log(jsonData3.length);
  exportJson(jsonData3, "26nov.json");
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
