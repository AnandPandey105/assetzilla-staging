const mongoose = require("mongoose");
const awssdk = require("aws-sdk");
const Property = require("../models/property.model");
const readline = require("readline-sync");

// mongoose.connect("mongodb://realestate:rEAleStAtepWd91608102022@3.87.184.6:27017/realestate?authSource=realestate&w=1&tls=false", {
mongoose.connect("mongodb://localhost:27017/realestate_10_april_22", {
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

const s3mongo = async () => {
  awssdk.config.update({ region: "us-east-1" });
  awssdk.config.update({
    secretAccessKey: "tkklYz7xNRp+plXh1S4wedA8+q94hsY2ZB3BdjE8",
    accessKeyId: "AKIAXLIN4PPU6MFTVKEE",
  });
  s3 = new awssdk.S3({ apiVersion: "2006-03-01" });

  const properties = await Property.find({});
  //   properties.forEach((property) => console.log(property.images));
  for (const property of properties) {
    if (property.images.Properties[0]) {
      var bucketParams = {
        Bucket: "s3-application",
        Key: "dyn-res/property/image/" + property.images.Properties[0],
      };
      console.log(property.images.Properties[0]);
      console.log(property.url);
      console.log(bucketParams);
      await s3.getObject(bucketParams, async function (err, data) {
        if (err) {
          console.log("Error", err);
        } else {
          console.log("Success", data);
          await Property.findOneAndUpdate(
            { url: property.url },
            { updatedAt: data.LastModified },
            { new: true, timestamps: false }
          )
            .then((doc) => {
                console.log(doc.url)
                console.log(updatedAt)
            })
            .catch((err) => console.log(err));
        }
      });
    //   const q = readline.question("Continue?");
    }
  }
};

s3mongo()
