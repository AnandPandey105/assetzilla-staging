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

let sourceBucket = "s3-application";
const sourceKey = "dyn-res/project/image/";
const targetBucket = "assetzilla-bucket";

function getListingS3(prefix, bucket) {
  return new Promise((resolve, reject) => {
    try {
      if (bucket) {
        sourceBucket = bucket;
      } else {
        sourceBucket = "s3-application";
      }
      let params = {
        Bucket: sourceBucket,
        MaxKeys: 1000,
        Prefix: prefix,
      };
      console.log("------", bucket);
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
              if (bucket) {
                console.log("pushing keys only");
                allKeys.push(content.Key);
              } else {
                console.log("pushing full");
                allKeys.push(content);
              }
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
            console.log(err);
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
  await getListingS3(sourceKey, "assetzilla-bucket")
    .then(async (data_) => {
      await getListingS3(sourceKey)
        .then(async (data) => {
          console.log(data.length);
          let count = 0;
          for (const doc of data) {
            if (data_.includes(doc.Key)) {
              console.log(
                "A L R E A D Y   P R E S E N T",
                doc.Key,
                data_.indexOf(doc.Key),
                data_[0]
              );
            } else {
              count++;
              console.log(
                "A B S E N T",
                doc.Key,
                data_.indexOf(doc.Key),
                data_[0]
              );
              console.log("+++++++=");
              console.log(doc);
              console.log(doc.Key.split("/"));
              let filename = doc.Key.split("/")[3];
              console.warn(filename);
              if (filename !== "") {
                let s3Params = {
                  Bucket: "s3-application",
                  Key: "dyn-res/project/image/" + filename,
                };
                await s3
                  .getObject(s3Params)
                  .promise()
                  .then(async (data) => {
                    console.warn(data.Body);
                    const res = fs.writeFileSync(
                      `./project/${filename}`,
                      data.Body
                    );
                    await convertToWebp(
                      `./project/${filename}`,
                      `./project/webp/`
                    )
                      .then(async (response) => {
                        console.log(response);
                        if (response.success) {
                          let file = `${response.fn}.webp`;
                          var params = {
                            ACL: "public-read",
                            Body: fs.createReadStream(
                              `./project/webp/${file}`
                            ),
                            Bucket: "assetzilla-bucket",
                            Key: `dyn-res/project/image/${file}`,
                          };
                          await s3
                            .putObject(params)
                            .promise()
                            .then(async (data) => {
                              console.log(data);
                            })
                            .catch((r) => console.error(r));
                        } else {
                          allErrors.push({
                            ...response.result,
                            logo: authority.log,
                          });
                          
                          var params = {
                            ACL: "public-read",
                            Body: fs.createReadStream(
                              `./project/${filename}`
                            ),
                            Bucket: "assetzilla-bucket",
                            Key: `dyn-res/project/image/${filename}`,
                          };
                          await s3
                            .putObject(params)
                            .promise()
                            .then(async (data) => {
                              console.log(data);
                            })
                            .catch((r) => console.error(r));
                        }
                      })
                      .catch(async (err) => {
                        console.error(err);
                        allErrors.push({ img: filename, e: err });
                        
                        var params = {
                          ACL: "public-read",
                          Body: fs.createReadStream(`./project/${filename}`),
                          Bucket: "assetzilla-bucket",
                          Key: `dyn-res/project/image/${filename}`,
                        };
                        await s3
                          .putObject(params)
                          .promise()
                          .then(async (data) => {
                            console.log(data);
                          })
                          .catch((r) => console.error(r));
                      });
                  })
                  .catch((err) => console.error(err));
              }
              console.log("-----------------", count, "/", data.length);
            }
          }
        })
        .catch((err) => console.error(err));
    })
    .catch((err) => console.error(err, err.stack));
};

doStuff().then(() => {
  mongoose.connection.close();
  console.log(
    "***************************************************************************************************Connection closed"
  );
});
