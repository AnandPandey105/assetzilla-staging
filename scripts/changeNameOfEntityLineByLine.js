const readline = require("readline-sync");
const Properties = require("../models/property.model");
const mongoose = require("mongoose");

// let question = readline.question("Should I do it?");
// if (question === "y")
//     console.log("Done")

mongoose.connect(
  "mongodb://realestate:rEAleStAtepWd91608102022@3.87.184.6:27017/realestate?authSource=realestate&w=1&tls=false",
  {
    // mongoose.connect("mongodb://localhost:27017/realestate", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);
mongoose.connection.on(
  "error",
  console.error.bind(console, "connection error:")
);
mongoose.connection.once("open", () => {
  console.log(
    "***************************************************************************************************Database Connected"
  );
});

const changeName = async () => {
  // const requiredProperties = await Properties.find({
  //   name: { $regex: /.*Apartments in.*/, $options: "i" },
  // });
  const requiredProperties = await Properties.find({
    property_type: "Residential Plots",
  });
  // console.log(requiredProperties)
  console.log("Total : ", requiredProperties.length + " properties found.");
  console.log("Starting with first ....");
  let count = 1;

  //Apartments in
  // for (const property of requiredProperties) {
  //   count++;
  //   console.log("--------------------------------");
  //   console.log("Current name: ", property.name);
  //   let desiredNameInArray = property.name.split(" ");

  //   let indexOfAppartments = desiredNameInArray.indexOf("Apartments");

  //   desiredNameInArray[indexOfAppartments] = "Apartment";
  //   desiredName = desiredNameInArray.join(" ");

  //   console.log("Desired name: ", desiredName);

  //   let question = readline.question("Should I replace?[y/n] ");
  //   if (question.toLowerCase() === "y") {
  //     console.log("**Doing it..");
  //     await Properties.findOneAndUpdate(
  //       { url: property.url },
  //       { name: desiredName },
  //       { new: true, timestamps: false }
  //     )
  //       .then(async (doc)=>{
  //           console.log("New Name = ",doc.name, " | updated at = ", doc.updatedAt);
  //       })
  //       .catch((err)=>{
  //           console.log("**Sorry couldn't update because of the following error\n", err);
  //       });
  //   } else {
  //     console.log("**Ok, won't do");
  //     console.log("desiredNameInArray : ", desiredNameInArray);
  //     console.log("indexOfAppartments : ", indexOfAppartments);
  //   }
  //   console.log("--------------------------------", (requiredProperties.length - count), " left" );
  // }

  //Residential Plots or Villas or Serviced Apartments or Floors
  for (const property of requiredProperties) {
    count++;
    console.log("--------------------------------");
    console.log("Current name: ", property.name);
    console.log("bhk_space:    ", property.bhk_space);
    console.log("project:      ", property.project);

    let desiredName = property.bhk_space + " Residential Plot in " + property.project;
    console.log("desiredName:  ", desiredName);

    let question = readline.question("Should I replace?[y/n/r] ");
    if (question.toLowerCase() === "y") {
      console.log("**Doing it..");
      await Properties.findOneAndUpdate(
        { url: property.url },
        { name: desiredName },
        { new: true, timestamps: false }
      )
        .then(async (doc) => {
          console.log(
            "New Name = ",
            doc.name,
            " | updated at = ",
            doc.updatedAt
          );
        })
        .catch((err) => {
          console.log(
            "**Sorry couldn't update because of the following error\n",
            err
          );
        });
    } else if (question.toLowerCase() === "r") {
      console.log("**Doing it..");
      let desiredName = readline.question("Rewrite with: ");
      await Properties.findOneAndUpdate(
        { url: property.url },
        { name: desiredName },
        { new: true, timestamps: false }
      )
        .then(async (doc) => {
          console.log(
            "New Name = ",
            doc.name,
            " | updated at = ",
            doc.updatedAt
          );
        })
        .catch((err) => {
          console.log(
            "**Sorry couldn't update because of the following error\n",
            err
          );
        });
    } else {
      console.log("**Ok, skipping this ...");
    }
    console.log(
      "--------------------------------",
      requiredProperties.length - count,
      " left"
    );
  }
};

changeName().then(() => {
  mongoose.connection.close();
  console.log(
    "***************************************************************************************************Connection closed"
  );
});
