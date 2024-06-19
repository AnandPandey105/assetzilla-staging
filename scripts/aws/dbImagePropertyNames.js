const readline = require("readline-sync");
const mongoose = require("mongoose");
const fs = require("fs");
var moment = require("moment");
var clc = require("cli-color");
const Property = require("../../models/property.model");

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

// ************************************************************************************************

let JAN_6_PROPERTIES_DATA = [];

mongoose.connect("mongodb://localhost:27017/realestate_jan6_2023", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.on(
  "error",
  console.error.bind(console, "connection error:")
);
mongoose.connection.once("open", async () => {
  console.log("===== Database Connected to Jan 6;");
  JAN_6_PROPERTIES_DATA = await Property.find({});
  mongoose.connection.close();
  console.log("===== Connection closed to Jan 6");
  console.log("Jan 6 has ", JAN_6_PROPERTIES_DATA.length, " properties");

  // ************************************************************************************************

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

  mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  mongoose.connection.on(
    "error",
    console.error.bind(console, "connection error:")
  );
  mongoose.connection.once("open", () => {
    console.log("**************Database Connected with realestate");
    doStuff().then(() => {
      mongoose.connection.close();
      console.log("***************Connection closed to realestate");
    });
  });
});

const getCorrespondingJan6Property = (url) => {
  let jan6 = JAN_6_PROPERTIES_DATA.filter((a) => a._doc.url === url);
  return jan6[0];
};

const convertToWebpNames = (arr) => {
  let newImages = [];
  arr.forEach((img, index) => {
    img = img.split(".");
    if (img.length === 2) {
      if (
        img[1] === "JPG" ||
        img[1] === "JPEG" ||
        img[1] === "PNG" ||
        img[1] === "jpg" ||
        img[1] === "jpeg" ||
        img[1] === "png"
      ) {
        img = img[0] + ".webp";
        newImages.push(img);
      } else {
        img = img[0] + "." + img[1];
        newImages.push(img);
      }
    } else {
      console.error("Anamoly!!!", img);
      img = readline.question("New Image Name?");
      newImages.push(img);
      readline.question("Continue?");
    }
  });
  return newImages;
};

const doStuff = async () => {
  let allChangedUrls = [];
  const allCurrentProperties = await Property.find({});
  console.log(`Total`, allCurrentProperties.length, `in current database`);
  let count = 0;
  for (const currentProperty of allCurrentProperties) {
    console.log("________________________________________________");
    count++;
    console.log(
      "~",
      count,
      "of",
      JAN_6_PROPERTIES_DATA.length
    );
    let jan6Property = getCorrespondingJan6Property(currentProperty._doc.url);
    if (jan6Property){
      console.log(
        `is url same?`,
        jan6Property.url === currentProperty.url,
      );
      if (jan6Property.url === currentProperty.url) {
        if (jan6Property.images && currentProperty.images) {
          if (
            jan6Property.images.Properties &&
            currentProperty.images.Properties
          ) {
            console.log(
              "Both jan6 and current have {images:{Properties:Array}} in their object"
            );
            console.log(
              jan6Property.images.Properties.length,
              "images in jan6 &",
              currentProperty.images.Properties.length,
              "images in current"
            );
            let currentImages = currentProperty.images;
            if (jan6Property.images.Properties.length > 0) {
              // readline.question("n");
              console.log("Working on ", currentProperty.url);
              let jan6PropertiesImages = jan6Property.images.Properties;
              let currPropertiesImages = currentProperty.images.Properties;

              let combinedPropertyImages = [
                ...jan6PropertiesImages,
                ...currPropertiesImages,
              ];
              console.log(
                "combinedPropertyImages length = ",
                combinedPropertyImages.length
              );
              // console.log(jan6PropertiesImages);
              // console.log(currPropertiesImages);
              // console.log(combinedPropertyImages);
              let propertyImagesToReplaceWith = [];
              if (
                currentProperty.images.Projects &&
                currentProperty.images.Projects.length > 0
              ) {
                for (let i = 0; i < combinedPropertyImages.length; i++) {
                  if (
                    currentProperty.images.Projects.includes(
                      combinedPropertyImages[i]
                    ) ||
                    currentProperty.images.Properties.includes(
                      combinedPropertyImages[i]
                    )
                  ) {
                    //these images are present in the projects so no need to save them in properties
                  } else {
                    propertyImagesToReplaceWith.push(combinedPropertyImages[i]);
                  }
                }
              } else {
                propertyImagesToReplaceWith = combinedPropertyImages;
              }
              // console.log(propertyImagesToReplaceWith);
              propertyImagesToReplaceWith = convertToWebpNames(
                propertyImagesToReplaceWith
              );
              // console.log(propertyImagesToReplaceWith);
              // readline.question("n");

              let newImagesObject = {
                Projects: currentProperty.images.Projects || [],
                Properties: propertyImagesToReplaceWith,
              };

              try {
                let res = await Property.findOneAndUpdate(
                  { url: currentProperty.url },
                  { images: newImagesObject },
                  { new: true, timestamps: false }
                );
                if (res) {
                  console.info("update successful", res.url);
                  allChangedUrls.push({
                    url: res.url,
                    oldImagesObject: currentImages,
                    newImagesObject: newImagesObject,
                  });
                  
                } else {
                  console.error(res);
                  readline.question("NULL RESPONSE");
                }
              } catch (e) {
                console.error(e);
                readline.question("ERROR ABOVE");
              }
            } else {
              if (currentProperty.images.Properties && currentProperty.images.Properties.length > 0){
                let newImages = [];
                for (let i=0; i<currentProperty.images.Properties.length; i++){
                  if (currentProperty.images.Projects.includes(currentProperty.images.Properties[i])){
                    //this image is not required because it is already present in projects
                  } else {
                    newImages.push(currentProperty.images.Properties[i]);
                  }
                }
                newImages = convertToWebpNames(newImages);
                let newImagesObject = {
                  Projects:currentProperty.images.Projects || [],
                  Properties:newImages
                }
                try {
                  let res = await Property.findOneAndUpdate(
                    { url: currentProperty.url },
                    { images: newImagesObject },
                    { new: true, timestamps: false }
                  );
                  if (res) {
                    console.info("update successful", res.url);
                    allChangedUrls.push({
                      url: res.url,
                      oldImagesObject: currentImages,
                      newImagesObject: newImagesObject,
                    });
                    
                  } else {
                    console.error(res);
                    readline.question("NULL RESPONSE");
                  }
                } catch (e) {
                  console.error(e);
                  readline.question("ERROR ABOVE");
                }
              } else {
                console.warn("Skipping because of 0 images", currentProperty.url);
              }
            }
          }
        }
      }
    } else{
      console.log("property is new and not present in old database");
    }
    if (count === allCurrentProperties.length) {
      exportJson(allChangedUrls, "propertyImageNames.json");
    }
    console.log("________________________________________________");
  }
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

// ************************************************************************************************
