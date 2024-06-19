const is_bookmarked = function (url, req) {
  if (req.session.user) {
    if (req.session.user.bookmark.findIndex((i) => i.url === url) > -1) {
      return true;
    } else {
      return false;
    }
  }
  return false;
};
const is_bookmarked_list = function (results, req) {
  results = results.map((pEntity) => {
    pEntity.is_bookmarked = is_bookmarked(pEntity.url, req);
    return pEntity;
  });
  return results;
};

module.exports = {
  is_bookmarked,
  is_bookmarked_list,
};
