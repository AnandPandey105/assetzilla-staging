const readline = require("readline-sync");
const mongoose = require("mongoose");
var moment = require("moment");
var clc = require("cli-color");
var mapping = {
  log: clc.blue,
  warn: clc.yellow,
  error: clc.red,
  info: clc.magenta,
};

["log", "warn", "error", "info"].forEach(function (method) {
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
  readline.question("(Press any key to continue)");
} else {
  console.log(
    "******************Using localdb ..., you can give --production flag to use production db"
  );
  readline.question("(Press any key to continue)");
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

const renameProjectImages = async () => {
  const Project = require("../../models/project.model");
  const allProjects = await Project.find({});
  console.log(`Total ${allProjects.length} projects`);
  for (const project of allProjects) {
    let shouldChange = false;
    const banner_image = project.banner_image;
    const images = project.images.Projects;

    console.log("banner_image",banner_image);
    console.log("images",images)

    let new_banner_images = [];
    let new_images = [];

    if (banner_image.length > 1) {
      banner_image.forEach((banner_img, index) => {
        if (banner_img !== "Projects" && banner_img !== null) {
          banner_img = banner_img.split(".");
          if (banner_img.length === 2) {
            if (banner_img[1] === 'JPG' || banner_img[1] === 'JPEG' || banner_img[1] === 'PNG'){
              shouldChange = true;
              banner_img = banner_img[0] + ".webp";
              // console.log(banner_img);
              new_banner_images.push(banner_img);
            } else {
              let imgg = banner_img[0] + "." + banner_img[1];
              console.log(imgg, "<<<<<<<<<<,")
              new_banner_images.push(imgg)
            }
          } else {
            console.error("Anamoly!!!", banner_img);
            banner_img = readline.question("New Image Name?");
            new_banner_images.push(banner_img);
            readline.question("Continue?");
          }
        } else {
          new_banner_images.push(banner_img);
        }
      });
      console.log("new banner images",new_banner_images);
      console.log("banner image",banner_image);
    } else {
      console.log(banner_image);
      console.info("Project Name: ", project.name);
      readline.question("Does not look right, continue?");
    }

    if (images.length > 0) {
      images.forEach((img, index) => {
        img = img.split(".");
        if (img.length === 2) {
          if (img[1] === 'JPG' || img[1] === 'JPEG' || img[1] === 'PNG'){
            shouldChange = true;
            img = img[0] + ".webp";
            // console.log(img);
            new_images.push(img);
          } else {
            img = img[0] + "." + img[1]
            new_images.push(img)
          }
        } else {
          console.error("Anamoly!!!", img);
          img = readline.question("New Image Name?");
          new_images.push(img);
          readline.question("Continue?");
        }
      });
      console.log("new_images",new_images);
    } else {
      console.log("images",images);
      console.info("Project Name: ", project.name);
      readline.question("Does not look right, continue?");
    }

    new_images = { Projects: new_images };
    console.log("inserting ...")
    console.log("new_images",new_images);
    console.log("new_banner_images", new_banner_images)
    // readline.question("......................");
    if(shouldChange){
      readline.question("===-=-=--=-he")
      await Project.findOneAndUpdate(
        { _id: project._id },
        { banner_image: new_banner_images, images: new_images },
        { new: true, timestamps: false }
      )
        .then((success) => {
          if (success) {
            console.info("Data updated succesfully");
          } else {
            console.error("Response was ", success);
          }
        })
        .catch((err) => console.error(project.name, err));
    }
    console.log("=---------------------------------------------------------------------------------------=")
  }
};

const renamePropertyImages = async () => {
  const Property = require("../../models/property.model");
  const allPropertys = await Property.find({});
  console.log(`Total ${allPropertys.length} propertys`);
  for (const property of allPropertys) {
    let shouldChange = false;
    const banner_image = property.banner_image;
    const property_images = property.images.Properties;
    const project_images = property.images.Projects;

    console.warn(banner_image);
    console.warn(property_images);
    console.warn(project_images);
    console.warn(property.images);

    let new_banner_images = [];
    let new_property_images = [];
    let new_project_images = [];

    if (banner_image.length > 1) {
      banner_image.forEach((banner_img, index) => {
        if (
          banner_img !== "Properties" &&
          banner_img !== "Projects" &&
          banner_img !== null
        ) {
          banner_img = banner_img.split(".");
          if (banner_img.length === 2) {
            if (banner_img[1] === 'JPG' || banner_img[1] === 'JPEG' || banner_img[1] === 'PNG'){
              shouldChange = true;
              banner_img = banner_img[0] + ".webp";
              // console.log(banner_img);
              new_banner_images.push(banner_img);
            } else {
              banner_img = banner_img[0] + "." + banner_img[1]
              new_banner_images.push(banner_img)
            }
          } else {
            console.error("Anamoly!!!", banner_img);
            banner_img = readline.question("New Image Name?");
            new_banner_images.push(banner_img);
            readline.question("Continue?");
          }
        } else {
          new_banner_images.push(banner_img);
        }
      });
      console.log(new_banner_images);
      console.log(banner_image);
    } else {
      console.log(banner_image);
      console.info("Property Name: ", property.name);
      // readline.question("Does not look right, continue?");
    }

    if (property_images.length > 0) {
      property_images.forEach((img, index) => {
        img = img.split(".");
        if (img.length === 2) {
          if (img[1] === 'JPG' || img[1] === 'JPEG' || img[1] === 'PNG'){
            shouldChange = true;
            img = img[0] + ".webp";
            // console.log(img);
            new_property_images.push(img);
          } else {
            img = img[0] + "." + img[1]
            new_property_images.push(img)
          }
        } else {
          console.error("Anamoly!!!", img);
          img = readline.question("New Image Name?");
          new_property_images.push(img);
          readline.question("Continue?");
        }
      });
      console.log(new_property_images);
    } else {
      console.log(property_images);
      console.info("Property Name: ", property.name);
      // readline.question("Does not look right, continue?");
    }

    if (project_images.length > 0) {
      project_images.forEach((img, index) => {
        img = img.split(".");
        if (img.length === 2) {
          if (img[1] === 'JPG' || img[1] === 'JPEG' || img[1] === 'PNG'){
            shouldChange = true;
            img = img[0] + ".webp";
            // console.log(img);
            new_project_images.push(img);
          } else {
            img = img[0] + "." + img[1]
            new_project_images.push(img)
          }
        } else {
          console.error("Anamoly!!!", img);
          img = readline.question("New Image Name?");
          new_project_images.push(img);
          readline.question("Continue?");
        }
      });
      console.log(new_project_images);
    } else {
      console.log(project_images);
      console.info("Property Name: ", property.name);
      // readline.question("Does not look right, continue?");
    }

    //mistake hence commented
    // let new_images = {
    //   Properties: new_project_images,
    //   Projects: new_project_images,
    // };

    let new_images = {
      Properties: new_property_images,
      Projects: new_project_images,
    };
    console.log(new_images);
    // readline.question("......................");
    if (shouldChange){
      readline.question('he')
      await Property.findOneAndUpdate(
        { _id: property._id },
        { banner_image: new_banner_images, images: new_images },
        { new: true, timestamps: false }
      )
        .then((success) => {
          if (success) {
            console.info("Data updated succesfully", success);
          } else {
            console.error("Response was ", success);
          }
        })
        .catch((err) => console.error(property.name, err));
    }
    console.log("-----------------------------------------")
  }
};

const renameNewsImages = async () => {
  const News = require("../../models/news.model");
  const allNews = await News.find({});
  console.log(`Total ${allNews.length} news`);
  for (const article of allNews) {
    if (article.images) {
      console.log("Old image name: ", article.images);
      let old_img = article.images.split(".")
      console.log(old_img)
      let new_img = ""
      if (old_img[1] === 'JPG' || old_img[1] === 'JPEG' || old_img[1] === 'PNG'){
        new_img = old_img[0] + ".webp";
      } else {
        new_img = old_img[0] + "." + old_img[1]
      }
      console.log("New Image name: ", new_img);
      await News.findOneAndUpdate(
        { _id: article._id },
        { images: new_img },
        { timestamps: false, new: true }
      )
        .then((doc) =>
          doc
            ? console.log(doc.images === new_img)
            : console.log("null null null")
        )
        .catch((err) => console.error(err, article.heading));
    }
  }
};

const renameAuthorityImages = async () => {
  const Authority = require("../../models/authority.model");
  const allAuthorities = await Authority.find({});
  console.log(`Total ${allAuthorities.length} authorities`);
  for (const authority of allAuthorities) {
    if (authority.logo) {
      let old_logo = authority.logo.split(".");
      let new_img = ""
      if (old_logo[1] && (old_logo[1].toUpperCase() === 'JPG' || old_logo[1].toUpperCase() === 'JPEG' || old_logo[1].toUpperCase() === 'PNG')){
        new_img = old_logo[0] + ".webp";
      } else {
        new_img = authority.logo
      }
      console.log(old_logo, new_img);
      await Authority.findOneAndUpdate(
        { _id: authority._id },
        { $set: { logo: new_img } },
        { timestamps: false, new: true }
      )
        .then((doc) => (doc ? console.info("Updated") : console.error(null)))
        .catch((err) => console.error(err, authority.name));
    }
    if (authority.master_plan_with_years_image) {
      let new_imgs = []
      for (img of authority.master_plan_with_years_image){
        let old = img.split(".");
        let new_img = ""
        if (old[1] && (old[1].toUpperCase() === 'JPG' || old[1].toUpperCase() === 'JPEG' || old[1].toUpperCase() === 'PNG')){
          new_img = old[0] + ".webp";
        } else {
          new_img = img
        }
        console.log(old, new_img);
        new_imgs.push(new_img)
      }
      await Authority.findOneAndUpdate(
        { _id: authority._id },
        { $set: { master_plan_with_years_image: new_imgs } },
        { timestamps: false, new: true }
      )
        .then((doc) => (doc ? console.info("Updated") : console.error(null)))
        .catch((err) => console.error(err, authority.name));
    }
    if (authority.area_covered_image) {
      let new_imgs = []
      for (img of authority.area_covered_image){
        let old = img.split(".");
        let new_img = ""
        if (old[1] && (old[1].toUpperCase() === 'JPG' || old[1].toUpperCase() === 'JPEG' || old[1].toUpperCase() === 'PNG')){
          new_img = old[0] + ".webp";
        } else {
          new_img = img
        }
        console.log(old, new_img);
        new_imgs.push(new_img)
      }
      await Authority.findOneAndUpdate(
        { _id: authority._id },
        { $set: { area_covered_image: new_imgs } },
        { timestamps: false, new: true }
      )
        .then((doc) => (doc ? console.info("Updated") : console.error(null)))
        .catch((err) => console.error(err, authority.name));
    }
    if (authority.banner_image) {
      let new_imgs = []
      for (img of authority.banner_image){
        let old = img.split(".");
        let new_img = ""
        if (old[1] && (old[1].toUpperCase() === 'JPG' || old[1].toUpperCase() === 'JPEG' || old[1].toUpperCase() === 'PNG')){
          new_img = old[0] + ".webp";
        } else {
          new_img = img
        }
        console.log(old, new_img);
        new_imgs.push(new_img)
      }
      await Authority.findOneAndUpdate(
        { _id: authority._id },
        { $set: { banner_image: new_imgs } },
        { timestamps: false, new: true }
      )
        .then((doc) => (doc ? console.info("Updated") : console.error(null)))
        .catch((err) => console.error(err, authority.name));
    }
    if (authority.metro_routes_image) {
      let new_imgs = []
      for (img of authority.metro_routes_image){
        let old = img.split(".");
        let new_img = ""
        if (old[1] && (old[1].toUpperCase() === 'JPG' || old[1].toUpperCase() === 'JPEG' || old[1].toUpperCase() === 'PNG')){
          new_img = old[0] + ".webp";
        } else {
          new_img = img
        }
        console.log(old, new_img);
        new_imgs.push(new_img)
      }
      await Authority.findOneAndUpdate(
        { _id: authority._id },
        { $set: { metro_routes_image: new_imgs } },
        { timestamps: false, new: true }
      )
        .then((doc) => (doc ? console.info("Updated") : console.error(null)))
        .catch((err) => console.error(err, authority.name));
    }
  }
};

const renameBuilderImages = async () => {
  const Builder = require("../../models/builder.model");
  const allBuilders = await Builder.find({});
  console.log(`Total ${allBuilders.length} builders`);
  for (const builder of allBuilders) {
    if (builder.logo) {
      let old_logo = builder.logo.split(".");
      let new_img = ""
      if (old_logo[1] === 'JPG' || old_logo[1] === 'JPEG' || old_logo[1] === 'PNG'){
        new_img = old_logo[0] + ".webp";
      } else {
        new_img = builder.logo
      }
      console.log(old_logo, new_img);
      await Builder.findOneAndUpdate(
        { _id: builder._id },
        { $set: { logo: new_img } },
        { timestamps: false, new: true }
      )
        .then((doc) => (doc ? console.info("Updated") : console.error(null)))
        .catch((err) => console.error(err, builder.name));
    }
  }
};

const renameBankImages = async () => {
  const Bank = require("../../models/bank.model");
  const allBanks = await Bank.find({});
  console.log(`Total ${allBanks.length} banks`);
  for (const bank of allBanks) {
    if (bank.logo) {
      let old_logo = bank.logo.split(".");
      let new_img = ""
      if (old_logo[1] === 'JPG' || old_logo[1] === 'JPEG' || old_logo[1] === 'PNG'){
        new_img = old_logo[0] + ".webp";
      } else {
        new_img = bank.logo
      }
      console.log(old_logo, new_img);
      await Bank.findOneAndUpdate(
        { _id: bank._id },
        { $set: { logo: new_img } },
        { timestamps: false, new: true }
      )
        .then((doc) => (doc ? console.info("Updated") : console.error(null)))
        .catch((err) => console.error(err, bank.name));
    }
  }
};

const renameCityImages = async () => {
  const City = require("../../models/city.model");
  const allCities = await City.find({});
  console.log(`Total ${allCities.length} cities`);
  for (const city of allCities) {
    console.log(city.images.Cities.length);
    if (city.images.Cities) {
      let new_images = [];
      let new_banner_images = [];
      for (const logo of city.images.Cities) {
        let old_logo = logo.split(".");
        let new_img = ""
        if (old_logo[1] === 'JPG' || old_logo[1] === 'JPEG' || old_logo[1] === 'PNG'){
          new_img = old_logo[0] + ".webp";
        } else {
          new_img = logo
        }
        console.log(old_logo, new_img);
        new_images.push(new_img);
      }
      for (const logo of city.banner_image) {
        if (logo && logo !== 'Cities'){
          let old_logo = logo.split(".")
          let new_img = ''
          if (old_logo[1] === 'JPG' || old_logo[1] === 'JPEG' || old_logo[1] === 'PNG'){
            new_img = old_logo[0] + ".webp";
          } else {
            new_img = logo
          }
          new_banner_images.push(new_img)
        } else {
          new_banner_images.push(logo)
        }
      }
      console.log(new_images.length);
      console.log(new_images.length === city.images.Cities.length);
      if (new_images.length === city.images.Cities.length) {
        await City.findOneAndUpdate(
          { _id: city._id },
          { $set: { images: { Cities: new_images }, banner_image:new_banner_images } },
          { timestamps: false, new: true }
        )
          .then((doc) => (doc ? console.info("Updated") : console.error(null)))
          .catch((err) => console.error(err, city.name));
      } else {
        readline.question("Wait, what? this should not have happened..");
      }
    }
  }
};

const renameSubcityImages = async () => {
  const Subcity = require("../../models/subcity.model");
  const allSubcities = await Subcity.find({});
  console.log(`Total ${allSubcities.length} subcities`);
  for (const subcity of allSubcities) {
    console.log(subcity.images.Subcities.length);
    if (subcity.images.Subcities) {
      let new_images = [];
      for (const logo of subcity.images.Subcities) {
        let old_logo = logo.split(".");
        let new_img = ""
        if (old_logo[1] === 'JPG' || old_logo[1] === 'JPEG' || old_logo[1] === 'PNG'){
          new_img = old_logo[0] + ".webp";
        } else {
          new_img = logo
        }
        console.log(old_logo, new_img);
        new_images.push(new_img);
      }
      let new_banner_images = [];
      for (const logo of subcity.banner_image) {
        if (logo && logo !== 'Subcities'){
          let old_logo = logo.split(".")
          let new_img = ''
          if (old_logo[1] === 'JPG' || old_logo[1] === 'JPEG' || old_logo[1] === 'PNG'){
            new_img = old_logo[0] + ".webp";
          } else {
            new_img = logo
          }
          new_banner_images.push(new_img)
        } else {
          new_banner_images.push(logo)
        }
      }
      console.log(new_images.length);
      console.log(new_images.length === subcity.images.Subcities.length);
      if (new_images.length === subcity.images.Subcities.length) {
        await Subcity.findOneAndUpdate(
          { _id: subcity._id },
          { $set: { images: { Subcities: new_images }, banner_image:new_banner_images } },
          { timestamps: false, new: true }
        )
          .then((doc) => (doc ? console.info("Updated") : console.error(null)))
          .catch((err) => console.error(err, subcity.name));
      } else {
        readline.question("Wait, what? this should not have happened..");
      }
    }
  }
};

const renameDistrictImages = async () => {
  const District = require("../../models/district.model");
  const allDistricts = await District.find({});
  console.log(`Total ${allDistricts.length} districts`);
  for (const district of allDistricts) {
    console.log(district.images.Districts.length);
    if (district.images.Districts) {
      let new_images = [];
      for (const logo of district.images.Districts) {
        let old_logo = logo.split(".");
        let new_img = ""
        if (old_logo[1] === 'JPG' || old_logo[1] === 'JPEG' || old_logo[1] === 'PNG'){
          new_img = old_logo[0] + ".webp";
        } else {
          new_img = logo
        }
        console.log(old_logo, new_img);
        new_images.push(new_img);
      }
      let new_banner_images = [];
      for (const logo of district.banner_image) {
        if (logo && logo !== 'District'){
          let old_logo = logo.split(".")
          let new_img = ''
          if (old_logo[1] === 'JPG' || old_logo[1] === 'JPEG' || old_logo[1] === 'PNG'){
            new_img = old_logo[0] + ".webp";
          } else {
            new_img = logo
          }
          new_banner_images.push(new_img)
        } else {
          new_banner_images.push(logo)
        }
      }
      console.log(new_images.length);
      console.log(new_images.length === district.images.Districts.length);
      if (new_images.length === district.images.Districts.length) {
        await District.findOneAndUpdate(
          { _id: district._id },
          { $set: { images: { Districts: new_images } }, banner_image:new_banner_images },
          { timestamps: false, new: true }
        )
          .then((doc) => (doc ? console.info("Updated") : console.error(null)))
          .catch((err) => console.error(err, district.name));
      } else {
        readline.question("Wait, what? this should not have happened..");
      }
    }
  }
};

const renameStateImages = async () => {
  const State = require("../../models/state.model");
  const allStates = await State.find({});
  console.log(`Total ${allStates.length} states`);
  for (const state of allStates) {
    console.log(state.images.States.length);
    if (state.images.States) {
      let new_images = [];
      for (const logo of state.images.States) {
        let old_logo = logo.split(".");
        let new_img = ""
        if (old_logo[1] === 'JPG' || old_logo[1] === 'JPEG' || old_logo[1] === 'PNG'){
          new_img = old_logo[0] + ".webp";
        } else {
          new_img = logo
        }
        console.log(old_logo, new_img);
        new_images.push(new_img);
      }
      let new_banner_images = [];
      for (const logo of state.banner_image) {
        if (logo && logo !== 'States'){
          let old_logo = logo.split(".")
          let new_img = ''
          if (old_logo[1] === 'JPG' || old_logo[1] === 'JPEG' || old_logo[1] === 'PNG'){
            new_img = old_logo[0] + ".webp";
          } else {
            new_img = logo
          }
          new_banner_images.push(new_img)
        } else {
          new_banner_images.push(logo)
        }
      }
      console.log(new_images.length);
      console.log(new_images.length === state.images.States.length);
      if (new_images.length === state.images.States.length) {
        await State.findOneAndUpdate(
          { _id: state._id },
          { $set: { images: { States: new_images } }, banner_image:new_banner_images },
          { timestamps: false, new: true }
        )
          .then((doc) => (doc ? console.info("Updated") : console.error(null)))
          .catch((err) => console.error(err, state.name));
      } else {
        readline.question("Wait, what? this should not have happened..");
      }
    }
  }
};

const doStuff = async () => {
  do {
    console.log("**************************************");
    console.log("Update image names in:");
    console.log("******* 1. Project Database");
    console.log("******* 2. Property Database");
    console.log("******* 3. Authority Database");
    console.log("******* 4. Builder Database");
    console.log("******* 5. Bank Database");
    console.log("******* 6. City Database");
    console.log("******* 7. Subcity Database");
    console.log("******* 8. District Database");
    console.log("******* 9. State Database");
    console.log("******* 10. News Database");
    console.log("**************************************");
    let option = readline.question("Choose one of the above::::: ");
    console.log("**************************************");

    switch (option) {
      case "1": {
        console.info("You chose ", option);

        await renameProjectImages();
        break;
      }
      case "2": {
        console.info("You chose ", option);

        await renamePropertyImages();
        break;
      }
      case "3": {
        console.info("You chose ", option);

        await renameAuthorityImages();
        break;
      }
      case "4": {
        console.info("You chose ", option);

        await renameBuilderImages();
        break;
      }
      case "5": {
        console.info("You chose ", option);

        await renameBankImages();
        break;
      }
      case "6": {
        console.info("You chose ", option);

        await renameCityImages();
        break;
      }
      case "7": {
        console.info("You chose ", option);

        await renameSubcityImages();
        break;
      }
      case "8": {
        console.info("You chose ", option);

        await renameDistrictImages();
        break;
      }
      case "9": {
        console.info("You chose ", option);

        await renameStateImages();
        break;
      }
      case "10": {
        console.info("You chose ", option);

        await renameNewsImages();
        break;
      }
      default:
        console.log("Choose one of the above only");
        readline.question("OK? (press any key to continue)");
    }
  } while (true);
};

doStuff().then(() => {
  mongoose.connection.close();
  console.log(
    "***************************************************************************************************Connection closed"
  );
});
