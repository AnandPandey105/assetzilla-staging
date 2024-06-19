const resultsArray = require("./csvjson");
const readline = require("readline-sync");
const mongoose = require("mongoose");
const fs = require("fs");
var moment = require("moment");
var clc = require("cli-color");
var elasticsearch = require("elasticsearch");
elastic_client = new elasticsearch.Client({
  host: "localhost:9200",
});
var Elastic = require("../classes/elasticsearch");
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
          "[" + moment(Date.now()).format("MMM Do | HH:mm A") + "]"
        ),
      ].concat(Array.from(arguments))
    );
  };
});

let uri = "mongodb://localhost:27017/realestateProductionFeb20";
if (process.argv[2] === "--production") {
  uri =
    "mongodb://realestate:rEAleStAtepWd91608102022@3.87.184.6:27017/realestate?authSource=realestate&w=1&tls=false";
  console.log("******************Using production db...");
} else if (process.argv[2] === "--staging") {
  uri = "mongodb://43.241.135.244:27020/realestate?tls=false";
  console.log("******************Using production db...");
} else {
  console.log(
    "******************Using localdb of feb20 production dump ..., you can give --production flag to use production db"
  );
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

console.log(resultsArray.length);

const doStuff = async () => {
  const newArray = [];
  for (const d of resultsArray) {
    let query = d.Page.split("/results?q=");
    console.log({query});
    if (query.length > 1) {
      query = query[1];
      if (query) {
        var data = {
          title: "Real Estate | Search " + query,
          query: query,
          results: { count: 0, results: {}, search_phrase: query },
        };
      } else {
        query = "";
        var data = {
          title: "Real Estate | Search ",
          results: { count: 0, results: {} },
        };
      }

      await Elastic.get_entities(query, "property", 6, [], {
        should: [],
        must: [{ term: { is_live: "2" } }],
      })
        .then(async (resp) => {
          data.results.count += resp.count;
          await Elastic.get_entities(query, "project", 6, [], {
            should: [],
            must: [{ term: { is_live: "2" } }],
          }).then(async (resp) => {
            data.results.count += resp.count;
            await Elastic.get_entities(query, "builder", 6, [], {
              should: [],
              must: [{ term: { is_live: "2" } }],
            }).then(async (resp) => {
              data.results.count += resp.count;
              await Elastic.get_entities(query, "location", 6, [], {
                should: [],
                must: [{ term: { is_live: "2" } }],
              }).then(async (resp) => {
                data.results.count += resp.count;
                await Elastic.get_entities(query, "authority", 6, [], {
                  should: [],
                  must: [{ term: { is_live: "2" } }],
                }).then(async (resp) => {
                  data.results.count += resp.count;
                  d.count = data.results.count;
                  newArray.push(d);
                });
              });
            });
          });
        })
        .catch((e) => {
          console.log(e);
        });
    } else {
      newArray.push(d)
    }
  }
  exportJson(newArray, "resultscount.json")
};

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

doStuff().then(() => {
  mongoose.connection.close();
  console.log(
    "***************************************************************************************************Connection closed"
  );
});
