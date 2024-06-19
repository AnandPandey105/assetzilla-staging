const mongoose = require("mongoose");
const Elastic = require("./elasticsearch");
var elasticsearch = require("elasticsearch");

elastic_client = new elasticsearch.Client({
  host: "localhost:9200",
});

mongoose.connect("mongodb://localhost:27017/realestate", {
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

const sendNewsletter = require("./sendNewsletter");

const run = async () => {
  await sendNewsletter().then(() => {
    mongoose.connection.close();
    console.log(
      "************************************************Connection closed"
    );
  });
};

run();