const Elastic = require("../classes/elasticsearch");
var elasticsearch = require("elasticsearch");
const axios = require("axios");
const mongoose = require("mongoose");
const Projects = require("../models/project.model");
elastic_client = new elasticsearch.Client({
  host: "localhost:9200",
});

mongoose.connect("mongodb://realestate:rEAleStAtepWd91608102022@3.87.184.6:27017/realestate?authSource=realestate&w=1&tls=false", {
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

const findCount = async () => {
  const searchCriteria = {
    _source: ["name", "url"],
    size:1000,
    sort: [],
    query: {
      bool: {
        must: [
          {
            term: {
              doc_type: {
                value: "project",
              },
            },
          },
        ],
        should: [{}],
      },
    },
  };

  console.log(
    "#########################################################################"
  );
  let elasticProjects = await axios.get("http://localhost:9200/assetzilla/entities/_search", {
    data: searchCriteria,
  });
  const dbProjects = await Projects.find({}).select({ name: 1, url: 1 });


  console.log(elasticProjects.data.hits.hits.length)
  console.log("================================================")
  console.log(dbProjects.length)

  elasticProjects = elasticProjects.data.hits.hits;

  const urlsInDb = [];
  for (const dbP of dbProjects){
    urlsInDb.push(dbP.url);
  }
  console.log(urlsInDb.length)

  const urlsInElas = [];
  for (const elP of elasticProjects){
    urlsInElas.push(elP._source.url)
  }
  for (const dbU of urlsInDb){
    const isUrlInDb = urlsInElas.includes(dbU);
    if (!isUrlInDb){
        console.log(dbU)
    } else {
        // console.log("present")
    }
  }
};

findCount().then((resp) => {
  realestateBuilders = resp;
  mongoose.connection.close();
  console.log(
    "************************************************Connection closed"
  );
});
