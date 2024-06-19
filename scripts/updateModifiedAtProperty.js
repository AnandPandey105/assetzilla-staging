const mongoose = require("mongoose");
const Property = require("../models/property.model");
const Project = require("../models/project.model");
const Builder = require("../models/builder.model");
const Authority = require("../models/authority.model");
const News = require("../models/news.model");
const Bank = require("../models/bank.model");
const Tags = require("../models/tags.model");
const City = require("../models/city.model");
const District = require("../models/district.model");
const Subcity = require("../models/subcity.model");
const State = require("../models/state.model");

const fs = require("fs");
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

const seedDb = async () => {
  const authorities = await Authority.find({});
  const properties = await Property.find({});
  const projects = await Project.find({});
  const builders = await Builder.find({});
  const banks = await Bank.find({});
  const news = await News.find({});
  const cities = await City.find({});
  const districts = await District.find({});
  const subcities = await Subcity.find({});
  const states = await State.find({});

  const readline = require("readline-sync");

  console.log("********************************");
  console.log("* total docs in property : ", properties.length);
  // for (const entity of authorities){
  //   let newDate = undefined;
  //   if(entity.createdAt){
  //     newDate = entity.createdAt;
  //   } else{
  //     newDate = entity.created
  //   }

  //   const response = await Authority.findOneAndUpdate({name:entity.name}, {updatedAt:newDate}, {new:true, timestamps:false});
  //   console.log(response)
  // }
  // console.log("********************************");
  for (const entity of properties) {
    console.log("*************************");
    console.log("created: ", entity.created);
    console.log("updated: ", entity.updated);
    console.log("updatedAt: ", entity.updatedAt);
    console.log("cretedAt: ", entity.createdAt);

    const newUpdateDate = entity.createdAt || entity.created;
    console.log(newUpdateDate);

    if (newUpdateDate) {
      let q = readline.question("Continue?");
      const response = await Property.findOneAndUpdate(
        { url: entity.url },
        { updatedAt: newUpdateDate },
        { new: true, timestamps: false }
      );
      console.log(response.updatedAt, newUpdateDate);
    }

    // console.log(response)
  }
  console.log("********************************");

  // for (const entity of projects) {
  //   console.log("*************************");
  //   console.log(entity.name);
  //   console.log("created:   ", entity.created);
  //   console.log("updated:   ", entity.updated);
  //   console.log("updatedAt: ", entity.updatedAt);
  //   console.log("createdAt: ", entity.createdAt);

  //   const newUpdateDate = entity.createdAt || entity.created;
  //   console.log(newUpdateDate);

  //   let q = readline.question("Continue?");
  //   if (newUpdateDate) {
  //     const response = await Project.findOneAndUpdate(
  //       { url: entity.url },
  //       { updatedAt: newUpdateDate },
  //       { new: true, timestamps: false }
  //     );
  //     console.log(response.updatedAt, newUpdateDate);
  //     console.log(response);
  //   }
  // }
  // console.log("********************************");

  // for (const entity of builders){

  //   console.log("*************************")
  //   console.log(entity.name)
  //   console.log("created: ",entity.created);
  //   console.log("updated: ",entity.updated);
  //   console.log("updatedAt: ",entity.updatedAt);
  //   console.log("cretedAt: ",entity.createdAt);

  //   const newUpdateDate = entity.createdAt || entity.created;
  //   console.log(newUpdateDate)

  //   let q = readline.question("Continue?");
  //   const response = await Builder.findOneAndUpdate({url:entity.url}, {updatedAt:newUpdateDate}, {new:true, timestamps:false});
  //   console.log(response.updatedAt, newUpdateDate)
  //   console.log(response)
  // }
  // console.log("********************************");

  // for (const entity of banks){

  //   const response = await Bank.findOneAndUpdate({name:entity.name}, {updated:entity.created}, {new:true, timestamps:false});
  //   console.log(response)
  // }
  // console.log("********************************");

  // for (const entity of news){

  //   const response = await News.findOneAndUpdate({heading:entity.heading}, {updated:entity.created}, {new:true, timestamps:false});
  //   console.log(response)
  // }
  // console.log("********************************");

  // for (const entity of cities){

  //   const response = await City.findOneAndUpdate({name:entity.name}, {updated:entity.created}, {new:true, timestamps:false});
  //   console.log(response)
  // }
  // console.log("********************************");

  // for (const entity of subcities){

  //   const response = await Subcity.findOneAndUpdate({name:entity.name}, {updated:entity.created}, {new:true, timestamps:false});
  //   console.log(response)
  // }
  // console.log("********************************");

  // for (const entity of districts){

  //   const response = await District.findOneAndUpdate({name:entity.name}, {updated:entity.created}, {new:true, timestamps:false});
  //   console.log(response)
  // }
  // console.log("********************************");

  // for (const entity of states){

  //   const response = await State.findOneAndUpdate({name:entity.name}, {updated:entity.created}, {new:true, timestamps:false});
  //   console.log(response)
  // }
  console.log("********************************");
};

// seedDb();

seedDb().then(() => {
  mongoose.connection.close();
  console.log(
    "***************************************************************************************************Connection closed"
  );
});
