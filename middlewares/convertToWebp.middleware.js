const webp = require("promised-webp-converter");
const fs = require("fs")
webp.grant_permission();

const convertToWebp = async (fileName, toDirectory = "./") => {
  console.log("Now converting ...");
  let fn = fileName.split(".")[1].split("/")[2];
  console.log(fileName.split("."));
  const result = await webp.cwebp(
    fileName,
    `${toDirectory}${fn}.webp`,
    "-q 80",
  );
  return {success:true, result}
};


const convertToWebpImageMiddleware = async function (req, res, next) {
  console.log(req.files);

  let newFiles = [];
  for (const img of req.files) {
    try {
      const response = await convertToWebp(
        `./uploads/${img.filename}`,
        `./uploads/webp/`
      );
      console.log(response);
      img.filename = img.filename + ".webp";
      img.path = `uploads/webp/${img.filename}`;
      img.mimetype = "image/webp";
      let imgInfo = fs.statSync(img.path);
      img.size = imgInfo.size;
      img.converted = true;
      img.destination = "./uploads/webp";
      // console.log(imgInfo);
      console.log(img);
      newFiles.push(img);
    } catch (e) {
      console.log("Error occurred while converting images to webp ", e);
      console.log("uploading original file");
      img.converted = false
      newFiles.push(img);
    }
  }
  req.files = newFiles;
  console.log(req.files);
  next();
};
module.exports = { convertToWebpImageMiddleware };
