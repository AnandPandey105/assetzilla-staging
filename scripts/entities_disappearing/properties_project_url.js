const ENTITY = require("../../models/property.model");
const PROJECT = require("../../models/project.model");

let matchingCount = 0;
let potentialMatchingCount = 0;
let nonPotentialMatchingCount = 0;
let nonMatchingCount = 0;
let projectUrlNullCount = 0;
let totalCount = 0;
let reqdData = [];
let nullData = [];

const getNewUrl = async (data) => {
  let url = "";
  let relevantProject = await PROJECT.findOne({ url: data.project_url });
  if (relevantProject) {
    matchingCount++;
    console.log("found project_url", relevantProject.url);
    url = relevantProject.url;
  } else {
    console.log(
      "Couldn't find project_url, response was",
      relevantProject,
      " generating potential url..."
    );
    if (data.project_url) {
      nonMatchingCount++;
      reqdData.push({
        url: data.url,
        project_url: data.project_url,
        name: data.name,
        project: data.project,
        project_name: data.project_name,
        builder: data.builder,
        authority: data.authority,
      });
      let temp = data.project_url.split("/projects/")[1].split("-");
      console.log(temp);
      let projectId = temp.splice(temp.length - 1, 1);
      console.log(projectId);
      temp = temp.join(" ");
      console.log(temp);
      console.log(temp);
      url = "/projects/" + slugify(temp, slugifyOptions) + "-" + projectId;
      console.log(url);
      relevantProject = await PROJECT.findOne({ url: url });
      if (relevantProject) {
        console.log(
          "found project with the new constructed url: ",
          relevantProject.url
        );
        potentialMatchingCount++;
      } else {
        nonPotentialMatchingCount++;
        console.log(
          "couldn't find project with potential url too...",
          "skipping"
        );
      }

      //   console.log(url)
    } else {
      console.log("project_url was null");
      projectUrlNullCount++;
      url = data.project_url;
      nullData.push({
        url: data.url,
        project_url: data.project_url,
        name: data.name,
        project: data.project,
        project_name: data.project_name,
        builder: data.builder,
        authority: data.authority,
      });
    }
  }
  return url;
};

// *****************************************************************
const mongoose = require("mongoose");
const slugify = require("slugify");
const { slugifyOptions } = require("../../appConstants");
const fs = require("fs");

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
  totalCount = entityDocuments.length;
  console.log("found", entityDocuments.length, "entities");
  for (const doc of entityDocuments) {
    let newUrl = await getNewUrl(doc);

    if (process.argv[3] === "--update" || process.argv[2] === "--update") {
      await ENTITY.findOneAndUpdate(
        { _id: doc._id },
        { $set: { project_url: newUrl } },
        { new: true, timestamps: false }
      )
        .then((successResponse) => {
          if (successResponse) {
            console.log(
              "Url was updated from ",
              doc.project_url,
              " to ",
              successResponse.project_url
            );
          } else {
            console.log(
              "Failed to update the project_url, response was null : ",
              successResponse
            );
          }
        })
        .catch((failureResponse) => {
          console.log(
            "Failed to update project_url for ",
            doc.name,
            " because of ",
            failureResponse
          );
        });
    } else {
      console.log(doc.project_url);
      console.log(newUrl);
      console.log(
        "Data not updated in the database, to update provide --update\n"
      );
    }
  }
  console.log(
    "\nmatchingCount: ",
    matchingCount,
    " | projectUrlNullCount:",
    projectUrlNullCount,
    " | nonMatchingCount:",
    nonMatchingCount,
    "",
    "\npotentialMatchingCount:",
    potentialMatchingCount,
    " | nonPotentialMatchingCount:",
    nonPotentialMatchingCount,
    "\ntotalCount:",
    totalCount
  );
  exportJson(reqdData, "nonMatchingCount.json");
  exportJson(nullData, "projectUrlNullCount.json");
};

seedDb().then(() => {
  mongoose.connection.close();
  console.log(
    "***************************************************************************************************Connection closed"
  );
});
