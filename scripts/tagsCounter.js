const mongoose = require("mongoose");
const Property = require("../models/property.model");
const Project = require("../models/project.model");
const Builder = require("../models/builder.model");
const Authority = require("../models/authority.model");
const News = require("../models/news.model");
const Bank = require("../models/bank.model");
const Tags = require("../models/tags.model");
const readline = require("readline-sync")

const fs = require('fs');
mongoose.connect("mongodb://realestate:rEAleStAtepWd91608102022@3.87.184.6:27017/realestate?authSource=realestate&w=1&tls=false", {
// mongoose.connect("mongodb://localhost:27017/realestate", {
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
  // const allTags = await Tags.find({});
  // const authorities = await Authority.find({});
  // const properties = await Property.find({});
  // const projects = await Project.find({});
  // const builders = await Builder.find({});
  // const banks = await Bank.find({});
  const news = await News.find({});

  let count = 0

  let allTagsCounter = {};

  // console.log("********************************");
  // console.log("* Total Tags : ", allTags[0].tags.length);
  // allTags[0].tags.forEach((tag)=>{
  //   allTagsCounter[tag] = 0;
  // })
  // console.log(allTagsCounter);
  // console.log("********************************");


  // console.log("********************************");
  // console.log("* total docs in property : ", authorities.length);
  // authorities.forEach((authority, index)=>{

  //   if (index === 0){
  //     count = 0;
  //   }
    
  //   if (authority.tags.length > 0){
  //     count = count + 1;
  //     console.log(authority.tags);
  //   }
  //   if (index === authorities.length -1)
  //     console.log("** count of non-empty tags: ", count);
  // });
  // console.log("********************************");


  // console.log("********************************");
  // console.log("* total docs in property : ", properties.length);
  // properties.forEach((property, index)=>{
  //   if (index === 0){
  //     count = 0;
  //   }
  //   if (property.tags.length > 0){
  //     count = count + 1;
  //     console.log(property.tags);
  //   }
  //   if (index === properties.length -1)
  //     console.log("** count of non-empty tags: ", count);
  // });
  // console.log("********************************");


  // console.log("********************************");
  // console.log("* total docs in project : ", projects.length);
  // projects.forEach((project, index)=>{
  //   if (index === 0){
  //     count = 0;
  //   }
  //   if (project.tags.length > 0){
  //     count = count + 1;
  //     console.log(project.tags);
  //   }
  //   if (index === projects.length -1)
  //     console.log("** count of non-empty tags: ", count);
  // });
  // console.log("********************************");


  // console.log("********************************");
  // console.log("* total docs in builders : ", builders.length);
  // builders.forEach((builder, index)=>{
  //   if (index === 0){
  //     count = 0;
  //   }
  //   if (builder.tags.length > 0){
  //     count = count + 1;
  //     console.log(builder.tags);
  //   }
  //   if (index === builders.length -1)
  //     console.log("** count of non-empty tags: ", count);
  // });
  // console.log("********************************");


  // console.log("********************************");
  // console.log("* total docs in banks : ", banks.length);
  // banks.forEach((bank, index)=>{
  //   if (index === 0){
  //     count = 0;
  //   }
  //   if (bank.tags.length > 0){
  //     count = count + 1;
  //     console.log(bank.tags);
  //   }
  //   if (index === banks.length -1)
  //     console.log("** count of non-empty tags: ", count);
  // });
  // console.log("********************************");


  console.log("********************************");
  console.log("* total docs in news : ", news.length);
  news.forEach((article, index)=>{
    if (index === 0){
      count = 0;
    }
    if (article.tags.length > 0){
      count = count + 1;
      article.tags.forEach((articleTag)=>{
        // console.log(articleTag)
        console.log(allTagsCounter)
        console.log(articleTag)
        console.log(allTagsCounter[articleTag])
        if (!allTagsCounter[articleTag])
          allTagsCounter[articleTag] = 1;
        else
          allTagsCounter[articleTag] = allTagsCounter[articleTag]+1;
        console.log(allTagsCounter)
        // let q = readline.question("*****Hello")
      })
      // console.log(article.tags);
    }
    if (index === news.length -1)
      console.log("** count of non-empty tags: ", count);
  });
  console.log(allTagsCounter);
  console.log("********************************");

  // fs.writeFile(JSON.stringify('./tagsCounter.json',allTagsCounter));
  
  let jsonString = JSON.stringify(allTagsCounter);


  fs.writeFile('./tagsCounter.json', jsonString, err => {
    if (err) {
        console.log('Error writing file', err)
    } else {
        console.log('Successfully wrote file')
    }
});

  // let modifiedCount = { modified: 0, total: allDocs.length };

  // allDocs.forEach(async (item, index) => {
  //   const u = await myModel
  //     .updateOne({ _id: item._id }, { createdAt: new Date() })
  //     .then((res) => {
  //       if (res.ok === 1 && res.nModified === 1) {
  //         modifiedCount.modified++;
  //         if (index === modifiedCount.total - 1) console.log(modifiedCount);
  //       }
  //     });
  // });
};

// seedDb();

seedDb().then(() => {
  mongoose.connection.close();
  console.log(
    "***************************************************************************************************Connection closed"
  );
});
