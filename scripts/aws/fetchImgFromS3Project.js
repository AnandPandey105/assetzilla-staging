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

let temp = [
  {
    _id:"5d7a0fe05f627d3ae83d93e7",
    kid_amenites_json: ["", ""],
    name: "The Galleria",
    subcity: "East Delhi",
    builder: "DLF Limited",
    road_width: { width: 0, unit: "feet" },
    banner_image: ["Projects", "Image 1_12016-05-19-05-09-30.jpg"],
    health_amenites_json: ["", "", "Clean area"],
    green_amenites_json: ["Rain Water Harvesting", "", "Park"],
    description:
      "The Galleria is a retail complex developed by DLF group in Mayur Vihar. It is built to tap the emergent market of East Delhi.&nbsp;",
    property_type: "Retail Shop",
    area: { area: 4, unit: "acres", min: null, max: null },
    city: "New Delhi",
    connectivity_amenites_json: ["Wifi", "", "Nearby Metro", "Bus Staion @1Km"],
    country: "India",
    floors: "3",
    authority: "Delhi Development Authority (DDA)",
    url: "/projects/the-galleria-51",
    amenities_json: ["Garden", "24Hr Backup"],
    details: [
      { area: 344, shop_type: "Vanilla Shop" },
      { shop_type: "Vanilla Shop", area: 457 },
      { shop_type: "Vanilla Shop", area: 567 },
      { shop_type: "Vanilla Shop", area: 630 },
      { shop_type: "Vanilla Shop", area: 791 },
      { area: 894, shop_type: "Vanilla Shop" },
      { area: 916, shop_type: "Vanilla Shop" },
      { area: 1028, shop_type: "Vanilla Shop" },
      { area: 1210, shop_type: "Vanilla Shop" },
      { area: 1393, shop_type: "Vanilla Shop" },
      { area: 1479, shop_type: "Vanilla Shop" },
      { area: 1514, shop_type: "Vanilla Shop" },
      { area: 1640, shop_type: "Vanilla Shop" },
      { area: 1767, shop_type: "Vanilla Shop" },
      { area: 1847, shop_type: "Vanilla Shop" },
      { area: 1925, shop_type: "Vanilla Shop" },
      { area: 2593, shop_type: "Vanilla Shop" },
      { area: 2975, shop_type: "Vanilla Shop" },
      { area: 15360, shop_type: "Food Court/ Kiosk" },
      { area: 36970, shop_type: "Anchor Shop" },
    ],
    district: "East Delhi",
    images: {
      Projects: [
        "Image 1_12016-05-19-05-09-30.jpg",
        "project_1591272541188.jpg",
        "project_1591272541190.jpg",
        "project_1591272541195.jpg",
        "project_1591272541198.jpg",
        "project_1591272541203.jpg",
      ],
    },
    other_amenites_json: [
      "",
      "",
      "24*7 Water",
      "Electricity Backup",
      "Security",
    ],
    state: "Delhi",
    project_status: "Ready To Move",
    location: {
      location: { lat: "28.59154628771286", lng: "77.29728082565612" },
    },
    id: "51",
    is_live: "2",
    price: {
      zeroTo25Lacs: 0,
      twentyfiveTo50Lacs: 0,
      fiftyTo1cr: 0,
      oneTo5cr: 0,
      fiveToabove: 0,
      min: null,
      max: null,
    },
    total_properties: 0,
    banks: [],
    brochure: [],
    floor_plan: ["project_1591626243726.pdf"],
    other_document: [],
    price_list: [],
    retail_additional: [],
    retail_floor_type: ["Ground", "First Floor", "Second Floor"],
    retail_type: ["Food Court"],
    site_plan: [],
    space: [],
    specification: [],
    tags: [],
    visitor_parking_spot: [],
    address:
      "Metro Station, DGL 107, 1st Floor, Galleria, Dlf Mayur Vihar Plot No. 01D, DDA District Center, Near to, Mayur Vihar Phase 1 Extension, New Delhi, Delhi",
    facing: "North-East",
    pincode: 110001,
    rera: "NA",
    total_floors: 3,
    sq_fit_cost: { min: null, max: null },
    details_area: { min: 344, max: 36970 },
    views: 7,
  },
];

const convertProject = async () => {
  const Project = require("../../models/project.model");
  let allProjects = await Project.find({});
//   allProjects = temp
  console.log(allProjects.length);
  for (const project of allProjects) {
    // console.log(city)

    if (
      project.images &&
      project.images.Projects &&
      project.images.Projects.length > 0
    ) {
      let newImages = [];
      let newBannerImages = ["Projects"];
      for (const logo of project.images.Projects) {
        console.log(logo);

        //1. get image from the older s3 bucket
        var bucketParams = {
          Bucket: "s3-application",
          Key: "dyn-res/project/image/" + logo,
        };
        console.log("--------------------");
        console.log("dyn-res/project/image/" + logo)
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
              const res = fs.writeFileSync(`./projects/${logo}`, data.Body);
              const response = await convertToWebp(
                `./projects/${logo}`,
                `./projects/webp/`
              );
              // 3. put image in the newer s3 bucket
              if (response.success) {
                let file = `${logo.split(".")[0]}.webp`;
                var params = {
                  ACL: "public-read",
                  Body: fs.createReadStream(`./projects/webp/${file}`),
                  Bucket: "assetzilla-bucket",
                  Key: `dyn-res/project/Image/${file}`,
                };
                await s3
                  .putObject(params)
                  .promise()
                  .then(async (data) => {
                    console.log(data);
                    newImages.push(`${logo.split(".")[0]}.webp`);
                    if (
                      project.banner_image &&
                      project.banner_image[1] === logo
                    ) {
                      newBannerImages.push(`${logo.split(".")[0]}.webp`);
                    }
                  })
                  .catch((r) => {
                    console.error(r);
                    newImages.push(logo);
                    if (
                      project.banner_image &&
                      project.banner_image[1] === logo
                    ) {
                      newBannerImages.push(logo);
                    }
                    allErrors.push({ ...response.result, img: "" });
                  });
              } else {
                newImages.push(logo);
                if (project.banner_image && project.banner_image[1] === logo) {
                  newBannerImages.push(logo);
                }
                allErrors.push({ ...response.result, img: logo });
              }
            })
            .catch((e) => {
              console.error(e);
              allErrors.push({ img: logo, e: e });
            });
        }
        console.log("--------------------");
      }
    //   await Project.findOneAndUpdate(
    //     { _id: project._id },
    //     { images: { Projects: newImages }, banner_image: newBannerImages },
    //     { new: true, timestamps: false }
    //   )
    //     .then((success) => {
    //       if (success) console.log("Project update successfull");
    //       else console.info("Project was not found");
    //     })
    //     .catch((e) => console.error("Error: ", e));
      //2.
    }
    // readline.question("Continue?");
  }
  exportJson(allErrors, "ProjectErrors.json");
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
convertProject().then(() => {
  mongoose.connection.close();
  console.log(
    "***************************************************************************************************Connection closed"
  );
});
