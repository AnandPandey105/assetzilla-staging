const BASE_URL = process.env.CURRENT_IMAGE_BASE_URL;
var mapping_images = {
  Properties: "/property/image/",
  Projects: "/project/image/",
  Builders: "/builder/",
  Banks: "/bank/",
  Authorities: "/authority/",
  Cities: "/city/",
  Districts: "/district/",
  Subcities: "/subcity/",
  States: "/state/",
  News: "/news/",
};
var banner_img_url = function (doc) {
  if (doc) {
    if (doc && doc[1] === null) {
      return "/images/placeholder_bg.webp";
    } else if (doc[0] in mapping_images) {
      return BASE_URL + mapping_images[doc[0]] + doc[1];
    } else {
      return "/images/placeholder_bg.webp";
    }
  } else {
    return "/images/placeholder_bg.webp";
  }
};
var get_image_url = function (doc) {
  images = [];
  if ("images" in doc) {
    Object.keys(doc.images).forEach(function (key) {
      if (key in mapping_images) {
        doc.images[key].forEach((image) => {
          images.push(BASE_URL + mapping_images[key] + image);
        });
      }
    });
    doc.images = images;
  }
  return doc;
};
var get_image_url_list = function (docs) {
  result = [];
  docs.forEach((element) => {
    element = get_image_url(element);
    result.push(element);
  });
  return result;
};

var banner_img_url_list = function (docs) {
  result = [];
  docs.forEach((element) => {
    element.banner_image = banner_img_url(element.banner_image);
    result.push(element);
  });
  return result;
};
var logo_img_url_list = function (docs, entity) {
  result = [];
  docs.forEach((element) => {
    element.logo = banner_img_url([entity, element.logo]);
    result.push(element);
  });
  return result;
};
var news_img_url_list = function (entity, docs) {
  result = [];
  docs.forEach((element) => {
    element.news_banner = banner_img_url([entity, element.news_banner]);
    result.push(element);
  });
  return result;
};
module.exports = {
  BASE_URL,
  banner_img_url,
  banner_img_url_list,
  logo_img_url_list,
  get_image_url,
  news_img_url_list,
  get_image_url_list,
};
