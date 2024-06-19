var http = require("http");
var axios = require("axios");

var process_output = function (data) {
  data = data.hits.hits;
  result = [];
  data.forEach((element) => {
    element._source._id = element._id;
    result.push(element._source);
  });
  return result;
};

var query_typeahead = async function (query, must = []) {
  query = query.toLowerCase();
  let must_query = must;
  let should_query = [];
  should_query.push({
    multi_match: {
      fields: ["name"],
      query: query,
      type: "phrase_prefix",
      boost: 10,
    },
  });
  query_list = query.split(/[.\-_\s]/);
  must_query.push({ term: { unique: 1 } });
  query_list.forEach((word) => {
    must_query.push({
      regexp: {
        name: {
          value: "@" + word + "@",
          boost: 5,
        },
      },
    });
  });
  let response = await elastic_client.search({
    index: "assetzilla",
    _source: ["name", "doc_type", "url", "location_type", "property_type"],
    type: "entities",
    size: "5",
    body: {
      query: {
        bool: {
          must: must_query,
          should: should_query,
        },
      },
    },
  });
  response = process_output(response);
  return response;
};

var get_entity_url = async function (url) {
  let search_query = {
    query: {
      bool: {
        must: [
          {
            match_phrase: {
              url: url,
            },
          },
        ],
        should: [{}],
      },
    },
  };

  let returnObj = {};
  let options = {
    url: "http://localhost:9200/assetzilla/entities/_search",
    method: "GET",
    data: JSON.stringify({
      query: search_query.query,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    maxContentLength: 100000000,
    maxBodyLength: 1000000000,
  };
  await axios(options)
    .then((doc) => {
      if (doc.data.hits && doc.data.hits.hits) {
        if (doc.data.hits.hits.length === 1) {
          console.log("Found!");
          returnObj = {
            success: true,
            data: doc.data.hits.hits[0]._source,
          };
        } else if (doc.data.hits.hits.length === 0) {
          console.log("This url does not exist in elasticsearch", url);
          returnObj = {
            success: false,
            msg: "This url does not exist",
          };
        } else {
          console.log("More than 1 result was returned for this url", url);
          returnObj = {
            success: true,
            data: doc.data.hits.hits[0]._source,
          };
        }
      }
    })
    .catch((err) => {
      console.log(`error while getting data for the url: ${url}`, err);
      returnObj = {
        success: false,
        msg: "Error",
      };
    });
  return returnObj;
};

var get_entities = async function (
  query,
  entity,
  size,
  source,
  custom_filters = { should: [], must: [] },
  skip = 0,
  custom_sort = []
) {
  query = query.toLowerCase();
  if (!Array.isArray(custom_sort)) {
    custom_sort = [custom_sort];
  }
  custom_sort.push({
    project_status: {
      order: "asc",
    },
  });
  // console.log("query -", JSON.stringify(query));
  let must_query = custom_filters.must;
  let should_query = custom_filters.should;
  // console.log(source, "<================");
  if (query.length > 0) {
    query_list = query.split(/[.\-_\s]/);
    query_list.forEach((word) => {
      should_query.push({
        multi_match: {
          fields: ["name"],
          query: query,
          type: "best_fields",
          fuzziness: "AUTO",
          prefix_length: 2,
          boost: 10,
        },
      });

      must_query.push({
        regexp: {
          name: {
            value: "@" + word + "@",
            boost: 5,
          },
        },
      });
    });
  }
  must_query.push({ term: { doc_type: entity } });
  // console.log("must query is", JSON.stringify(must_query));
  // console.log("should_query query is", should_query);
  let body = {
    size: size,
    from: size * skip,
    sort: custom_sort,
    query: {
      bool: {
        must: must_query,
        should: should_query,
      },
    },
  };
  let response = await elastic_client.search({
    index: "assetzilla",
    _source: source,
    type: "entities",
    body: body,
  });
  response = process_output(response);

  let count = await elastic_client.count({
    index: "assetzilla",
    type: "entities",
    body: {
      query: {
        bool: {
          must: must_query,
        },
      },
    },
  });

  return { count: count.count, search_phrase: query, results: response };
};

var get_entities_results_page = async function (
  query,
  entity,
  size,
  source,
  custom_filters = { should: [], must: [] },
  skip = 0,
  custom_sort = []
) {
  query = query.toLowerCase();
  // console.log("query -", JSON.stringify(query));
  let must_query = custom_filters.must;
  let should_query = custom_filters.should;
  // console.log(source, "<================");
  if (query.length > 0) {
    query_list = query.split(/[.\-_\s]/);
    should_query.push({
      multi_match: {
        fields: ["name"],
        query: query,
        type: "best_fields",
        boost: 10,
      },
    });
    // query_list.forEach((word) => {
    //   // must_query.push({
    //   //   regexp: {
    //   //     name: {
    //   //       value: "@" + word + "@",
    //   //       boost: 5,
    //   //     },
    //   //   },
    //   // });
    // });
    must_query.push({
      match: {
        name: {
          query: query,
          operator: "or",
          fuzziness: "AUTO",
          prefix_length: 0,
          boost: 10,
        },
      },
    });
  }
  must_query.push({ term: { doc_type: entity } });
  // console.log("must query is", JSON.stringify(must_query));
  // console.log("should_query query is", should_query);
  let body = {
    index: "assetzilla",
    _source: source,
    type: "entities",
    body: {
      size: size,
      from: size * skip,
      sort: custom_sort,
      query: {
        bool: {
          must: must_query,
          should: should_query,
        },
      },
    },
  };
  let response = await elastic_client.search(body);
  response = process_output(response);

  let count = await elastic_client.count({
    index: "assetzilla",
    type: "entities",
    body: {
      query: {
        bool: {
          must: must_query,
        },
      },
    },
  });

  return { count: count.count, search_phrase: query, results: response };
};

var get_entities_count_filter = async function (
  query,
  entity,
  custom_filters = { should: [], must: [] }
) {
  query = query.toLowerCase();
  // console.log('get_entities_count_filter query -', JSON.stringify(query));
  let must_query = custom_filters.must;
  let should_query = custom_filters.should;
  if (query.length > 0) {
    query_list = query.split(/[.\-_\s]/);
    query_list.forEach((word) => {
      should_query.push({
        multi_match: {
          fields: ["name"],
          query: query,
          type: "best_fields",
          fuzziness: "AUTO",
          prefix_length: 2,
          boost: 10,
        },
      });

      must_query.push({
        regexp: {
          name: {
            value: "@" + word + "@",
            boost: 5,
          },
        },
      });
    });
  }
  must_query.push({ term: { doc_type: entity } });
  // console.log('must query is', JSON.stringify(must_query))
  // console.log('should_query query is', should_query)

  let x = {
    index: "assetzilla",
    type: "entities",
    body: {
      query: {
        bool: {
          must: must_query,
        },
      },
    },
  };
  let count = await elastic_client.count(x);

  return count.count;
};

var delete_entity = async function (query) {
  let q = {
    query: query,
    conflicts: "proceed",
  };
  // var options = {
  //   host: "localhost",
  //   port: 9200,
  //   path: "/assetzilla/_delete_by_query",
  //   method: "POST",
  // };
  // console.log(q);
  let returnObject = {};
  await axios
    .post("http://localhost:9200/assetzilla/_delete_by_query", q)
    .then(async (doc) => {
      if (doc.data.deleted > 0) {
        console.log("Delete successfull in elasticsearch for ", query);
        returnObject = { success: true };
      } else {
        console.log("Delete un-successfull in elasticsearch for ", query);
        returnObject = { success: false };
      }
    })
    .catch((error) => {
      console.log(
        "Error while deleting an entity in elasticsearch for ",
        query,
        " : ",
        error
      );
      returnObject = { success: false };
    });

  // var req = http.request(options, async function (res) {
  //   await res.setEncoding("utf8");
  //   await res.on("data", function (chunk) {
  //     console.log("BODY: " + chunk);
  //   });
  // });

  // await req.on("error", function (e) {
  //   console.log("problem with request: " + e.message);
  // });

  // // write data to request body
  // await req.write(JSON.stringify(q));
  // await req.end();
  return returnObject;
};

var get_entity_bookmark = async function (bookmark) {
  let q = {
    query: "",
  };
  try {
    let response =
      bookmark && bookmark.url
        ? await elastic_client.search({
          index: "assetzilla",
          type: "entities",
          body: {
            query: {
              match_phrase: {
                url: bookmark.url,
              },
            },
          },
        })
        : { hits: { hits: [{}] } };

    let responseObj = {};
    if (response.hits && response.hits.hits && response.hits.hits.length > 0) {
      responseObj = { success: true, resp: response.hits.hits[0]._source };
    } else {
      throw new Error("Old url probably");
    }

    return responseObj;
  } catch (err) {
    console.log(err);
  }
};

var delete_entity_promise = async function (query) {
  var options = {
    url: "http://localhost:9200/assetzilla/_delete_by_query",
    method: "POST",
    data: JSON.stringify({
      query: query,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    maxContentLength: 100000000,
    maxBodyLength: 1000000000,
  };

  return axios(options);
};

var create_entitiy = async function (doc) {
  // var options = {
  //   host: "localhost",
  //   port: 9200,
  //   path: "/assetzilla/entities",
  //   method: "POST",
  // };

  // console.log(doc);
  let returnObject = { success: true };
  let obj = {
    method: "post",
    url: "http://localhost:9200/assetzilla/entities",
    data: doc,
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    maxContentLength: 100000000,
    maxBodyLength: 1000000000,
  };

  await axios(obj)
    .then((response) => {
      console.log("Create entity successful in elasticsearch for ", doc.url);
      returnObject = { success: true };
    })
    .catch((e) => {
      console.log(
        "Error while creating new entity in elasticsearch for ",
        doc.url,
        " : ",
        e
      );
      returnObject = { success: false };
    });
  // var req = await http.request(options, async function (res) {
  //   await res.setEncoding("utf8");
  //   await res.on("data", async function (chunk) {
  //     console.log("BODY: " + chunk);
  //   });
  // });

  // await req.on("error", function (e) {
  //   console.log("problem with request: " + e.message);
  // });

  // // write data to request body
  // await req.write(JSON.stringify(doc));
  // await req.end();
  // return { success: true };
  return returnObject;
};

var create_entitiy_promise = async function (doc) {
  var options = {
    url: "http://localhost:9200/assetzilla/entities",
    method: "POST",
    data: JSON.stringify(doc),
    headers: {
      "Content-Type": "application/json",
    },
    maxContentLength: 100000000,
    maxBodyLength: 1000000000,
  };

  return axios(options);

  // var options = {
  //     host: 'localhost',
  //     port: 9200,
  //     path: '',
  //     method: 'POST'
  // };

  // var req = await http.request(options, async function (res) {
  //     await res.setEncoding('utf8');
  //     await res.on('data',async function (chunk) {
  //         console.log('BODY: ' + chunk);
  //     });
  // });

  // await req.on('error', function (e) {
  //     console.log('problem with request: ' + e.message);
  // });

  // // write data to request body
  // await req.write(JSON.stringify(doc));
  // await req.end();
  // return { success: true }
};

var get_location_details = async function (doc) {
  let must_query = [{ term: { doc_type: "location" } }];
  let should_query = [];
  if (doc.subcity && doc.city && doc.state) {
    should_query.push({
      bool: {
        must: [
          { term: { location_type: "subcity" } },
          { match_phrase: { name: doc.subcity } },
          { match_phrase: { city: doc.city } },
          { match_phrase: { state: doc.state } },
        ],
      },
    });
  }
  if (doc.city && doc.state) {
    should_query.push({
      bool: {
        must: [
          { term: { location_type: "city" } },
          { match_phrase: { name: doc.city } },
          { match_phrase: { state: doc.state } },
        ],
      },
    });
  }
  if (doc.district && doc.state) {
    should_query.push({
      bool: {
        must: [
          { term: { location_type: "district" } },
          { match_phrase: { name: doc.district } },
          { match_phrase: { state: doc.state } },
        ],
      },
    });
  }
  if (doc.state) {
    should_query.push({
      bool: {
        must: [
          { term: { location_type: "state" } },
          { match_phrase: { name: doc.state } },
        ],
      },
    });
  }

  if (should_query.length < 1) {
    return {};
  }
  must_query.push({ bool: { should: should_query } });
  let response = await elastic_client.search({
    index: "assetzilla",
    _source: ["name", "url", "location_type"],
    type: "entities",
    body: {
      query: {
        bool: {
          must: must_query,
        },
      },
    },
  });
  response = process_output(response);
  let data = {};
  response.forEach((element) => {
    if (
      doc.city == element.name ||
      doc.subcity == element.name ||
      doc.district == element.name ||
      doc.state == element.name
    ) {
      data[element.location_type] = { name: element.name, url: element.url };
    }
  });

  return data;
};

var get_non_bhk_bhk_space = async function () {
  let data = {
    index: "assetzilla",
    size: 0,
    type: "entities",
    body: {
      "query": {
        "bool": {
          "must_not": [
            {
              "terms": {
                "bhk_space": ["1 BHK", "2 BHK", "3 BHK", "4 BHK", "5 BHK", "6 BHK", "7 BHK", "8 BHK", "9 BHK", "10 BHK"]
              }
            }
          ]
        }
      },
      "aggs": {
        "unique_bhk_space": {
          "terms": {
            "field": "bhk_space",
            "size": 10000
          }
        }
      }
    }
  }

  let toSend = [];
  try {
    let response = await elastic_client.search(data);
    // console.info(data.body.query);
    toSend = response.aggregations.unique_bhk_space.buckets;
  } catch (err) {
    console.log("get_non_bhk_bhk_space error: "+err);
  }
  return toSend;
}

var get_top_entities = async function (
  must_query = [],
  field,
  sortby = {},
  _size = 20
) {
  let data = {
    index: "assetzilla",
    size: _size,
    type: "entities",
    body: {
      query: {
        bool: {
          must: must_query,
        },
      },
      aggs: {
        agg_values: {
          terms: { field: field, size: _size },
        },
      },
      sort: sortby,
    },
  };
  let response = await elastic_client.search(data);
  console.info(data.body.query);
  response = response.aggregations.agg_values.buckets;

  return response;
};

var get_entities_count = async function (entity, filter = {}, field = []) {
  var data = {};
  for (var i = 0; i < field.length; i++) {
    data[field[i]] = {};
    data[field[i]].terms = {};
    data[field[i]].terms.field = {};
    data[field[i]].terms.field = field[i];
  }

  //old body
  // {
  //   query: {
  //     bool: {
  //       must: filter,
  //     },
  //   },
  //   aggs: {
  //     agg_values: data,
  //   },
  let response = await elastic_client.search({
    index: "assetzilla",
    type: "entities",
    size: 0,
    body: {
      query: {
        bool: {
          must: filter,
        },
      },
    },
  });
  // response = response.aggregations.agg_values.buckets;

  return response;
};

var update_entity_promise = async function (query, update) {
  var options = {
    url: "http://localhost:9200/assetzilla/_update_by_query",
    method: "POST",
    data: JSON.stringify({
      query: query,
      script: update,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    maxContentLength: 100000000,
    maxBodyLength: 1000000000,
  };
  return axios(options);
};

// const addTotalPropertiesProjects = async () => {
//   await elastic_client
//     .search({
//       size: 10,
//       index: "assetzilla",
//       _source: ["name", "url", "is_live", "total_properties", "id"],
//       type: "entities",
//       body: {
//         query: {
//           bool: {
//             must: [
//               { term: { doc_type: "project" } },
//               { term: { is_live: "2" } },
//             ],
//             should: {},
//           },
//         },
//       },
//     })
//     .then(async (response) => {
//       console.log("response = response", response);
//       let allProjects = process_output(response);
//       await allProjects.map(async (currentProject) => {
//         let propertiesOfCurrentProject = await elastic_client.search({
//           size: 10,
//           index: "assetzilla",
//           _source: ["project_url"],
//           type: "entities",
//           body: {
//             query: {
//               bool: {
//                 must: [
//                   { term: { doc_type: "property" } },
//                   { term: { is_live: "2" } },
//                   { match_phrase: { project_url: currentProject.url } },
//                 ],
//                 should: {},
//               },
//             },
//           },
//         });

//         if (propertiesOfCurrentProject.hits.total > 0) {
//           currentProject.total_properties =
//             propertiesOfCurrentProject.hits.total;
//           console.log(
//             "totalProperties = ",
//             propertiesOfCurrentProject.hits.total
//           );
//           // console.table(currentProject);
//           const q = {
//             bool: {
//               must: [
//                 { term: { doc_type: "property" } },
//                 { term: { is_live: "2" } },
//                 { match_phrase: { project_url: currentProject.url } },
//               ],
//               should: {},
//             },
//           };
//           const s = {
//             inline: `ctx._source.total_properties = '${propertiesOfCurrentProject.hits.total}'`,
//           };
//           const x = await update_entity_promise(q, s).then((response) => {
//             console.log("_)_)_)_)_)_)_)_)_)_)", response.data);
//             console.table(allProjects);
//           });
//         }
//       });
//       console.log("\nAll Projects");
//       console.table(allProjects);
//     });

//   // let allProperties = await elastic_client.search({
//   //   size: 10000,
//   //   index: "assetzilla",
//   //   _source: ["name", "url", "is_live", "project_url", "id"],
//   //   type: "entities",
//   //   body: {
//   //     query: {
//   //       bool: {
//   //         must: [
//   //           { term: { doc_type: "property" } },
//   //           { term: { is_live: "2" } },
//   //         ],
//   //         should: {},
//   //       },
//   //     },
//   //   },
//   // });
//   // allProperties = process_output(allProperties);

//   // console.log("\nAll Properties");
//   // console.table(allProperties);
// };

// addTotalPropertiesProjects();

var getPossibleProjectUnitSizes = async () => {
  let body = {
    size: 12,
    _source: ["details"],
    sort: [
      {
        total_properties: {
          order: "desc",
        },
      },
    ],
    query: {
      bool: {
        must: [
          {
            bool: {
              should: [],
            },
          },
          {
            term: {
              is_live: {
                value: "2",
              },
            },
          },
          {
            term: {
              doc_type: {
                value: "project",
              },
            },
          },
        ],
      },
    },
    aggs: {
      distinct_unit_sizes: {
        terms: {
          field: "details.unit_size",
          size: 1000,
        },
      },
    },
  };

  let options = {
    url: "http://localhost:9200/assetzilla/entities/_search",
    method: "GET",
    data: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
  };

  let returnObj = {};
  try {
    let result = await axios(options);
    console.log(result);
    if (
      result.status === 200 &&
      result.data &&
      result.data.aggregations &&
      result.data.aggregations.distinct_unit_sizes &&
      result.data.aggregations.distinct_unit_sizes.buckets
    ) {
      let buckets = result.data.aggregations.distinct_unit_sizes.buckets;
      buckets = buckets.map((bucket) => bucket.key);
      returnObj = buckets;
    }
  } catch (e) {
    returnObj = [];
  }
  return returnObj;
};

module.exports = {
  query_typeahead,
  get_entities,
  get_entities_results_page,
  create_entitiy,
  get_location_details,
  get_top_entities,
  delete_entity,
  get_entity_bookmark,
  get_entities_count,
  delete_entity_promise,
  create_entitiy_promise,
  get_entities_count_filter,
  update_entity_promise,
  get_entity_url,
  getPossibleProjectUnitSizes,
  get_non_bhk_bhk_space
};
