const readline = require("readline-sync");
const awssdk = require("aws-sdk");
const fs = require("fs");
const mongoose = require("mongoose");
const { convertToWebp } = require("../convertToWebp");
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

const doStuff = async () => {
  var bucketParams = {
    Bucket: "s3-application",
    Delimiter: "/",
    Prefix: "static-res/",
  };

  await s3
    .listObjects(bucketParams)
    .promise()
    .then(async (data) => {
      //   console.log(data.Contents, "<<<all content");
      let s3Params = "";

      for (const obj of data.Contents) {
        console.log(obj.Key, "<<<file path");
        let filename = obj.Key.split("/")[1];
        console.log(filename);
        if (filename !== "") {
          s3Params = {
            Bucket: "s3-application",
            Key: "static-res/" + filename,
          };
          await s3
            .getObject(s3Params)
            .promise()
            .then(async (data) => {
              console.warn(data.Body);
              const res = fs.writeFileSync(
                `./staticRes/${filename}`,
                data.Body
              );
              await convertToWebp(
                `./staticRes/${filename}`,
                `./staticRes/webp/`
              )
                .then(async (response) => {
                  console.log(response);
                  if (response.success) {
                    let file = `${response.fn}.webp`;
                    var params = {
                      ACL: "public-read",
                      Body: fs.createReadStream(`./staticRes/webp/${file}`),
                      Bucket: "assetzilla-bucket",
                      Key: `static-res/${file}`,
                    };
                    await s3
                      .putObject(params)
                      .promise()
                      .then(async (data) => {
                        console.log(data);
                      })
                      .catch((r) => console.error(r));
                  } else {
                    allErrors.push({ ...response.result, logo: authority.log });
                  }
                })
                .catch((err) => {
                  console.error(err);
                  allErrors.push({ img: filename, e: err });
                });
            })
            .catch((err) => console.error(err));
        }
      }
    })
    .catch((err) => {
      return "There was an error viewing your album: " + err.message;
    });
  exportJson(allErrors, "PropertyErrors.json");
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
