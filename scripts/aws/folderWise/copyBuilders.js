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

// mongoose.connect(uri, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });
// mongoose.connection.on(
//   "error",
//   console.error.bind(console, "connection error:")
// );
// mongoose.connection.once("open", () => {
//   console.log(
//     "***************************************************************************************************Database Connected"
//   );
// });

const allErrors = [];
const all = [];

awssdk.config.update({ region: "us-east-1" });
awssdk.config.update({
  secretAccessKey: "tkklYz7xNRp+plXh1S4wedA8+q94hsY2ZB3BdjE8",
  accessKeyId: "AKIAXLIN4PPU6MFTVKEE",
});
s3 = new awssdk.S3({ apiVersion: "2006-03-01" });
//\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
///////////////////////////////////////////////////////////////////////////////////////////////////////
const prefixOfAws = "dyn-res/builder/";
const folderToSaveIn = "builder";
const entity = "Builders";

var oldBucketParamsList = {
  Bucket: "s3-application",
  Delimiter: "/",
  Prefix: prefixOfAws,
};

var newBucketParamsList = {
  Bucket: "assetzilla-bucket",
  Delimiter: "/",
  Prefix: prefixOfAws,
};

const getOldBucketParams = (filename) => {
  return {
    Bucket: "s3-application",
    Key: prefixOfAws + filename,
  };
};

const getNewBucketParams = (file) => {
  return {
    ACL: "public-read",
    Body: fs.createReadStream(`./${folderToSaveIn}/webp/${file}`),
    Bucket: "assetzilla-bucket",
    Key: `${prefixOfAws}${file}`,
  };
};

//\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
///////////////////////////////////////////////////////////////////////////////////////////////////////

const doStuff = async () => {
  console.log("Calling old bucket...");
  let oldBucketContents = await s3.listObjects(oldBucketParamsList).promise();
  console.log(
    oldBucketContents.Name,
    oldBucketContents.Prefix,
    oldBucketContents.Contents.length
  );
  console.log(oldBucketContents.Contents[0]);

  console.log("Calling new bucket...");
  let newBucketContents = await s3.listObjects(newBucketParamsList).promise();
  console.warn(
    newBucketContents.Name,
    newBucketContents.Prefix,
    newBucketContents.Contents.length
  );
  console.log(newBucketContents.Contents[0]);

  let keysPresentInNewBucket = [];
  newBucketContents.Contents.forEach((n) => {
    keysPresentInNewBucket.push(sliceExtension(n.Key, true));
  });
  //   console.log(keysPresentInNewBucket);

  let keysPresentInOldBucket = [];
  oldBucketContents.Contents.forEach((o) => {
    keysPresentInOldBucket.push(sliceExtension(o.Key));
  });
  //   keysPresentInOldBucket.forEach((ko) => {
  //     console.log(ko);
  //   });

  let presentCount = 0;
  let absentCount = 0;
  for (const old of oldBucketContents.Contents) {
    let val = sliceExtension(old.Key);
    if (doesItContain(keysPresentInNewBucket, val)) {
      presentCount++;
    } else {
      absentCount++;
    }
  }
  console.log("presentCount : ", presentCount, " absentCount : ", absentCount);
  const q = readline.question("Continue? [y/n]: ")
  if (absentCount > presentCount || q === "y") {
    console.log("lets get to work now");
    try {
      for (const obj of oldBucketContents.Contents) {
        let val = sliceExtension(obj.Key);
        if (doesItContain(keysPresentInNewBucket, val)) {
          //do nothing in this case
        } else {
          try {
            console.log(obj.Key, "<<<file path");
            let filename = obj.Key.split("/")[2];
            console.log({ filename });
            if (filename !== "") {
              s3Params = getOldBucketParams(filename);
              await s3
                .getObject(s3Params)
                .promise()
                .then(async (data) => {
                  console.warn(data.Body);
                  const res = fs.writeFileSync(
                    `./${folderToSaveIn}/${filename}`,
                    data.Body
                  );
                  await convertToWebp(
                    `./${folderToSaveIn}/${filename}`,
                    `./${folderToSaveIn}/webp/`
                  )
                    .then(async (response) => {
                      console.log({ response });
                      if (response.success) {
                        let file = `${response.fn}.webp`;
                        var params = getNewBucketParams(file);
                        await s3
                          .putObject(params)
                          .promise()
                          .then(async (data) => {
                            console.log({ data });
                          })
                          .catch((r) => {
                            console.error({ r });
                            allErrors.push({msg:"putObject Error", obj, r})
                          });
                      } else {
                        allErrors.push({
                            msg:"convert to webp response failed",
                          ...response.result,
                          obj
                        });
                      }
                    })
                    .catch((err) => {
                      console.error(err);
                      allErrors.push({ msg:"convert to webp error caught",obj, img: filename, e: err });
                    });
                })
                .catch((err) => {
                  console.error(err);
                  allErrors.push({ obj, err });
                });
            }
          } catch (err) {
            console.error("Some error has occurred", err);
            allErrors.push({msg:"try catch error inside loop",err});
          }
        }
      }
    } catch (e) {
      console.log(e);
      allErrors.push({msg:"try catch error outside loop",err});
    } finally {
      exportJson(allErrors, entity + "Errors.json");
      exportJson(all, entity + "All.json");
    }
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
const sliceExtension = (key, isNew) => {
  let returnKey = "";
  if (key.includes(".png")) {
    returnKey = key.replace(".png", "");
  } else if (key.includes(".jpg")) {
    returnKey = key.replace(".jpg", "");
  } else if (key.includes(".JPG")) {
    returnKey = key.replace(".JPG", "");
  } else if (key.includes(".jpeg")) {
    returnKey = key.replace(".jpeg", "");
  } else if (key.includes(".webp")) {
    returnKey = isNew ? key.replace(".webp", "") : key;
  } else if (key.includes(".gif")) {
    returnKey = key;
  } else if (key.includes(".docx")) {
    returnKey = key;
  } else if (key.includes(".pdf")) {
    returnKey = key;
  } else {
    allErrors.push({ key });
    return "error file" + key;
  }
  all.push({ key: returnKey });
  return returnKey;
};
const doesItContain = (arr, val) => {
  let returnVal = false;
  arr.forEach((ele) => {
    if (ele.trim() === val.trim()) {
      returnVal = true;
    }
  });
  return returnVal;
};

doStuff().then(() => {
  //   mongoose.connection.close();
  //   console.log(
  //     "***************************************************************************************************Connection closed"
  //   );
});
