const webp = require("promised-webp-converter");
webp.grant_permission();

const convertToWebp = async (fileName, toDirectory = "./", index=2) => {
  console.log("Now converting ...");
  console.log(fileName)
  let fn = fileName.split(".")[1].split("/")[index];
  console.warn(fn)
  console.log(fileName.split("."));
  const result = await webp.cwebp(
    fileName,
    `${toDirectory}${fn}.webp`,
    "-q 80",
  );
  return {success:true, result, fn}

  



  // .then((response) => {
  //   console.log("---------------");
  //   console.log(`Successfully converted ${fileName} to webp`, response);
  //   return { success: "true" };
  // })
  // .catch((e) => {
  //   console.log("<>><<<><><><><><><><");
  //   console.error(`Error occured while converting ${fileName} to webp`, e);
  //   return {e:e, success:false};
  // });
};
// convertToWebp("builder_1506954582.jpg", "./webp/").then();
module.exports = { convertToWebp };
