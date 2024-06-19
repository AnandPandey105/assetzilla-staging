const mongoose = require("mongoose");
const Property = require("../models/property.model");
const Project = require("../models/project.model");
const Builder = require("../models/builder.model");
const Authority = require("../models/authority.model");
const News = require("../models/news.model");
const Bank = require("../models/bank.model");
const Tags = require("../models/tags.model");
const readline = require("readline-sync")

const fs = require("fs");
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

const capitalize = (s) => (s[0].toUpperCase() + s.slice(1)).trim();
function findDuplicates(arr) {
  let count = 0;
  let duplicates = arr.filter((currentValue, currentIndex) => {
    if (arr.indexOf(currentValue) !== currentIndex) count++;
    return arr.indexOf(currentValue) !== currentIndex;
  });
  return { count: count, duplicates: duplicates };
}

const capitalizeTags = async () => {
  const allTags = await Tags.find({});
  let news = await News.find({});

  let count = 0;

  let allTagsCounter = {};

  console.log("********************************");
  console.log("* Total Tags : ", allTags[0].tags.length);
  allTags[0].tags.forEach((tag) => {
    allTagsCounter[tag] = 0;
  });
  //   console.log(allTagsCounter);
  console.log("********************************");
  //*************************************************** */
  console.log("********************************");
  console.log("* total docs in news : ", news.length);
  // news.forEach(async (article, index)=>{
  // news = allTags;
  for (const article of news) {
    let newTags = [];
    if (article.tags.length > 0) {
      count = count + 1;
      // console.log("=================================")
      console.log("old article.tags = \n",article.tags)
      //extracting each word from the array of tags
      console.log(article.tags.length)
      await article.tags.forEach(async (articleTag) => {
        let iATArray = articleTag.split(" ");
        // console.log(iATArray);
        let newArray = [];
        let askQ = articleTag === "hdfc securities"
        // console.log(articleTag)
        iATArray.forEach((word, i) => {
          // console.log(word);
          if (word !== "") newArray[i] = capitalize(word.trim());
          // console.log(word)
        });
        // console.log(newArray)
        let newTag = newArray.join(" ");
        // console.log(newTag)
        let q = undefined;
        if (askQ)
          q = readline.question("********continue?");
        newTags.push(newTag.trim());
      });
      // console.log("newTags = \n",newTags);

      article.tags = newTags;
      // console.log("==============")
      console.log("new article.tags = \n",article.tags);
      // console.log("=================================")

      let duplicates = findDuplicates(article.tags);
      if (duplicates.duplicates.length > 0) {
        console.error(duplicates);
        console.log(article.tags);
        duplicates.duplicates.forEach((t) => {
          console.log(article.tags.indexOf(t));
          article.tags.splice(article.tags.indexOf(t), 1)
        });
        console.log(article.tags);
        console.log("-----------------");
        newTags = article.tags;
      }

      // await News.findOneAndUpdate({url:article.url}, {tags: newTags}, {new: true}).then(async(doc)=>{
      //   console.log("New Tag => ", doc.tags);
      // }).catch((e)=>{
      //   console.error(e)
      // });

      await News.findOneAndUpdate({_id: article._id}, {tags:newTags}, {new:true, timestamps:false}).then(async(doc)=>{
        console.log(doc)
        console.log("New Tag => ", doc.tags);
      }).catch((e)=>{
          console.error(e)
      });
    }
  }
};

capitalizeTags().then(() => {
  mongoose.connection.close();
  console.log(
    "***************************************************************************************************Connection closed"
  );
});
