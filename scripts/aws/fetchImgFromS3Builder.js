const readline = require("readline-sync");
const awssdk = require("aws-sdk");
const fs = require("fs");
const mongoose = require("mongoose");
const { convertToWebp } = require("./convertToWebp");
var moment = require("moment")
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
const errorFiles = ["2016-07-16-14-11-44.jpg", "builder_1506923949.png", "builder_1506924397.png", "builder_1507046360.jpg", "builder_1507047631.jpg", "builder_1507087109.png", "builder_1515946258.png", "builder_1515948791.png"]
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

const convertBuilders = async () => {
  const Builders = require("../../models/builder.model");
  const allBuilders = await Builders.find({});
  console.log(allBuilders.length);
  for (const builder of allBuilders) {
    if (builder.logo && builder.logo.split(".").length > 1) {
      console.log(builder.logo);
      //1. get image from the older s3 bucket
      var bucketParams = {
        Bucket: "s3-application",
        Key: "dyn-res/builder/" + builder.logo,
      };
      console.log("--------------------");
      let forAll = true;
      if (process.argv[1] === "--chosen" || process.argv[2] === "--chosen" || process.argv[3] === "--chosen"){
        forAll = errorFiles.includes(builder.logo);
        if (!forAll){
          console.log("Skipping this because it is not in the error files")
        }
      }
      if (forAll){
      await s3
        .getObject(bucketParams)
        .promise()
        .then(async (data) => {
          console.log(data.Body);
          const res = fs.writeFileSync(`./builders/${builder.logo}`, data.Body);
          const response = await convertToWebp(
            `./builders/${builder.logo}`,
            `./builders/webp/`
          );
          allErrors.push(response);
          // 3. put image in the newer s3 bucket
          if (response.success) {
            let file = `${builder.logo.split(".")[0]}.webp`;
            var params = {
              ACL: "public-read",
              Body: fs.createReadStream(`./builders/webp/${file}`),
              Bucket: "assetzilla-bucket",
              Key: `dyn-res/builder/${file}`,
            };
            await s3
              .putObject(params)
              .promise()
              .then(async (data) => {
                console.log(data);
                await Builders.findOneAndUpdate(
                  { _id: builder._id },
                  { logo: `${builder.logo.split(".")[0]}.webp` },
                  { new: true, timestamps: false }
                )
                  .then((success) => {
                    if (success) console.log("Builder update successfull");
                    else console.info("Builder was not found");
                  })
                  .catch((e) => console.error("Error: ", e));
              })
              .catch((r) => console.error(r));
          } else {
            allErrors.push(response.result);
          }
        })
        .catch((e) => console.error(e));
      }
      console.log("--------------------");

      //2.
    }
    // readline.question("Continue?");
  }
  exportJson(allErrors, "BuildersErrors.json");
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
convertBuilders().then(() => {
  mongoose.connection.close();
  console.log(
    "***************************************************************************************************Connection closed"
  );
});
