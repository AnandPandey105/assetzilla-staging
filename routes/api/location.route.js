const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
var ObjectId = require("mongoose").Types.ObjectId;
const {
  changeNumberFormat,
  numberWithCommas,
} = require("../../classes/numberFormatter");
Images = require("../../classes/images");
// const {authenticate} = require('../../middlewares/authenticate.middleware');
Elastic = require("../../classes/elasticsearch");

router.post("/get/:location_type", function (req, res) {
  if ("limit" in req.body) {
    var limit = req.body.limit;
  } else {
    var limit = 10;
  }
  if ("query" in req.body) {
    var query = req.body.query;
  } else {
    var query = "";
  }
  if ("skip" in req.body) {
    var skip = req.body.skip;
  } else {
    var skip = 0;
  }
  if ("sort" in req.body) {
    var sort = Filters.location_sort(req.body.sort);
  }
  if ("location" in req.body.filter) {
    var filter = Filters.location_filters(req.body.filter.location);
  }
  if ("status" in req.body.filter) {
    if (!filter) {
      var filter = { should: [], must: [] };
    }
    filter.must.push({ term: { is_live: req.body.filter.status } });
  }
  if (!filter) {
    var filter = { should: [], must: [] };
  }
  filter.must.push({ term: { location_type: req.params.location_type } });
  Elastic.get_entities(
    query,
    "location",
    limit,
    [
      "url",
      "name",
      "gdp",
      "population",
      "total_projects",
      "area",
      "is_live",
      "id",
      "state",
      "district",
      "city",
      "updated",
      "views"
    ],
    filter,
    skip,
    sort
  ).then((resp) => {
    res.status(200).json({
      success: true,
      message: "Fetched location's list",
      results: resp.results,
      total: resp.count,
    });
  });
});

router.post("/infinite", function (req, res) {
  req.body.query = JSON.parse(req.body.query);
  if ("limit" in req.body) {
    var limit = req.body.limit;
  } else {
    var limit = 10;
  }
  if ("q" in req.body.query) {
    var query = req.body.query.q[0];
  } else {
    var query = "";
  }
  if ("skip" in req.body) {
    var skip = req.body.skip;
  } else {
    var skip = 0;
  }
  if ("query" in req.body) {
    var filter = Filters.location_filters(req.body.query);
  } else {
    var filter = { should: [], must: [] };
  }
  filter.must.push({ term: { is_live: "2" } });
  // if ("sort" in req.body.query) { var sort = Filters.location_sort(req.body.query.sort[0]) }
  if ("sort" in req.body.query) {
    var sort = Filters.location_sort(req.body.query.sort[0]);
  } else {
    var sort = Filters.location_sort(undefined);
  }
  // console.log('****location routes: ', sort);
  Elastic.get_entities(
    query,
    "location",
    limit,
    [
      "name",
      "url",
      "project_status_count",
      "capital_income",
      "gdp",
      "population",
      "location_type",
      "banner_image",
      "total_projects",
      "price",
      "id",
      ,
      "state",
      "subcity",
      "district",
      "city",
      "area",
    ],
    filter,
    skip,
    sort
  ).then((resp) => {
    if (resp.results.length > 0) {
      resp.results = Images.banner_img_url_list(resp.results);

      resp.changeNumberFormat = changeNumberFormat;
      res.render("pages/v1/partials/location-card", resp);
      // res.render('partials/location_cards', resp);
    } else {
      res.send("");
    }
  });
});

router.post("/table-pagination", function (req, res) {
  req.body.query = JSON.parse(req.body.query);
  if ("limit" in req.body) {
    var limit = req.body.limit;
  } else {
    var limit = 10;
  }
  if ("q" in req.body.query) {
    var query = req.body.query.q[0];
  } else {
    var query = "";
  }
  if ("skip" in req.body) {
    var skip = req.body.skip;
  } else {
    var skip = 0;
  }
  if ("sort" in req.body.query) {
    var sort = Filters.location_sort(req.body.query.sort[0]);
  }
  if ("query" in req.body) {
    var filter = Filters.location_filters(req.body.query);
  } else {
    var filter = { should: [], must: [] };
  }
  filter.must.push({ term: { is_live: "2" } });
  Elastic.get_entities(
    query,
    "location",
    limit,
    [
      "area",
      "name",
      "url",
      "project_status_count",
      "capital_income",
      "gdp",
      "population",
      "location_type",
      "banner_image",
      "total_projects",
      "price",
      "state",
      "subcity",
      "district",
      "city",
    ],
    filter,
    skip,
    sort
  ).then((resp) => {
    res.status(200).json({
      success: true,
      message: "Fetched Authorities list",
      results: resp.results,
      total: resp.count,
    });
  });
});

router.post("/typeahead", function (req, res) {
  filter_ = [{ term: { doc_type: "location" } }];
  var status = "2";
  if ("status" in req.body) {
    if (req.body.status != "0") {
      filter_.push({ term: { is_live: req.body.status } });
    }
  } else {
    filter_.push({ term: { is_live: status } });
  }
  results = Elastic.query_typeahead(req.body.data, filter_);
  results.then((data) => {
    if (results) {
      res.status(200).json({
        success: true,
        results: data,
      });
    } else {
      res.status(500).json({
        success: false,
        results: results,
      });
    }
  });
});

module.exports = router;
