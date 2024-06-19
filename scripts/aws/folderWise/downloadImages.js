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
// const images = ["2016-07-16-14-11-44.jpg","_2016-07-13-04-47-19.jpg","_2016-07-14-13-18-44.jpg","builder_1506923949.png","builder_1506924397.png","builder_1506924694.png","builder_1507046360.jpg","builder_1507047631.jpg","builder_1507048789.png","builder_1507087109.png","builder_1510072843.png","builder_1515944810.png","builder_1515946258.png","builder_1515948791.png","builder_1524161015.jpg","builder_1524161091.png","builder_1524164004.png","builder_1524165910.png","builder_1524166093.png","builder_1592710618530.png","builder_1612590085517.docx","builder_1612590796302.docx","builder_1612591414257.docx","builder_1612592310765.docx","builder_1612594188035.docx","builder_1612594252072.docx","builder_1664684650657.svg"]
const images = ["project_1668618482645.png",
"project_1668618482656.png",
"project_1668618482664.png",
"Image 3_32016-08-26-07-38-06.jpg",
"projects_1510241926.jpg",
"project_1656406972214.jpg",
"project_1634282783521.jpg",
"project_1634282783562.jpg",
"project_1671524186861969921.jpg",]

const prefixOfAws = "dyn-res/project/image/";
const folderToSaveIn = "property";
const entity = "Builders_";

var oldBucketParamsList = {
  Bucket: "s3-application",
  Delimiter: "/",
  Prefix: prefixOfAws,
  MaxKeys: 1000
};

const getOldBucketParams = (filename) => {
  return {
    Bucket: "s3-application",
    Key: prefixOfAws + filename,
  };
};

//\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
///////////////////////////////////////////////////////////////////////////////////////////////////////


const doStuff = async () => {
    for (const img of images){
        try{
            let data = await s3.getObject(getOldBucketParams(img)).promise();
            if (data){
                console.log(data);
                const res = fs.writeFileSync(`./project/${img}`, data.Body);
            }
        } catch(e){
            console.log(e);
        }
    }
};

doStuff().then(() => {
  //   mongoose.connection.close();
  //   console.log(
  //     "***************************************************************************************************Connection closed"
  //   );
});
