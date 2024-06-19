const fs = require("fs")

module.exports.uploadToS3 = async (req, res, next) => {
  console.log("<><><><><><><><><><><><><><><><><><><>");
  console.log(req.files);
  var date = new Date();
  let newReqFiles = [];
  for (const file of req.files) {
    let key =
      `dyn-res/${file.entity}/${file.entity==="property"||file.entity==="project" ? 'image/' : ''}` +
      `${file.entity}_` +
      date.getTime().toString() +
      Math.floor(Math.random() * 1000000).toString() +
      "." +
      (file.converted
        ? "webp"
        : file.originalname.split(".")[
            file.originalname.split(".").length - 1
          ]);
    console.log(key);
    var params = {
      ACL: "public-read",
      Body: file.converted
        ? fs.createReadStream(`./uploads/webp/${file.filename}`)
        : fs.createReadStream(`./uploads/${file.filename}`),
      Bucket: "assetzilla-bucket",
      Key: key,
    };
    await s3
      .putObject(params)
      .promise()
      .then(async (data) => {
        console.log(data);
        newReqFiles.push({ key });
        try {
          fs.unlinkSync(`uploads/${file.filename.split(".")[0]}`);
          fs.unlinkSync(`uploads/webp/${file.filename}`);
        } catch (error) {
          console.error("Error while deleting files", error);
        }
      })
      .catch((r) => {
        console.error(r);
        try {
          fs.unlinkSync(`uploads/${file.filename.split(".")[0]}`);
          fs.unlinkSync(`uploads/webp/${file.filename}`);
        } catch (error) {
          console.error("Error while deleting files", error);
        }
      });
  }
  req.files = newReqFiles;
  console.log("<><><><><><><><><><><><><><><><><><><>");
  next();
};
