const readline = require("readline-sync");
const awssdk = require("aws-sdk");
const fs = require("fs");
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
const allErrors = [];
const errorFiles = [];
awssdk.config.update({ region: "us-east-1" });
awssdk.config.update({
  secretAccessKey: "tkklYz7xNRp+plXh1S4wedA8+q94hsY2ZB3BdjE8",
  accessKeyId: "AKIAXLIN4PPU6MFTVKEE",
});
s3 = new awssdk.S3({ apiVersion: "2006-03-01" });

const sourceBucket = "s3-application";
const sourceKey = "dyn-res/project/doc/";
const targetBucket = "assetzilla-bucket";

function getListingS3(prefix) {
  return new Promise((resolve, reject) => {
    try {
      let params = {
        Bucket: sourceBucket,
        MaxKeys: 1000,
        Prefix: prefix,
      };
      console.log(params);
      const allKeys = [];
      listAllKeys();
      function listAllKeys() {
        console.log(".......");
        s3.listObjectsV2(params)
          .promise()
          .then((data) => {
            // console.log(":;;;;;;", data);
            var contents = data.Contents;
            contents.forEach(function (content) {
              allKeys.push(content);
            });

            if (data.IsTruncated) {
              params.ContinuationToken = data.NextContinuationToken;
              console.log("get further list...");
              listAllKeys();
            } else {
              resolve(allKeys);
            }
          })
          .catch((err) => {
            console.log(err)
            reject(err);
          });
      }
    } catch (e) {
      reject(e);
    }
  });
}

const doStuff = async () => {
  // const targetKey = "same as source key"

  var params = {};
  await getListingS3(sourceKey)
    .then(async (data) => {
      console.log(data.length);
        let count = 0;
      for (const doc of data) {
        console.log("+++++++=")
        console.log(doc);
        params = {
          Bucket: targetBucket,
          CopySource: encodeURI(`/${sourceBucket}/${doc.Key}`),
          Key: doc.Key,
        };
        console.log(params)
        await s3
          .copyObject(params)
          .promise()
          .then((doc) => {
            count ++;
            console.log(doc);
            console.log("------------------------",count,"/",data.length);
          })
          .catch((err) => console.log(err, err.stack));
      }
    })
    .catch((err) => console.error(err, err.stack));
};

doStuff().then(() => {
  mongoose.connection.close();
  console.log(
    "***************************************************************************************************Connection closed"
  );
});
