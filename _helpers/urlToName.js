const capitalize = (str) => {
  if (str && str !== "") return str[0].toUpperCase() + str.slice(1);
  else return "";
};
const removePercent20 = (str) => {
  while (str.includes("%20")) {
    str = str.replace("%20", " ");
  }
  if (str.includes(",")) str = replaceComma(str);
  return str;
};
const replaceComma = (str) => {
  while (str.includes(",")) {
    str = str.replace(",", "| ");
  }
  while (str.includes("|")) {
    str = str.replace("|", ",");
  }
  return str;
};

const urlToName = (url) => {
  // console.log(url.split("?"));
  let returnStr = 'not set';
  if (url.includes('sellyourproperty')){
    returnStr = 'Sell Your Property';
  } else if (url === '/results?q='){
    returnStr = 'All results';
  } else if (url.split("?").length === 1 && !url.includes("/news/tags/")) {
    return "All " + capitalize(url.split("/")[1]);
  } else if (url.split("?").length === 1 && url.includes("/news/tags/")) {
    if (url.split("?")[0].split("/").length > 1 && url.split("?")[0].split("/")[1] === "news" && url.split("?")[0].split("/")[2] === "tags" )
      returnStr = "News " + "in " + url.split("?")[0].split("/")[3] + " tag";
  } else if (
    url.split("?").length === 2 &&
    url.split("?")[1] === "view=partial"
  ) {
    return "All " + capitalize(url.split("/")[1].split("?")[0]);
  } else {
    let prefix = url.split("?")[0].split("/")[1] + " in ";
    if (url.split("?")[0].split("/")[1] === "results")
      prefix = "Properties or Projects" + " in ";
    let priceString = "";

    let strToConstruct = url.split("?")[1];

    strToConstruct = strToConstruct.split("&");

    let constructedStr = "";
    if (prefix.includes("builders")) {
      prefix = "Builders ";
      for (let i = 0; i < strToConstruct.length; i++) {
        let individualFilter = strToConstruct[i].split("=");
      if (individualFilter[0] === "presence")
        constructedStr =
          constructedStr +
          " present in " +
          removePercent20(individualFilter[1]);
      if (individualFilter[0] === "type")
        constructedStr =
          constructedStr + " of " + removePercent20(individualFilter[1]);
      if (individualFilter[0] === "status")
        constructedStr =
          constructedStr +
          " with " +
          removePercent20(individualFilter[1]) +
          " Status";

      // console.log(constructedStr);
      }
    } 
    else {
      for (let i = 0; i < strToConstruct.length; i++) {
        let individualFilter = strToConstruct[i].split("=");
        if (individualFilter[0] === "view") {
          //do nothing
        } else if (individualFilter[0] === "type") {
          if (!prefix.includes("banks") && !prefix.includes("builders"))
            prefix = removePercent20(individualFilter[1]) + " in ";
          else if (prefix.includes("banks")) {
            prefix = "";
            constructedStr = removePercent20(individualFilter[1]) + " Banks";
            // console.log(constructedStr);
          } else {
            constructedStr +=
              removePercent20(individualFilter[1]) +
              " " +
              (individualFilter[0] !== "q"
                ? capitalize(individualFilter[0])
                : "") +
              " ";
          }
        } else if (individualFilter[0] === "location_type") {
          prefix = individualFilter[1]+" ";
        } else if (individualFilter[0] !== "price") {
          constructedStr +=
            removePercent20(individualFilter[1]) +
            " " +
            (individualFilter[0] !== "q"
              ? capitalize(individualFilter[0])
              : "") +
            " ";
        } else if (individualFilter[0] === "price") {
          priceString =
            " in the budget of " + removePercent20(individualFilter[1]);
        }
      }
    }
    let name = capitalize(prefix);
    if (
      constructedStr === "" &&
      !prefix.includes(url.split("?")[0].split("/")[1])
    ) {
      constructedStr = capitalize(url.split("?")[0].split("/")[1]);
    }
    // console.log(name + constructedStr + priceString);
    if (returnStr === 'not set'){
      returnStr = name + constructedStr + priceString;
    }
  }
  return returnStr;
};

module.exports = {
  urlToName,
  removePercent20,
  replaceComma
};
