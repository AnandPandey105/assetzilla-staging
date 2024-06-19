const readline = require("readline-sync");
const awssdk = require("aws-sdk");
const fs = require("fs");
const mongoose = require("mongoose");
const { convertToWebp } = require("./convertToWebp");
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
const allErrors = [];
const errorFiles = [];
awssdk.config.update({ region: "us-east-1" });
awssdk.config.update({
  secretAccessKey: "tkklYz7xNRp+plXh1S4wedA8+q94hsY2ZB3BdjE8",
  accessKeyId: "AKIAXLIN4PPU6MFTVKEE",
});
s3 = new awssdk.S3({ apiVersion: "2006-03-01" });
// let s3ApplicationBucket = {
//   Bucket: "s3-application",
//   Key: "dyn-res/property/image/" + property.images.Properties[0],
// };

// var params = {
//   Bucket: "s3-application",
//   MaxKeys: 1000,
// };
// s3.listObjects(params, function (err, data) {
//   if (err) console.log(err, err.stack); // an error occurred
//   else console.log(data);
// });

const convertDistrict = async () => {
  const District = require("../../models/district.model");
  const allDistricts = await District.find({});
  console.log(allDistricts.length);
  for (const district of allDistricts) {
    // console.log(city)

    if (district.images && district.images.Districts && district.images.Districts.length > 0) {
      let newImages = [];
      let newBannerImages = ["Districts"];
      for (const logo of district.images.Districts) {
        console.log(logo);
        //1. get image from the older s3 bucket
        var bucketParams = {
          Bucket: "s3-application",
          Key: "dyn-res/district/" + logo,
        };
        console.log("--------------------");
        let forAll = true;
        if (
          process.argv[1] === "--chosen" ||
          process.argv[2] === "--chosen" ||
          process.argv[3] === "--chosen"
        ) {
          forAll = errorFiles.includes(logo);
          if (!forAll) {
            console.log("Skipping this because it is not in the error files");
          }
        }
        if (forAll) {
          await s3
            .getObject(bucketParams)
            .promise()
            .then(async (data) => {
              console.log(data.Body);
              const res = fs.writeFileSync(`./districts/${logo}`, data.Body);
              const response = await convertToWebp(
                `./districts/${logo}`,
                `./districts/webp/`
              );
              // 3. put image in the newer s3 bucket
              if (response.success) {
                let file = `${logo.split(".")[0]}.webp`;
                var params = {
                  ACL: "public-read",
                  Body: fs.createReadStream(`./districts/webp/${file}`),
                  Bucket: "assetzilla-bucket",
                  Key: `dyn-res/district/${file}`,
                };
                await s3
                  .putObject(params)
                  .promise()
                  .then(async (data) => {
                    console.log(data);
                    newImages.push(`${logo.split(".")[0]}.webp`);
                    if (district.banner_image && district.banner_image[1] === logo) {
                      newBannerImages.push(`${logo.split(".")[0]}.webp`);
                    }
                  })
                  .catch((r) => {
                    console.error(r);
                    newImages.push(logo);
                    if (district.banner_image && district.banner_image[1] === logo) {
                      newBannerImages.push(logo);
                    }
                    allErrors.push({ ...response.result, img: "" });
                  });
              } else {
                newImages.push(logo);
                if (district.banner_image && district.banner_image[1] === logo) {
                  newBannerImages.push(logo);
                }
                allErrors.push({ ...response.result, img: logo });
              }
            })
            .catch((e) => {
              console.error(e);
              allErrors.push({ img: logo });
            });
        }
        console.log("--------------------");
      }
      await District.findOneAndUpdate(
        { _id: district._id },
        { images: {'Districts':newImages}, banner_image: newBannerImages },
        { new: true, timestamps: false }
      )
        .then((success) => {
          if (success) console.log("District update successfull");
          else console.info("District was not found");
        })
        .catch((e) => console.error("Error: ", e));
      //2.
    }
    // readline.question("Continue?");
  }
  exportJson(allErrors, "DistrictErrors.json");
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
convertDistrict().then(() => {
  mongoose.connection.close();
  console.log(
    "***************************************************************************************************Connection closed"
  );
});
