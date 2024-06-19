const readline = require("readline-sync");
const mongoose = require("mongoose");
const fs = require("fs");
var moment = require("moment-timezone");
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

const Elastic = require("../classes/elasticsearch");
var elasticsearch = require("elasticsearch");

elastic_client = new elasticsearch.Client({
  host: "localhost:9200",
});

const doStuff = async () => {
  const Customer = require("../models/customer.model");
  const all = await Customer.find({});

  let resultSearches = [];

  for (let one of all) {
    if (one.searchHistory && one.searchHistory.length > 0) {
      for (let thisSearch of one.searchHistory) {
        if (thisSearch.url.includes("/results")) {
          resultSearches.push({
            url: thisSearch.url,
            date: moment(thisSearch.date).tz('Asia/Kolkata').format("MMM Do | HH:mm"),
            resultsCount: await getResultsCount(thisSearch.url),
          });
        }
      }
    }
  }

  resultSearches = resultSearches.map((rs) => {
    rs.occurrences = resultSearches.filter((f) => f.url === rs.url).length;
    return rs;
  });

  resultSearches.sort((a, b) => (a.url > b.url ? 1 : -1));

  exportJson(resultSearches, "aggregateSearchHistory.json");
};

const getResultsCount = async (url) => {
  let returnObj = {};
  let query = url.split("q=")[1];
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
  }).then(async (resp) => {
    data.results.count += resp.count;
    await Elastic.get_entities(query, "project", 6, [], {
      should: [],
      must: [{ term: { is_live: "2" } }],
    }).then(async (resp) => {
      data.results.count += resp.count;
      await Elastic.get_entities(query, "builder", 6, [], {
        should: [],
        must: [{ term: { is_live: "2" } }],
      }).then(async(resp) => {
        data.results.count += resp.count;
        await Elastic.get_entities(query, "location", 6, [], {
          should: [],
          must: [{ term: { is_live: "2" } }],
        }).then(async(resp) => {
          data.results.count += resp.count;
          await Elastic.get_entities(query, "authority", 6, [], {
            should: [],
            must: [{ term: { is_live: "2" } }],
          }).then(async(resp) => {
            data.results.count += resp.count;

            data.hasOtherPage = true;
            data.screenName = "Results";
            data.rootPath = process.cwd() + "/views/";
            returnObj = data;
          });
        });
      });
    });
  });

  return returnObj.results.count;
};

doStuff().then(() => {
  mongoose.connection.close();
  console.log(
    "***************************************************************************************************Connection closed"
  );
});

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
