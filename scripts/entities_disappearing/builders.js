const ENTITY = require("../../models/builder.model");

const getNewUrl = (doc) => {
  let url = "";
  url =
    "/builders/" + slugify(doc.name, slugifyOptions) + "-" + doc.id;
  return url;
};

// *****************************************************************
const mongoose = require("mongoose");
const slugify = require("slugify");
const { slugifyOptions } = require("../../appConstants");

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

//

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

const seedDb = async () => {
  entityDocuments = await ENTITY.find({});
  console.log("found", entityDocuments.length, "entities");
  for (const doc of entityDocuments) {
    let newUrl = getNewUrl(doc);

    if (process.argv[3] === "--update" || process.argv[2] === "--update") {
      await ENTITY.findOneAndUpdate(
        { _id: doc._id },
        { $set: { url: newUrl } },
        { new: true, timestamps: false }
      )
        .then((successResponse) => {
          if (successResponse) {
            console.log(
              "Url was updated from ",
              doc.url,
              " to ",
              successResponse.url
            );
          } else {
            console.log(
              "Failed to update the url, response was null : ",
              successResponse
            );
          }
        })
        .catch((failureResponse) => {
          console.log(
            "Failed to update url for ",
            doc.name,
            " because of ",
            failureResponse
          );
        });
    } else {
        console.log(doc.url)
        console.log(newUrl);
        console.log("Data not updated in the database, to update provide --update")
    }
  }
};

seedDb().then(() => {
  mongoose.connection.close();
  console.log(
    "***************************************************************************************************Connection closed"
  );
});
