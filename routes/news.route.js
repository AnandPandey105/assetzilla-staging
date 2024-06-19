const path = require("path");
const moment = require("moment")
Elastic = require("../classes/elasticsearch");
Filters = require("../classes/filters");
Images = require("../classes/images");
Similar = require("../classes/similar");
const News = require("../models/news.model");
const axios = require('axios');
var axiosInstance = axios.create({
  baseURL: process.env.AXIOS_BASE_URL,
  // timeout: 1000,
});
const monthNames = [
  "",
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
var get_date = function (docs) {
  results = [];
  docs.forEach((element) => {
    let d = {};
    if (element.updated) {
      let c = element.updated.split("T")[0];
      d.date = c.split("-")[2];
      d.month = monthNames[parseInt(c.split("-")[1])];
      // console.log(parseInt(c.split("-")[1]),d.month)
      d.year = c.split("-")[0];
    }
    element.updated = d;
    results.push(element);
  });
  return results;
};

var get_publish_date = function (docs) {
  results = [];
  docs.forEach((element) => {
    
    // console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&")
    // console.log(element);
    let eleDate = undefined;
    let full = undefined;
    if (element.publish_date){
      eleDate = new Date(element.publish_date);
      full = eleDate.toDateString();
    }
    let d = {};
    if (element.publish_date) {
      let c = element.publish_date.split("T")[0];
      d.date = c.split("-")[2];
      d.month = monthNames[parseInt(c.split("-")[1])];
      d.year = c.split("-")[0];
    }
    //check if it is empty
    if (Object.keys(d).length !== 0){
      element.publish_date = d;
    }
    if (full){
      element.publish_date.full = full
    }
    results.push(element);
    console.log(element.publish_date)
  });
  return results;
};

const updateSearchHistory = async (urlToStore, req) => {
  let returnObj = {};
  console.log("Saving this search if the user is logged in ....");
  try {
    returnObj = await axiosInstance.post(
      "/api/customer/add_to_search_history",
      {
        url: urlToStore,
        user:
          req.session.user && req.session.user.username
            ? req.session.user.username
            : undefined,
      }
    );
  } catch (err) {
    console.log("Could not update history", err);
  } finally {
    return returnObj;
  }
};

const updateViewHistory = async (urlToStore, req) => {
  try {
    // let urlToStore = `/${entity}/` + req.params.url_name;
    await axiosInstance.post("/api/customer/add_to_view_history", {
      url: urlToStore,
      user:
        req.session.user && req.session.user.username
          ? req.session.user.username
          : undefined,
    });
  } catch (err) {
    console.log("Could not update history", err);
  }
};

module.exports = function (app, express) {
  app.get("/news", async (req, res) => {
    let data = { title: "Real Estate | News" };
    let sort = [{ publish_date: { order: "desc" } }];
    let filters = Filters.news_filter(req.query);
    filters.must.push({ term: { is_live: "2" } });
    await updateSearchHistory(req.originalUrl, req);

    Elastic.get_entities(
      "",
      "news",
      30,
      [
        "news_banner",
        "heading",
        "content",
        "id",
        "updated",
        "url",
        "tags",
        "link",
        "link_name",
        "publish_date",
      ],
      filters,
      0,
      sort
    ).then((resp) => {
      // console.log("get_entities", resp);
      resp.results = Images.news_img_url_list("News", resp.results);
      resp.results = get_date(resp.results);
      data.data = resp;
      Elastic.get_top_entities([{ term: { doc_type: "news" } }, { term: { is_live: "2" } }], "tags").then(
        (resp) => {
          data.popular_tags = resp;
          // console.log("get_top_entities",resp);
          Elastic.get_entities(
            "",
            "news",
            5,
            [
              "news_banner",
              "heading",
              "id",
              "updated",
              "url",
              "tags",
              "link",
              "link_name",
              "publish_date",
            ],
            { should: [], must: [{ term: { is_live: "2" } }] },
            0,
            sort
          ).then((resp) => {
            resp.results = Images.news_img_url_list("News", resp.results);
            resp.results = get_publish_date(resp.results);

            console.log(resp.results[0].publish_date)
            resp.results = get_date(resp.results);
            data.recent_blog = resp.results;
            for (let i = 0; i < data.data.results.length; i++) {
              if ("publish_date" in data.data.results[i]) {
                let eleDate = new Date(data.data.results[i].publish_date);
                data.data.results[i].publish_date = eleDate.toDateString();
              }
            }
            data.hasOtherPage = true;
            // res.render('pages/news-listing', data);
            res.render("pages/v1/news-listing", data);
          });
        }
      );
    });
  });
  app.get("/news/tags/:url_name", async (req, res) => {
    let data = { title: "Real Estate | News" };
    let sort = { publish_date: { order: "desc" } };
    let filter_ = {
      should: [],
      must: [
        { term: { is_live: "2" } },
        { match_phrase: { tags: req.params.url_name } },
      ],
    };
    
    await updateSearchHistory(req.originalUrl, req);

    // console.log("/news/tags/:url_name => ", sort);
    Elastic.get_entities(
      "",
      "news",
      30,
      ["news_banner", "heading", "content", "id", "updated", "url", "publish_date", "link", "link_name"],
      filter_,
      0,
      sort
    ).then((resp) => {
      resp.results = Images.news_img_url_list("News", resp.results);
      resp.results = get_date(resp.results);
      console.log("--------------------")
      // console.log(resp.results[0].publish_date)
      resp.results = get_publish_date(resp.results);
      // console.log(resp.results[0].publish_date)

      data.data = resp;
      Elastic.get_top_entities(
        [{ term: { doc_type: "news" } }, { term: { is_live: "2" } }],
        "tags"
      ).then((resp) => {
        data.popular_tags = resp;
        Elastic.get_entities(
          "",
          "news",
          5,
          ["news_banner", "heading", "id", "updated", "url", "publish_date", "link", "link_name"],
          { should: [], must: [{ term: { is_live: "2" } }] },
          0,
          sort
        ).then((resp) => {
          resp.results = Images.news_img_url_list("News", resp.results);
          resp.results = get_date(resp.results);
          resp.results = get_publish_date(resp.results);
          console.log(resp.results[0].publish_date)
          
          data.recent_blog = resp.results;
          
          data.data.tag_name = req.params.url_name;
          data.hasOtherPage = true;
          console.log("=-=-=-=-=-=-=-=-=-=")
          console.log(data.data.results)
          res.render("pages/v1/news-listing", data);
          // res.render('pages/news-listing', data);
        });
      });
    });
  });
  app.get("/news/:url_name",async (req, res) => {
    var data = { title: "Real Estate | Article " };
    let sort = [{ publish_date: { order: "desc" } }];

    try{
    const success = await axiosInstance.post('/api/news/update_views', {url:"/news/" + req.params.url_name})
    await updateViewHistory(req.originalUrl, req);
    // console.log(success.data);
    // console.log(req.params.url_name)
    if (success.data.success){
      News.findOne({ url: "/news/" + req.params.url_name })
        .then((doc) => {
          if (doc) {
            data.data = doc._doc;
            data.data.updated = {
              date: data.data.updated.getDate(),
              year: data.data.updated.getFullYear(),
              month: monthNames[data.data.updated.getMonth()],
            };
            if ("publish_date" in data.data) {
              let eleDate = new Date(data.data.publish_date);
              // data.data.publish_date = eleDate.toString();
              let showUTC = moment(eleDate).format("hh") === "00"
              data.data.publish_date = moment(eleDate).utc(showUTC).format("ddd MMM DD YYYY");
            }
            if ("video" in data.data) {
              if (data.data.video.includes("youtube")) {
                data.data.video = data.data.video.replace("watch?v=", "embed/");
              }
            }
            Elastic.get_top_entities(
              [{ term: { doc_type: "news" } }, { term: { is_live: "2" } }],
              "tags"
            ).then((resp) => {
              data.popular_tags = resp;
              Elastic.get_entities(
                "",
                "news",
                5,
                ["news_banner", "heading", "id", "updated", "url", "publish_date",],
                { should: [], must: [{ term: { is_live: "2" } }] },
                0,
                sort
              ).then((resp) => {
                resp.results = Images.news_img_url_list("News", resp.results);
                // resp.results = get_date(resp.results);
                resp.results = get_publish_date(resp.results);

                data.recent_blog = resp.results;
                data.hasOtherPage = true;
                data.views = success.data.views
                res.render("pages/v1/news", data);
                // res.render('pages/news', data);
              });
            });
          } else {
            res.redirect("/page-not-found");
          }
        })
        .catch((e) => {
          console.log("Error while fetching the url", url_name);
          console.log(e);
          res.redirect("/page-not-found")
        });
    } else {
      console.log("Error while fetching the url", req.params.url_name);
      res.redirect("/page-not-found")
    }
  } catch (e) {
    console.log("Error while fetching the url", req.params.url_name);
    console.log(e);
    res.redirect("/page-not-found")
  }
  });
};
