var Cron = require("../routes/cron");
const mongoose = require("mongoose");

let uri = "mongodb://localhost:27017/realestate";

if (process.argv[2] === "--production" || process.argv[3] === "--production"){
  uri = "mongodb://realestate:rEAleStAtepWd91608102022@3.87.184.6:27017/realestate?authSource=realestate&w=1&tls=false"
  console.log("Using production database")
} else {
  console.log("using local database");
  console.log("Provide --production flag to use production db")
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
    "************************************************Database Connected to realestate"
  );
});

const selected = async () => {
  await Cron.totalProjectsInAuthority();
}

if (process.argv[2] === "--selected") {
  selected();
} else if (process.argv[2] === "--all") {
  setTimeout(() => {
    setTimeout(() => {
      Cron.totalProjectsInBank();
      setTimeout(() => {
        Cron.totalProjectsInBuilder();
        Cron.totalProjectsInAuthority();
        setTimeout(() => {
          Cron.updatePropertyTypeInBuilder();
          setTimeout(() => {
            Cron.updatePriceInProjects();
            Cron.updatePriceInAuthorities();
            setTimeout(() => {
              Cron.propertyTypesInAuthorities();
              setTimeout(() => {
                Cron.updateDataInTags();
                setTimeout(() => {
                  Cron.updateTotalProjectsInState();
                  Cron.updateTotalPropertiesInState();
                  setTimeout(() => {
                    Cron.updateTotalProjectsInDistrict();
                    Cron.updateTotalPropertiesInDistrict();
                    setTimeout(() => {
                      Cron.updateTotalProjectsInCity();
                      Cron.updateTotalPropertiesInCity();
                      setTimeout(() => {
                        Cron.updateTotalProjectsInSubCity();
                        Cron.updateTotalPropertiesInSubCity();
                        setTimeout(() => {
                          Cron.updatePriceInState();
                          setTimeout(() => {
                            Cron.updatePriceInDistrict();
                            setTimeout(() => {
                              Cron.updatePriceInCity();

                              setTimeout(() => {
                                Cron.updatePriceInSubcity();

                                setTimeout(() => {
                                  Cron.updatePriceInBuilders();
                                  setTimeout(() => {
                                    Cron.updateAreaOfPropertyInProjects();
                                    setTimeout(() => {
                                      Cron.propertyTypesInState();
                                      setTimeout(() => {
                                        Cron.propertyTypesInDistrict();
                                        setTimeout(() => {
                                          Cron.propertyTypesInCity();
                                          Cron.updateProjectDetailsInProjects();
                                          setTimeout(async () => {
                                            Cron.propertyTypesInSubCity();
                                            await Cron.updateSqFitCostInProperty();
                                            await Cron.updateSqFitCostOfPropertyInProject();
                                            await Cron.updateProjectStatusInAuthority();
                                            await Cron.updateTotalPropertiesInProject();
                                            await Cron.updateProjectStatusInBuilder();
                                            await Cron.addProjectUrlInProperty();
                                            console.log(
                                              "*********************************All jobs complete!*********************************"
                                            );
                                          }, 5000);
                                        }, 5000);
                                      }, 5000);
                                    }, 5000);
                                  }, 5000);
                                }, 5000);
                              }, 5000);
                            }, 5000);
                          }, 5000);
                        }, 5000);
                      }, 5000);
                    }, 5000);
                  }, 1000);
                }, 5000);
              }, 5000);
            }, 5000);
          }, 5000);
        }, 5000);
      }, 5000);
    }, 5000);
  }, 5000);
}
