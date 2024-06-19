require("dotenv").config();
const { NumberFormat } = require("intl");
const formatToIndianNumber = new NumberFormat("en-IN");
var express = require("express");
var partials = require("express-partials");
const bodyParser = require("body-parser");
const errorHandler = require("./_helpers/error-handler");
const mongoose = require("mongoose");
const NodeCron = require("node-cron");
const sendNewsletter = require("./classes/sendNewsletter");
// Session Managemnet
var redis = require("redis");
var session = require("express-session");
var redisStore = require("connect-redis")(session);
var redis_client = redis.createClient();
var moment = require("moment");
var fs = require("fs");
const { BASE_URL } = require("./classes/images");

var elasticsearch = require("elasticsearch");

elastic_client = new elasticsearch.Client({
  host: "localhost:9200",
});

const aws = require("aws-sdk");
multerS3 = require("multer-s3");
multer = require("multer");
aws.config.update({
  secretAccessKey: "tkklYz7xNRp+plXh1S4wedA8+q94hsY2ZB3BdjE8",
  accessKeyId: "AKIAXLIN4PPU6MFTVKEE",
});

s3 = new aws.S3();
// Logging
const winston = require("winston");
if (false && process.env.ENV === "prod") {
  // const t = require("winston-logstash-transport");
  // var winston_transport = [
  //   new winston.transports.File({
  //     filename: process.env.log_file,
  //     level: "error",
  //   }),
  //   new t.LogstashTransport({
  //     port: 5123,
  //     node_name: "real estate",
  //     host: "127.0.0.1",
  //   }),
  // ];
} else {
  var winston_transport = [new winston.transports.Console()];
  //custom local logging
  const moment = require("moment");
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
            "[" +
              moment(Date.now()).tz("Asia/Kolkata").format("MMM Do | HH:mm A") +
              "]"
          ),
        ].concat(Array.from(arguments))
      );
    };
  });
}
const logger = winston.createLogger({
  format: winston.format.json(),
  transports: winston_transport,
});
var DbConfig = require("./config/dbconfig");
var app = express();
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use(partials());
app.use(errorHandler);
app.use(bodyParser.urlencoded({ extended: false, limit: "50mb" }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(express.static(__dirname + "/static"));
app.use(
  session({
    secret: "asdqqwdasad#32!#",
    // create new redis store.
    store: new redisStore({
      host: "localhost",
      port: 6379,
      client: redis_client,
      ttl: 60*60*24*1, //7 days
    }),
    cookie:{
      secure: "auto",
      httpOnly: true,
      expires: 1000 * 60 *60 * 24 * 1,
    }, 
    saveUninitialized: false,
    resave: false,
  })
);

app.use(function(req, res, next) {
  res.locals.formatToIndianNumber = formatToIndianNumber;
  res.locals.CURRENT_IMAGE_BASE_URL = BASE_URL;
  next();
});

// const originalToLocaleString = Number.prototype.toLocaleString;
// Number.prototype.toLocaleString = (locale) => {
//   if (locale === 'en-IN'){
//     return formatToIndianNumber.format(this);
//   }
//   if (this)
//     return originalToLocaleString(this, locale);
// }

app.use(function (req, res, next) {
  let log_data = { timestamp: new Date() };
  log_data.url = req.url;
  if (Object.keys(req.query).length > 0) {
    log_data.query = req.query;
  }
  if (Object.keys(req.body).length > 0) {
    log_data.query = req.body;
  }
  if (req.session.user) {
    log_data.user = req.session.user.username;
  }
  logger.info("Website", log_data);
  res.locals.user = req.session.user;
  next();
});
require("./routes/api.route")(app, express);
require("./routes/web.route")(app, express);
require("./routes/news.route")(app, express);

var Cron = require("./routes/cron");
const { initiateBackup } = require("./classes/createDataBackupAndEmail");
const {
  sendNotificationToInterestedBuyers,
} = require("./classes/InterestedBuyers/sendNotificationToInterestedBuyers");

app.use(function (req, res, next) {
  res.status(404);

  // respond with html page
  if (req.accepts("html")) {
    res.redirect("/page-not-found");
    return;
  }

  if (req.accepts("json")) {
    res.send({ error: "Not found" });
    return;
  }
});

const PORT = process.env.PORT;

process.env.TZ = "Asia/Kolkata";
console.log(process.env.TZ);

DbConfig.connect();
mongoose.connection.on("connected", () => {
  // Cron.totalProjectsInAuthority()
  // Cron.updateProjectStatusInBuilder();
  // Cron.totalProjectsInBank()
  // Cron.totalProjectsInBuilder()
  // Cron.totalProjectsInAuthority()

  // Cron.updatePriceInProjects()
  // Cron.updatePriceInAuthorities()
  // Cron.propertyTypesInAuthorities()
  // Cron.updateDataInTags()
  // Cron.updateTotalProjectsInState();
  // Cron.updateTotalPropertiesInState();
  // Cron.updateTotalProjectsInDistrict()
  // Cron.updateTotalPropertiesInDistrict()
  // Cron.updateTotalProjectsInCity()
  // Cron.updateTotalPropertiesInCity()
  // Cron.updateTotalProjectsInSubCity()
  // Cron.updateTotalPropertiesInSubCity()
  // Cron.updatePriceInState();
  // Cron.updatePriceInDistrict()
  // Cron.updatePriceInDistrict()
  // Cron.updatePriceInCity()
  // Cron.updatePriceInSubcity();
  // Cron.updatePriceInBuilders();
  // Cron.updateAreaOfPropertyInProjects()
  // Cron.propertyTypesInState()
  // Cron.propertyTypesInDistrict()
  // Cron.propertyTypesInSubCity();
  // Cron.updateSqFitCostInProperty();
  // Cron.updateSqFitCostOfPropertyInProject();
  // Cron.updateProjectDetailsInProjects();
  // Cron.updatePropertyTypeInBuilder()
  // Cron.updateProjectStatusInAuthority()
  // Cron.cloneAllProperties()

  //9:00 AM
  NodeCron.schedule("0 0 9 * * *", function () {
    console.log(
      "########### Starting Cron Job for",
      moment(Date.now()).format("DD MMMM YYYY | h:mm:ss A"),
      "###########"
    );
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
                                              await Cron.updateTotalPropertiesInProject();
                                              await Cron.totalProjectsInAuthority();
                                              await Cron.updateProjectStatusInBuilder();
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
  });
});
//0 0 11 * * SUN
NodeCron.schedule(
  "0 0 11 * * SUN",
  async () => {
    if (process.env.STAGING === "false") {
      await sendNewsletter();
    } else {
      console.log(
        "Skipping Newsletter sending, because I am running on the staging server"
      );
    }
  },
  {
    scheduled: true,
    timezone: "Asia/Kolkata",
  }
);

NodeCron.schedule(
  "0 30 0 * * * *",
  async function () {
    if (process.env.STAGING === "false") {
      await initiateBackup();
    } else {
      console.log(
        "Skipping Database backup, because I am running on the staging server"
      );
    }
  },
  {
    scheduled: true,
    timezone: "Asia/Kolkata",
  }
);

//9:30 AM
NodeCron.schedule(
  "0 30 9 * * *",
  async () => {
    if (process.env.STAGING === "false") {
      await sendNotificationToInterestedBuyers();
    } else {
      console.log(
        "Skipping sendNotificationToInterestedBuyers, because I am running on the staging server"
      );
    }
  },
  {
    scheduled: true,
    timezone: "Asia/Kolkata",
  }
);
app.get('/pdf-viewer', (req, res) => {
  const fileName = req.query.fileName;
  const filePath = path.join(__dirname, fileName);

  // Ensure the file exists before rendering the view
  if (!fileName || !require('fs').existsSync(filePath)) {
    return res.status(404).send('File not found');
  }

  res.render('pdf-viewer', {
    url: `/pdf?fileName=${fileName}`
  });
});
app.listen(PORT, () => {
  console.log("Server up and running on " + PORT);
});