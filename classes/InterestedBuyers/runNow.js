const mongoose = require("mongoose");

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
var elasticsearch = require("elasticsearch");

elastic_client = new elasticsearch.Client({
  host: "localhost:9200",
});

const {sendNotificationToInterestedBuyers} = require("./sendNotificationToInterestedBuyers");

sendNotificationToInterestedBuyers().then((resp) => {
  mongoose.connection.close();
  console.log(
    "************************************************Connection closed"
  );
});
