const axios = require("axios");
var Elastic = require("./elasticsearch");
var Filters = require("./filters");
var location_matches = ["subcity", "city", "district", "state"];
var not_same = function (docs, id) {
  let result = [];
  docs.forEach((element) => {
    if (element.id != id) {
      result.push(element);
    }
  });
  return result;
};
var location = {
  project: async function (field, name) {
    let q = {
      should: [{ exists: { field: "location" } }],
      must: [{ match_phrase: { [field]: name } }, { term: { is_live: "2" } }],
    };
    let sort = Filters.project_sort("total_properties_reverse");
    let resp = await Elastic.get_entities(
      "",
      "project",
      10,
      [
        "banner_image",
        "name",
        "url",
        "location",
        "total_properties",
        "price",
        "state",
        "district",
        "city",
        "subcity",
      ],
      q,
      0,
      sort
    );
    return resp.results;
  },
  builder: async function (field, name) {
    let s = await findBuildersWithProjectsInSameField(field, name);
    let buildersToSend = [];
    if (s.length > 0) {
      for (const builder of s) {
        let q = {
          should: [],
          must: [{ match_phrase: { name: builder.key } }, { term: { is_live: "2" } }],
        };
        let builderData = await Elastic.get_entities(
          "",
          "builder",
          10,
          [
            "logo",
            "name",
            "url",
            "location",
            "total_properties",
            "price",
            "total_projects",
            "state",
            "district",
            "city",
            "subcity",
          ],
          q,
          0
        );
        if (builderData && builderData.results && builderData.results[0]) {
          builderData.results[0].total_projects = builder.doc_count;
          if (builderData.results[0].price){
            builderData.results[0].price['min'] = await findMinimumBuilderPrice(field, name, builder);
          }
          buildersToSend.push(builderData.results[0]);
        }
      }

      buildersToSend.sort((a, b) =>
        a.total_projects < b.total_projects ? 1 : -1
      );
      // buildersToSend = buildersToSend.filter((a) => a.price && a.price.min);
      if (buildersToSend.length > 10) {
        while (buildersToSend.length > 10) {
          buildersToSend.pop();
        }
      }
      return buildersToSend;
    } else {
      return [];
    }
    // let q = {
    //   should: [],
    //   must: [{ match_phrase: { [field]: name } }],
    // };
    // let sort = Filters.project_sort("total_projects_reverse");
    // let resp = await Elastic.get_entities(
    //   "",
    //   "builder",
    //   5,
    //   [
    //     "logo",
    //     "name",
    //     "url",
    //     "location",
    //     "total_properties",
    //     "price",
    //     "total_projects",
    //     "state",
    //     "district",
    //     "city",
    //     "subcity",
    //   ],
    //   q,
    //   0,
    //   sort
    // );
    // return resp.results;
  },
};
var property = {
  by_location: async function (doc) {
    should_query = [];
    location_matches.forEach((key) => {
      if (key in doc) {
        should_query.push({ match_phrase: { [key]: doc[key] } });
      }
    });
    let must_query = [
      { match_phrase: { property_type: doc.property_type } },
      { term: { is_live: "2" } },
    ];
    let q = {
      // should: should_query,
      must: [...must_query, ...should_query],
    };
    let sort = Filters.property_sort();
    let resp = await Elastic.get_entities(
      "",
      "property",
      15,
      [
        "banner_image",
        "name",
        "url",
        "id",
        "images",
        "price",
        "property_type",
        "price",
        "city",
        "district",
        "state",
        "subcity",
      ],
      q,
      0,
      sort
    );
    // resp.results.sort((a, b) => (a.price.price < b.price.price ? -1 : 1));
    resp.results = not_same(resp.results, doc.id);
    let i = 0;
    while (resp.results.length < 10 && i < 4) {
      if (
        // q.should.filter((a) => a.match_phrase[location_matches[i]]).length > 0
        should_query.filter((a) => a.match_phrase[location_matches[i]]).length >
        0
      ) {
        should_query = should_query.filter(
          (a) => !a.match_phrase[location_matches[i]]
        );
        q = { must: [...must_query, ...should_query] };
        let r = await Elastic.get_entities(
          "",
          "property",
          30,
          [
            "banner_image",
            "name",
            "url",
            "id",
            "images",
            "price",
            "property_type",
            "price",
            "city",
            "district",
            "state",
            "subcity",
          ],
          q,
          0,
          sort
        );
        // r.results.sort((a, b) => (a.price.price < b.price.price ? -1 : 1));
        r.results = not_same(r.results, doc.id);
        for (const a of r.results) {
          if (resp.results.filter((b) => b._id === a._id).length === 0) {
            resp.results.push(a);
          }
        }
      }
      i++;
    }
    while (resp.results.length > 10) {
      resp.results.pop();
    }

    return not_same(resp.results, doc.id);
  },
  by_builder: async function (name, property_type, id) {
    let q = {
      should: [
        { exists: { field: "location" } },
        { match_phrase: { property_type: property_type } },
      ],
      must: [
        { match_phrase: { builder: name } },
        { term: { is_live: "2" } },
        { match_phrase: { property_type: property_type } },
      ],
    };
    let sort = Filters.property_sort();
    let resp = await Elastic.get_entities(
      "",
      "property",
      15,
      [
        "banner_image",
        "builder",
        "name",
        "url",
        "id",
        "images",
        "price",
        "location",
        "property_type",
      ],
      q,
      0,
      sort
    );

    resp.results = not_same(resp.results, id);
    while (resp.results.length > 10) {
      resp.results.pop();
    }
    return not_same(resp.results, id);
  },
};
var project = {
  by_location: async function (doc) {
    should_query = [];
    location_matches.forEach((key) => {
      if (key in doc) {
        should_query.push({ match_phrase: { [key]: doc[key] } });
      }
    });
    let must_query = [
      { match_phrase: { property_type: doc.property_type } },
      { term: { is_live: "2" } },
    ];
    let q = {
      // should: should_query,
      must: [...must_query, ...should_query],
    };
    let sort = Filters.project_sort();
    let resp = await Elastic.get_entities(
      "",
      "project",
      15,
      [
        "banner_image",
        "name",
        "url",
        "id",
        "price",
        "property_type",
        "price",
        "city",
        "district",
        "state",
        "subcity",
      ],
      q,
      0,
      sort
    );
    // resp.results.sort((a, b) => (a.price.min < b.price.min ? -1 : 1));
    resp.results = not_same(resp.results, doc.id);
    let i = 0;
    while (resp.results.length < 10 && i < 4) {
      if (
        // q.should.filter((a) => a.match_phrase[location_matches[i]]).length > 0
        should_query.filter((a) => a.match_phrase[location_matches[i]]).length >
        0
      ) {
        should_query = should_query.filter(
          (a) => !a.match_phrase[location_matches[i]]
        );
        q = { must: [...must_query, ...should_query] };
        let r = await Elastic.get_entities(
          "",
          "project",
          30,
          [
            "banner_image",
            "name",
            "url",
            "id",
            "price",
            "property_type",
            "price",
            "city",
            "district",
            "state",
            "subcity",
          ],
          q,
          0,
          sort
        );
        // r.results.sort((a, b) => (a.price.min < b.price.min ? -1 : 1));
        r.results = not_same(r.results, doc.id);
        for (const a of r.results) {
          if (resp.results.filter((b) => b._id === a._id).length === 0) {
            resp.results.push(a);
          }
        }
      }
      i++;
    }
    return not_same(resp.results, doc.id);
  },
  by_builder: async function (name, property_type, id) {
    let q = {
      should: [
        { exists: { field: "location" } },
        { match_phrase: { property_type: property_type } },
      ],
      must: [
        { match_phrase: { builder: name } },
        { term: { is_live: "2" } },
        { match_phrase: { property_type: property_type } },
      ],
    };
    let sort = Filters.project_sort();
    let resp = await Elastic.get_entities(
      "",
      "project",
      15,
      [
        "banner_image",
        "name",
        "url",
        "id",
        "property_type",
        "price",
        "location",
        "builder",
        "is_live",
      ],
      q,
      0,
      sort
    );
    resp.results = not_same(resp.results, id);
    while (resp.results.length > 10) {
      resp.results.pop();
    }
    return not_same(resp.results, id);
  },
};

const findBuildersWithProjectsInSameField = async (field, name) => {
  try {
    let required_query = {};
    required_query["term"] = {};
    required_query.term[field] = name;

    let q = {
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
            {
              term: {
                is_live: {
                  value: "2",
                },
              },
            },
          ],
          should: [{}],
        },
      },
      aggs: {
        distinct_builders: {
          terms: {
            field: "builder",
            size: 1000,
          },
        },
      },
    };
    q.query.bool.must.push(required_query);

    let resp = await axios.get(
      "http://localhost:9200/assetzilla/entities/_search",
      { data: q }
    );
    if (
      resp &&
      resp.data &&
      resp.data.aggregations &&
      resp.data.aggregations.distinct_builders &&
      resp.data.aggregations.distinct_builders.buckets &&
      resp.data.aggregations.distinct_builders.buckets.length > 0
    ) {
      return resp.data.aggregations.distinct_builders.buckets;
    } else {
      return [];
    }
  } catch (err) {
    console.log(err);
    return [];
  }
};

const findMinimumBuilderPrice = async (field, name, builder) => {
  try {
    let q = {
      should: [],
      must: [{ match_phrase: { builder: builder.key } }, { term: { is_live: "2" } }],
    };
    q.must.push({term: {[field]:name}});
    let properties = await Elastic.get_entities(
      "",
      "property",
      1000,
      [
        "banner_image",
        "name",
        "url",
        "id",
        "images",
        "price",
        "property_type",
        "price",
        "city",
        "district",
        "state",
        "subcity",
      ],
      q,
      0
    );

    if (properties && properties.results && properties.results.length > 0){
      let min = Number.MAX_SAFE_INTEGER;
      for (let i = 0; i<properties.results.length; i++){
        if (properties.results[i].price && properties.results[i].price.price){
          if (properties.results[i].price.price < min) {
            min = properties.results[i].price.price;
          }
        }
      }
      if (min < Number.MAX_SAFE_INTEGER){
        return min;
      } else {
        return 0;
      }
    } else {
      return 0;
    }


  } catch (err) {
    console.log(err);
    return 0;
  }s
}

module.exports = {
  location,
  property,
  project,
};
