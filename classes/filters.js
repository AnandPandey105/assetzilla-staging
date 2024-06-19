const { getPossibleProjectUnitSizes, get_non_bhk_bhk_space } = require("./elasticsearch");

var location_matches = ["city", "subcity", "district", "state"];
var project_matches = ["project"];
var authority_matches = ["authority"];
var property_sort = function (query) {
  console.log("Query = ", query);
  if (query === "newest") {
    return [{ updatedAt: { order: "desc" } }];
  } else if (query === "oldest") {
    return [{ updatedAt: { order: "asc" } }];
  } else if (query === "name") {
    return [{ "name.raw": { order: "asc" } }];
  } else if (query === "namereverse") {
    return [{ "name.raw": { order: "desc" } }];
  } else if (query === "furnished") {
    return [{ furnished: { order: "asc" } }];
  } else if (query === "furnishedreverse") {
    return [{ furnished: { order: "desc" } }];
  } else if (query === "property_type") {
    return [{ property_type: { order: "asc" } }];
  } else if (query === "property_type_reverse") {
    return [{ property_type: { order: "desc" } }];
  } else if (query === "city") {
    return [{ city: { order: "asc" } }];
  } else if (query === "cityreverse") {
    return [{ city: { order: "desc" } }];
  } else if (query === "subcity") {
    return [{ subcity: { order: "asc" } }];
  } else if (query === "subcityreverse") {
    return [{ subcity: { order: "desc" } }];
  } else if (query === "pricedesc") {
    return [{ "price.price": { order: "desc" } }];
  } else if (query === "areaasc") {
    return [{ "area.area": { order: "asc" } }];
  } else if (query === "areadesc") {
    return [{ "area.area": { order: "desc" } }];
  } else if (query === "sqft_cost") {
    return [{ "sq_fit_cost.cost": { order: "asc" } }];
  } else if (query === "sqft_cost_reverse") {
    return [{ "sq_fit_cost.cost": { order: "desc" } }];
  } else if (query === "bhkasc") {
    return [{ bhk_space: { order: "asc" } }];
  } else if (query === "bhkdesc") {
    return [{ bhk_space: { order: "desc" } }];
  } else if (query === "views") {
    return [{ views: { order: "asc" } }];
  } else if (query === "viewsreverse") {
    return [{ views: { order: "desc" } }];
  } else {
    return [{ "price.price": { order: "asc" } }];
  }
  // else {
  //     return [{ "updated": { "order": "desc" } }]
  // }
};
var property_filters = async function (query) {
  result = { should: [], must: [] };
  if ("config" in query) {
    if (typeof query["config"] == "string") {
      query.config = query["config"].split(",");
    }
    let q = { bool: { should: [] } };
    query.config.forEach((element) => {
      q.bool.should.push({ term: { bhk_space: element } });
    });
    result.must.push(q);
  }
  if ("condition" in query) {
    if (typeof query["condition"] == "string") {
      query.condition = query["condition"].split(",");
    }
    let q = { bool: { should: [] } };
    query.condition.forEach((element) => {
      q.bool.should.push({ term: { condition: element } });
    });
    result.must.push(q);
  }
  if ("facing" in query) {
    if (typeof query["facing"] == "string") {
      query.facing = query["facing"].split(",");
    }
    let q = { bool: { should: [] } };
    query.facing.forEach((element) => {
      q.bool.should.push({ term: { facing: element } });
    });
    result.must.push(q);
  }
  if ("type" in query) {
    if (typeof query["type"] == "string") {
      query.type = query["type"].split(",");
    }
    let q = { bool: { should: [] } };
    query.type.forEach((element) => {
      q.bool.should.push({ match_phrase: { property_type: element } });
    });
    result.must.push(q);
  }
  if ("case_id" in query) {
    if (typeof query["case_id"] == "string") {
      query.type = query["case_id"].split(",");
    }
    let q = { bool: { should: [] } };
    query.type.forEach((element) => {
      q.bool.should.push({ match_phrase: { case_id: element } });
    });
    result.must.push(q);
  }
  if (
    "city" in query ||
    "subcity" in query ||
    "district" in query ||
    "state" in query
  ) {
    let q = { bool: { should: [] } };
    for (const key of location_matches) {
      if (key in query) {
        if (typeof query[key] == "string") {
          query[key] = query[key].split(",");
        }
        let data = query[key];

        for (const element of data) {
          q.bool.should.push({ match_phrase: { [key]: element } });
        };
      }
    };
    result.must.push(q);
  }
  if ("project" in query) {
    let q = { bool: { should: [] } };
    for (const key of project_matches) {
      if (key in query) {
        if (typeof query[key] == "string") {
          query[key] = query[key].split(",");
        }
        let data = query[key];

        for (const element of data) {
          q.bool.should.push({ match_phrase: { [key]: element } });
        };
      }
    };
    result.must.push(q);
  }
  if ("authority" in query) {
    let q = { bool: { should: [] } };
    for (const key of authority_matches) {
      if (key in query) {
        if (typeof query[key] == "string") {
          query[key] = query[key].split(",");
        }
        let data = query[key];

        for (const element of data) {
          q.bool.should.push({ match_phrase: { [key]: element } });
        };
      }
    };
    result.must.push(q);
  }
  if ("builder" in query) {
    if (typeof query["builder"] == "string") {
      query.builder = query["builder"].split(",");
    }
    let data = query["builder"];
    let q = { bool: { should: [] } };
    for (const element of data) {
      q.bool.should.push({ match_phrase: { builder: element } });
    };
    result.must.push(q);
  }
  if ("price" in query) {
    if (typeof query["price"] == "string") {
      query.price = query["price"].split(",");
    }
    let data = query["price"];
    let q = { bool: { should: [] } };
    for (const element of data) {
      if (element == "0 to 25 lacs") {
        q.bool.should.push({
          range: {
            "price.price": {
              gte: 0,
              lte: 2500000,
              boost: 2.0,
            },
          },
        });
      } else if (element == "25 lacs to 50 lacs") {
        q.bool.should.push({
          range: {
            "price.price": {
              gte: 2500000,
              lte: 5000000,
              boost: 2.0,
            },
          },
        });
      } else if (element == "50 lacs to 1 cr") {
        q.bool.should.push({
          range: {
            "price.price": {
              gte: 5000000,
              lte: 10000000,
              boost: 2.0,
            },
          },
        });
      } else if (element == "1 cr to 5 cr") {
        q.bool.should.push({
          range: {
            "price.price": {
              gte: 10000000,
              lte: 50000000,
              boost: 2.0,
            },
          },
        });
      }
      if (element == "5 cr and above") {
        q.bool.should.push({
          range: {
            "price.price": {
              gte: 50000000,
              boost: 2.0,
            },
          },
        });
      }
    };
    result.must.push(q);
  }
  if ("area" in query) {
    if (typeof query["area"] == "string") {
      query.area = query["area"].split(",");
    }
    let data = query["area"];
    let q = { bool: { should: [] } };
    for (const element of data) {
      if (element == "0 to 1000 sq ft") {
        q.bool.should.push({
          range: {
            "area.area": {
              gte: 0,
              lte: 1000,
              boost: 2.0,
            },
          },
        });
      } else if (element == "1000 to 1500 sq ft") {
        q.bool.should.push({
          range: {
            "area.area": {
              gte: 1000,
              lte: 1500,
              boost: 2.0,
            },
          },
        });
      } else if (element == "1500 to 2000 sq ft") {
        q.bool.should.push({
          range: {
            "area.area": {
              gte: 1500,
              lte: 2000,
              boost: 2.0,
            },
          },
        });
      } else if (element == "2000 sq ft and above") {
        q.bool.should.push({
          range: {
            "area.area": {
              gte: 2000,
              boost: 2.0,
            },
          },
        });
      }
    };
    result.must.push(q);
  }
  if ("bhk" in query) {
    if (typeof query["bhk"] == "string") {
      query.bhk = query["bhk"].split(",");
    }
    let dat = query["bhk"];
    let q = { bool: { should: [], must_not: [] } };
    for (const element of dat) {
      if (element === "1") {
        q.bool.should.push({ term: { bhk_space: "1 BHK", }, });
      } else if (element === "2") {
        q.bool.should.push({ term: { bhk_space: "2 BHK", }, });
      } else if (element === "3") {
        q.bool.should.push({ term: { bhk_space: "3 BHK", }, });
      } else if (element === "4") {
        q.bool.should.push({ term: { bhk_space: "4 BHK", }, });
      } else if (element === "5-to-10") {
        q.bool.should.push({ term: { bhk_space: "5 BHK", }, });
        q.bool.should.push({ term: { bhk_space: "6 BHK", }, });
        q.bool.should.push({ term: { bhk_space: "7 BHK", }, });
        q.bool.should.push({ term: { bhk_space: "8 BHK", }, });
        q.bool.should.push({ term: { bhk_space: "9 BHK", }, });
        q.bool.should.push({ term: { bhk_space: "10 BHK", }, });
      } else if (element === "others") {
        if (true) {
          let old_result = result;
          const non_bhks = await get_non_bhk_bhk_space();
          result = old_result;
          for (const b of non_bhks) {
            q.bool.should.push({ term: { bhk_space: b.key } });
          };
          // q.bool.should.push({ term: { bhk_space: "" } });
          q.bool.should.push({ "bool": { "must_not": [{ "exists": { "field": "bhk_space" } }] } });
        } else {
          q.bool.must_not.push({ term: { bhk_space: "1 BHK", }, });
          q.bool.must_not.push({ term: { bhk_space: "2 BHK", }, });
          q.bool.must_not.push({ term: { bhk_space: "3 BHK", }, });
          q.bool.must_not.push({ term: { bhk_space: "4 BHK", }, });
          q.bool.must_not.push({ term: { bhk_space: "5 BHK", }, });
          q.bool.must_not.push({ term: { bhk_space: "6 BHK", }, });
          q.bool.must_not.push({ term: { bhk_space: "7 BHK", }, });
          q.bool.must_not.push({ term: { bhk_space: "8 BHK", }, });
          q.bool.must_not.push({ term: { bhk_space: "9 BHK", }, });
          q.bool.must_not.push({ term: { bhk_space: "10 BHK", }, });
        }
      }
    };
    result.must.push(q);
  }
  return result;
};
// Project
var project_sort = function (query) {
  console.log("query = ", query);
  if (query === "newest") {
    return [{ updatedAt: { order: "desc" } }];
  } else if (query === "oldest") {
    return [{ updatedAt: { order: "asc" } }];
  } else if (query === "name") {
    return [{ "name.raw": { order: "asc" } }];
  } else if (query === "namereverse") {
    return [{ "name.raw": { order: "desc" } }];
  } else if (query === "pricedesc") {
    return [{ "price.min": { order: "desc" } }];
  } else if (query === "areaasc") {
    //console.log('*********************************inside- asc')
    return [{ "details_area.min": { order: "asc" } }];
    // return [{ "area.area": { "order": "asc" } }]
  } else if (query === "areadesc") {
    console.log("*********************************inside- desc");
    return [{ "details_area.max": { order: "desc" } }];
    // return [{ "area.area": { "order": "desc" } }]
  } else if (query === "proareaasc") {
    // console.log('*********************************inside- asc')
    return [{ "area.area": { order: "asc" } }];
    // return [{ "area.area": { "order": "asc" } }]
  } else if (query === "proareadesc") {
    // console.log('*********************************inside- desc')
    return [{ "area.area": { order: "desc" } }];
    // return [{ "area.area": { "order": "desc" } }]
  } else if (query === "property_type") {
    return [{ property_type: { order: "asc" } }];
  } else if (query === "property_type_reverse") {
    return [{ property_type: { order: "desc" } }];
  } else if (query === "project_status") {
    return [{ project_status: { order: "asc" } }];
  } else if (query === "project_status_reverse") {
    return [{ project_status: { order: "desc" } }];
  } else if (query === "city") {
    return [{ city: { order: "asc" } }];
  } else if (query === "cityreverse") {
    return [{ city: { order: "desc" } }];
  } else if (query === "subcity") {
    return [{ subcity: { order: "asc" } }];
  } else if (query === "subcityreverse") {
    return [{ subcity: { order: "desc" } }];
  } else if (query === "sqft_cost") {
    return [{ "sq_fit_cost.min": { order: "asc" } }];
  } else if (query === "sqft_cost_reverse") {
    return [{ "sq_fit_cost.min": { order: "desc" } }];
  } else if (query === "propertyreverse") {
    return [{ total_properties: { order: "desc" } }];
  } else if (query === "views") {
    return [{ views: { order: "asc" } }];
  } else if (query === "viewsreverse") {
    return [{ views: { order: "desc" } }];
  } else if (query === "total_properties") {
    return [{ total_properties: { order: "asc" } }];
  } else if (query === "total_properties_reverse") {
    return [{ total_properties: { order: "desc" } }];
  } else if (query === "total_projects") {
    return [{ total_projects: { order: "asc" } }];
  } else if (query === "total_projects_reverse") {
    return [{ total_projects: { order: "desc" } }];
  } else {
    return [{ "price.min": { order: "asc" } }];
  }
  // else {
  //     return [{ "updated": { "order": "desc" } }]
  // }
};
var project_filters = async function (query) {
  //console.log("56",query)
  result = { should: [], must: [] };
  if ("builder" in query) {
    if (typeof query["builder"] == "string") {
      query.builder = query["builder"].split(",");
    }
    let data = query["builder"];
    let q = { bool: { should: [] } };
    data.forEach((element) => {
      q.bool.should.push({ match_phrase: { builder: element } });
    });
    result.must.push(q);
  }
  if ("banks" in query) {
    if (typeof query["banks"] == "string") {
      query.banks = query["banks"].split(",");
    }
    let data = query["banks"];
    let q = { bool: { should: [] } };
    data.forEach((element) => {
      q.bool.should.push({ match_phrase: { banks: element } });
    });
    result.must.push(q);
  }
  if ("authority" in query) {
    if (typeof query["authority"] == "string") {
      query.authority = query["authority"].split(",");
    }
    let data = query["authority"];
    let q = { bool: { should: [] } };
    data.forEach((element) => {
      q.bool.should.push({ match_phrase: { authority: element } });
    });
    result.must.push(q);
  }
  if ("facing" in query) {
    if (typeof query["facing"] == "string") {
      query.facing = query["facing"].split(",");
    }
    let q = { bool: { should: [] } };
    query.facing.forEach((element) => {
      q.bool.should.push({ term: { facing: element } });
    });
    result.must.push(q);
  }
  if (
    "city" in query ||
    "subcity" in query ||
    "district" in query ||
    "state" in query
  ) {
    let q = { bool: { should: [] } };
    location_matches.forEach((key) => {
      if (key in query) {
        if (typeof query[key] == "string") {
          query[key] = query[key].split(",");
        }
        let data = query[key];

        data.forEach((element) => {
          q.bool.should.push({ match_phrase: { [key]: element } });
        });
      }
    });
    result.must.push(q);
  }
  if ("type" in query) {
    if (typeof query["type"] == "string") {
      query.type = query["type"].split(",");
    }
    let q = { bool: { should: [] } };
    query.type.forEach((element) => {
      q.bool.should.push({ match_phrase: { property_type: element } });
    });
    result.must.push(q);
  }
  if ("status" in query) {
    // console.log('query is for status', query)
    if (typeof query["status"] == "string") {
      query.status = query["status"].split(",");
    }
    let q = { bool: { should: [] } };

    query.status.forEach((element) => {
      q.bool.should.push({ match_phrase: { project_status: element } });
    });
    // console.log('query is for status', query)
    result.must.push(q);
  }
  if ("bank" in query) {
    if (typeof query["bank"] == "string") {
      query.bank = query["bank"].split(",");
    }
    let q = { bool: { should: [] } };
    query.bank.forEach((element) => {
      q.bool.should.push({ match_phrase: { banks: element } });
    });
    result.must.push(q);
  }
  if ("price" in query) {
    if (typeof query["price"] == "string") {
      query.price = query["price"].split(",");
    }
    let data = query["price"];
    let q = { bool: { should: [] } };
    data.forEach((element) => {
      if (element == "0 to 25 lacs") {
        q.bool.should.push({
          match_phrase: {
            "price.zeroTo25Lacs": 1,
          },
        });
      }
      if (element == "25 lacs to 50 lacs") {
        q.bool.should.push({
          match_phrase: {
            "price.twentyfiveTo50Lacs": 1,
          },
        });

        q.bool.should.push({
            'range': {
                'price.max': {

                    "gt": 2500000,
                    "lte": 5000000,

                }
            }
        }, {
            'range': {
                'price.min': {

                    "gt": 2500000,
                    "lte": 5000000,

                }
            }
        })
      }
      if (element == "50 lacs to 1 cr") {
        q.bool.should.push({
            'range': {
                'price.max': {

                    "gt": 5000000,
                    "lte": 10000000,

                }
            }
        }, {
            'range': {
                'price.min': {

                    "gt": 5000000,
                    "lte": 10000000,

                }
            }
        })
        q.bool.should.push({
          match_phrase: {
            "price.fiftyTo1cr": 1,
          },
        });
      }
      if (element == "1 cr to 5 cr") {
        q.bool.should.push({
            'range': {
                'price.max': {

                    "gt": 10000000,
                    "lte": 50000000,

                }
            }
        }, {
            'range': {
                'price.min': {

                    "gt": 10000000,
                    "lte": 50000000,

                }
            }
        })
        q.bool.should.push({
          match_phrase: {
            "price.oneTo5cr": 1,
          },
        });
      }
      if (element == "5 cr and above") {
        q.bool.should.push({
            'range': {
                'price.max': {

                    "gt": 50000000,

                }
            }
        }, {
            'range': {
                'price.min': {

                    "gt": 50000000,

                }
            }
        })
        q.bool.should.push({
          match_phrase: {
            "price.fiveToabove": 1,
          },
        });
      }
    });

    result.must.push(q);
  }
  if ("area" in query) {
    if (typeof query["area"] == "string") {
      query.area = query["area"].split(",");
    }
    let data = query["area"];
    console.log("data", data);
    let q = { bool: { should: [] } };
    data.forEach((element) => {
      if (element == "0 to 1000 sq ft") {
        q.bool.should.push(
          {
            range: {
              "details_area.max": {
                gt: 0,
                lte: 1000,
              },
            },
          },
          {
            range: {
              "details_area.min": {
                gt: 0,
                lte: 1000,
              },
            },
          }
        );
      } else if (element == "1000 to 1500 sq ft") {
        q.bool.should.push(
          {
            range: {
              "details_area.max": {
                gt: 1000,
                lte: 1500,
              },
            },
          },
          {
            range: {
              "details_area.min": {
                gt: 1000,
                lte: 1500,
              },
            },
          }
        );
      } else if (element == "1500 to 2000 sq ft") {
        q.bool.should.push(
          {
            range: {
              "details_area.max": {
                gt: 1500,
                lte: 2000,
              },
            },
          },
          {
            range: {
              "details_area.min": {
                gt: 1500,
                lte: 2000,
              },
            },
          }
        );
      } else if (element == "2000 sq ft and above") {
        q.bool.should.push(
          {
            range: {
              "details_area.max": {
                gt: 2000,
              },
            },
          },
          {
            range: {
              "details_area.min": {
                gt: 2000,
              },
            },
          }
        );
      }
    });
    result.must.push(q);
  }
  if ("bhk" in query) {
    if (typeof query["bhk"] == "string") {
      query.bhk = query["bhk"].split(",");
    }
    let data = query["bhk"];
    let q = { bool: { should: [] } };
    for (const element of data) {
      if (element == "1") {
        q.bool.should.push({
          term: {
            "details.unit_size": "1 BHK",
          },
        });
      } else if (element == "2") {
        q.bool.should.push({
          term: {
            "details.unit_size": "2 BHK",
          },
        });
      } else if (element == "3") {
        q.bool.should.push({
          term: {
            "details.unit_size": "3 BHK",
          },
        });
      } else if (element == "4") {
        q.bool.should.push({
          term: {
            "details.unit_size": "4 BHK",
          },
        });
      } else if (element == "5-to-10") {
        q.bool.should.push({
          term: {
            "details.unit_size": "5 BHK",
          },
        });
        q.bool.should.push({
          term: {
            "details.unit_size": "6 BHK",
          },
        });
        q.bool.should.push({
          term: {
            "details.unit_size": "7 BHK",
          },
        });
        q.bool.should.push({
          term: {
            "details.unit_size": "8 BHK",
          },
        });
        q.bool.should.push({
          term: {
            "details.unit_size": "9 BHK",
          },
        });
        q.bool.should.push({
          term: {
            "details.unit_size": "10 BHK",
          },
        });
      } else if (element == "others") {
        q.bool.should.push({
          bool: {
            must_not: [
              {
                exists: {
                  field: "details.unit_size",
                },
              },
              {
                term: {
                  "details.unit_size": "1 BHK",
                }
              },
              {
                term: {
                  "details.unit_size": "2 BHK",
                }
              },
              {
                term: {
                  "details.unit_size": "3 BHK",
                }
              },
              {
                term: {
                  "details.unit_size": "4 BHK",
                }
              },
              {
                term: {
                  "details.unit_size": "5 BHK",
                }
              },
              {
                term: {
                  "details.unit_size": "6 BHK",
                }
              },
              {
                term: {
                  "details.unit_size": "7 BHK",
                }
              },
              {
                term: {
                  "details.unit_size": "8 BHK",
                }
              },
              {
                term: {
                  "details.unit_size": "9 BHK",
                }
              },
              {
                term: {
                  "details.unit_size": "10 BHK",
                }
              },

            ],
          },
        });
      }
    }
    result.must.push(q);
  }
  return result;
};
// builder
var builder_sort = function (query) {
  if (query === "newest") {
    return [{ updatedAt: { order: "desc" } }];
  } else if (query === "oldest") {
    return [{ updatedAt: { order: "asc" } }];
  } else if (query === "name") {
    return [{ "name.raw": { order: "asc" } }];
  } else if (query === "namereverse") {
    return [{ "name.raw": { order: "desc" } }];
  } else if (query === "projects_asc" || query === "total_projects") {
    return [{ total_projects: { order: "asc" } }];
  } else if (query === "projects_desc" || query === "total_projectsreverse") {
    return [{ total_projects: { order: "desc" } }];
  } else if (query === "propertyreverse") {
    return [{ total_properties: { order: "desc" } }];
  } else if (query === "readytomoveasc") {
    return [{ "project_status_count.ReadyToMove": { order: "asc" } }]; // checking after key changed without spaces
  } else if (query === "readytomovedesc") {
    return [{ "project_status_count.ReadyToMove": { order: "desc" } }]; // checking after key changed without spaces
  } else if (query === "priceasc") {
    return [{ "price.min": { order: "asc" } }];
  } else if (query === "pricedesc") {
    return [{ "price.min": { order: "desc" } }];
  } else if (query === "views") {
    return [{ views: { order: "asc" } }];
  } else if (query === "viewsreverse") {
    return [{ views: { order: "desc" } }];
  } else {
    return [{ total_projects: { order: "desc" } }];
    // return [{ "price.min": { "order": "asc" } }]
  }
};
var builder_filters = function (query) {
  result = { should: [], must: [] };

  if ("type" in query) {
    if (typeof query["type"] == "string") {
      query.type = query["type"].split(",");
    }
    let q = { bool: { should: [] } };
    query.type.forEach((element) => {
      q.bool.should.push({ match_phrase: { builder_property_type: element } });
    });
    result.must.push(q);
  }
  if ("presence" in query) {
    if (typeof query["presence"] == "string") {
      query.presence = query["presence"].split(",");
    }
    let q = { bool: { should: [] } };
    query.presence.forEach((element) => {
      q.bool.should.push({ match: { "local_presence.keyword": element } });
    });
    result.must.push(q);
  } else if ("status" in query) {
    if (typeof query["status"] == "string") {
      query.status = query["status"].split(",");
    }
    let q = { bool: { should: [] } };
    query.status.forEach((element) => {
      q.bool.should.push({ match_phrase: { "status_project.type": element } }); //change the key
    });
    result.must.push(q);
  }

  // else if ("status-project" in query) {
  //     if (typeof query["status-project"] == "string") { query.type = query["status-project"].split(",") }
  //     let q = { "bool": { "should": [] } }
  //     query.type.forEach(element => {
  //         q.bool.should.push({ match_phrase: { builder_property_type: element } }) //change the key
  //     });
  //     result.must.push(q)
  // }
  return result;
};

// bank
var bank_sort = function (query) {
  if (query === "newest") {
    return [{ updated: { order: "desc" } }];
  } else if (query == "name") {
    return [{ "name.raw": { order: "asc" } }];
  } else if (query == "namereverse") {
    return [{ "name.raw": { order: "desc" } }];
  } else if (query == "projects") {
    return [{ total_projects: { order: "asc" } }];
  } else if (query == "projectsreverse") {
    return [{ total_projects: { order: "desc" } }];
  } else if (query == "propertyreverse") {
    return [{ total_properties: { order: "desc" } }];
  } else if (query == "type") {
    return [{ type: { order: "asc" } }];
  } else if (query == "typereverse") {
    return [{ type: { order: "desc" } }];
  } else if (query === "views") {
    return [{ views: { order: "asc" } }];
  } else if (query === "viewsreverse") {
    return [{ views: { order: "desc" } }];
  } else {
    return [{ total_projects: { order: "desc" } }];
  }
};
var bank_filters = function (query) {
  result = { should: [], must: [] };

  if ("type" in query) {
    if (typeof query["type"] == "string") {
      query.type = query["type"].split(",");
    }
    let q = { bool: { should: [] } };
    query.type.forEach((element) => {
      q.bool.should.push({ match_phrase: { type: element } });
    });
    result.must.push(q);
  }
  return result;
};
var location_filters = function (query) {
  result = { should: [], must: [] };
  if ("location_type" in query) {
    if (typeof query["location_type"] == "string") {
      query.location_type = query["location_type"].split(",");
    }
    let q = { bool: { should: [] } };
    query.location_type.forEach((element) => {
      q.bool.should.push({ match_phrase: { location_type: element } });
    });
    result.must.push(q);
  }
  if (
    "city" in query ||
    "subcity" in query ||
    "district" in query ||
    "state" in query
  ) {
    let q = { bool: { should: [] } };
    location_matches.forEach((key) => {
      if (key in query) {
        if (typeof query[key] == "string") {
          query[key] = query[key].split(",");
        }
        let data = query[key];

        data.forEach((element) => {
          q.bool.should.push({ match_phrase: { [key]: element } });
        });
      }
    });
    result.must.push(q);
  }
  return result;
};
var location_sort = function (query) {
  if (query === "newest") {
    return [{ updated: { order: "desc" } }];
  } else if (query == "name") {
    return [{ "name.raw": { order: "asc" } }];
  } else if (query == "namereverse") {
    return [{ "name.raw": { order: "desc" } }];
  } else if (query == "projects_asc" || query == "total_projects") {
    return [{ total_projects: { order: "asc" } }];
  } else if (query == "projects_desc" || query == "total_projectsreverse") {
    return [{ total_projects: { order: "desc" } }];
  } else if (query == "properties_desc") {
    return [{ total_properties: { order: "desc" } }];
  } else if (query == "population") {
    return [{ population: { order: "asc" } }];
  } else if (query == "populationreverse") {
    return [{ population: { order: "desc" } }];
  } else if (query == "capital_income") {
    return [{ capital_income: { order: "asc" } }];
  } else if (query == "capitalincomereverse") {
    return [{ capital_income: { order: "desc" } }];
  } else if (query == "gdp") {
    return [{ gdp: { order: "asc" } }];
  } else if (query == "gdpreverse") {
    return [{ gdp: { order: "desc" } }];
  } else if (query == "area") {
    return [{ "area.area": { order: "asc" } }];
  } else if (query == "areareverse") {
    return [{ "area.area": { order: "desc" } }];
  } else if (query == "priceasc") {
    return [{ "price.min": { order: "asc" } }];
  } else if (query == "pricedesc") {
    return [{ "price.min": { order: "desc" } }];
  } else if (query == "readytomovedesc") {
    return [{ "project_status_count.ReadyToMove": { order: "desc" } }];
  } else if (query == "readytomoveasc") {
    return [{ "project_status_count.ReadyToMove": { order: "asc" } }];
  } else if (query == "location_type_desc") {
    return [{ location_type: { order: "desc" } }];
  } else if (query == "location_type_asc") {
    return [{ location_type: { order: "asc" } }];
  } else if (query === "views") {
    return [{ views: { order: "asc" } }];
  } else if (query === "viewsreverse") {
    return [{ views: { order: "desc" } }];
  } else {
    return [{ total_projects: { order: "desc" } }];
  }

  // else {
  //     return [{ "name.raw": { "order": "asc" } }]
  // }
};
var news_filter = function (query) {
  result = { should: [], must: [] };
  if ("q" in query) {
    if (typeof query["q"] != "string") {
      query.q = query.q[0];
    }
    let q = query.q;

    result.should.push({
      multi_match: {
        fields: ["heading"],
        query: q,
        type: "best_fields",
        fuzziness: "AUTO",
        prefix_length: 2,
        boost: 10,
      },
    });
    query_list = q.split(/[.\-_\s]/);
    query_list.forEach((word) => {
      result.must.push({
        regexp: {
          heading: {
            value: "@" + word + "@",
            boost: 5,
          },
        },
      });
    });
  }
  if ("tag" in query) {
    result.must.push([{ match_phrase: { tags: query.tag } }]);
  }
  return result;
};
var news_sort = function (query) {
  if (query === "newest") {
    return [{ updated: { order: "desc" } }];
  } else if (query == "publish_date") {
    return [{ publish_date: { order: "asc" } }];
  } else if (query == "publish_datereverse") {
    return [{ publish_date: { order: "desc" } }];
  } else if (query === "views") {
    return [{ views: { order: "asc" } }];
  } else if (query === "viewsreverse") {
    return [{ views: { order: "desc" } }];
  } else {
    return [{ updated: { order: "desc" } }];
  }
};
// Authority
var authority_sort = function (query) {
  if (query === "newest") {
    return [{ updatedAt: { order: "desc" } }];
  } else if (query === "oldest") {
    return [{ updatedAt: { order: "asc" } }];
  } else if (query === "name") {
    return [{ "name.raw": { order: "asc" } }];
  } else if (query === "namereverse") {
    return [{ "name.raw": { order: "desc" } }];
  } else if (query === "projectasc" || query === "total_projects") {
    return [{ total_projects: { order: "asc" } }];
  } else if (query === "total_projectsreverse") {
    return [{ total_projects: { order: "desc" } }];
  } else if (query === "total_propertyreverse") {
    return [{ total_properties: { order: "desc" } }];
  } else if (query === "priceasc") {
    return [{ "price.min": { order: "asc" } }];
  } else if (query === "readytomovedesc") {
    return [{ "project_status_count.ReadyToMove": { order: "desc" } }];
  } else if (query === "readytomove") {
    return [{ "project_status_count.ReadyToMove": { order: "asc" } }];
  } else if (query === "pricedesc") {
    return [{ "price.min": { order: "desc" } }];
  } else if (query === "views") {
    return [{ views: { order: "asc" } }];
  } else if (query === "viewsreverse") {
    return [{ views: { order: "desc" } }];
  } else {
    return [{ total_projects: { order: "desc" } }];
  }
};
var authority_filters = function (query) {
  result = { should: [], must: [] };
  if (
    "city" in query ||
    "subcity" in query ||
    "district" in query ||
    "state" in query
  ) {
    let q = { bool: { should: [] } };
    location_matches.forEach((key) => {
      if (key in query) {
        if (typeof query[key] === "string") {
          query[key] = query[key].split(",");
        }
        let data = query[key];

        data.forEach((element) => {
          q.bool.should.push({ match_phrase: { [key]: element } });
        });
      }
    });
    result.must.push(q);
  }
  return result;
};

//locations
var subcity_sort = function (query) {
  if (query === "newest") {
    return [{ updated: { order: "desc" } }];
  } else if (query === "views") {
    return [{ views: { order: "asc" } }];
  } else if (query === "viewsreverse") {
    return [{ views: { order: "desc" } }];
  }
};

module.exports = {
  property_filters,
  property_sort,
  project_filters,
  project_sort,
  builder_filters,
  builder_sort,
  news_filter,
  news_sort,
  authority_sort,
  bank_sort,
  bank_filters,
  authority_filters,
  location_filters,
  location_sort,
};

// for (var i=0; i< docs.lenght; i++) { // total documents
//     var detailsArr = docs[i].details; // get details array
//     var detailsLen = detailsArr.length //get details array length

//     for (var j=0; j<detailsLen; j++) {
//         var propAreaArray = [];
//         propAreaArray.push(detailsArr[j].area); //push area of each indexed detailsArray

//     }

//     propAreaArray.sort(function(a, b){ // sorting the array
// 		return a - b;
// 	});

//     var propertiesArea = {};
//     propertiesArea.min = propAreaArray[0]; //getting min value
//     propertiesArea.max = propAreaArray[(propAreaArray.length) - 1]; //getting max value
// }
