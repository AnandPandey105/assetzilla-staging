const readline = require("readline-sync");
const AWS = require("aws-sdk");
const fs = require("fs");
const mongoose = require("mongoose");
var moment = require("moment-timezone");
var clc = require("cli-color");
var mapping = {
  log: clc.blue,
  warn: clc.yellow,
  error: clc.red,
};

const axios = require("axios");

const Images = require("../../../classes/images");
const Property = require("../../../models/property.model");

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

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection.on(
  "error",
  console.error.bind(console, "connection error:")
);
mongoose.connection.once("open", () => {
  console.log("****************Database Connected");
});

AWS.config.update({ region: "us-east-1" });
AWS.config.update({
  secretAccessKey: "tkklYz7xNRp+plXh1S4wedA8+q94hsY2ZB3BdjE8",
  accessKeyId: "AKIAXLIN4PPU6MFTVKEE",
});

s3 = new AWS.S3({ apiVersion: "2006-03-01" });

const allErrorImages = [];

const getParams = (i) => {
  i = i.split("https://assetzilla-bucket.s3.amazonaws.com/")[1];
  let returnObj = {
    Bucket: "assetzilla-bucket",
    Key: i,
  };
  return returnObj;
};

const doStuff = async () => {
  const allProperties = await Property.find({});
  let count = 0;
  for (const property of allProperties) {
    count++;
    console.log("___________________________________________", count, "of", allProperties.length);
    console.log(property.images);
    console.log(property.banner_image);
    // ----------------------
    let propertyWURL = property._doc;
    propertyWURL = Images.get_image_url(propertyWURL);
    propertyWURL.banner_image = Images.banner_img_url(property.banner_image);
    // ----------------------
    console.log("--------");
    console.log(propertyWURL.images);
    console.log(propertyWURL.banner_image);
    console.log("___________________________________________");
    // readline.question("<><><><<><>");
    let errorObj = { url: propertyWURL.url, banner: [], imgs: [] };
    let imagesErrored = [];
    let bannerImagesErrored = [];
    if (propertyWURL.images.length > 0) {
      for (let img of propertyWURL.images) {
        let params = getParams(img);
        try {
          await s3.headObject(params).promise();
          const signedUrl = s3.getSignedUrl("getObject", params);
          // Do stuff with signedUrl
          console.log(signedUrl);
        } catch (error) {
          if (error.code === "NotFound") {
            // Note with v3 AWS-SDK use error.code
            // Handle no object on cloud here...
            imagesErrored.push(img);
          } else {
            // Handle other errors here....
            console.log(error);
            readline.question("helo");
          }
        }
      }
    }
    if (propertyWURL.banner_image !== "/images/placeholder_bg.webp") {
      let params = getParams(propertyWURL.banner_image);
      try {
        await s3.headObject(params).promise();
        const signedUrl = s3.getSignedUrl("getObject", params);
        // Do stuff with signedUrl
        console.log(signedUrl);
      } catch (error) {
        if (error.code === "NotFound") {
          // Note with v3 AWS-SDK use error.code
          // Handle no object on cloud here...
          bannerImagesErrored.push(propertyWURL.banner_image)
        } else {
          // Handle other errors here....
          console.log(error);
          readline.question("hello");
        }
      }
    }
    errorObj.banner = bannerImagesErrored;
    errorObj.imgs = imagesErrored;
    allErrorImages.push(errorObj);
  }
  exportJson(allErrorImages, "property_image_errors.json");
};

doStuff().then(() => {
  mongoose.connection.close();
  console.log(
    "***************************************************************************************************Connection closed"
  );
});

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
