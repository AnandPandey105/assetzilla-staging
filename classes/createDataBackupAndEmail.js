const moment = require("moment-timezone");
const spawn = require("child_process").spawn;
const fs = require("fs");
const { google } = require("googleapis");
const appconstants = require("../appConstants");
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport(appconstants.nodemailerAuth);

let createBackupNow = false;

const fileNameOfBackup = "../realestate";
let folderNameOfBackup = moment(Date.now()).tz("Asia/Kolkata").format("YYYY MM DD hh:mm A");
console.log("Setting Foldername as : ", folderNameOfBackup)

const GOOGLE_API_FOLDER_ID = "1DRIo09cJLK1X0GgTC9DWoijAEbuYNHSE";

const createMongoDump = async () => {
  console.log("Running mongodump...");
  let backupProcess = spawn("mongodump", [
    "--uri",
    "mongodb://realestate:rEAleStAtepWd91608102022@3.87.184.6:27017/realestate?authSource=realestate&w=1&tls=false",
    `--out=${fileNameOfBackup}`,
  ]);
    // let backupProcess = spawn("mongodump", [
    //   "--db=realestate",
    //   `--out=${fileNameOfBackup}`,
    // ]);
  backupProcess.stdout.on("data", (data) => {
    console.log(data);
  });
  backupProcess.on("exit", (code, signal) => {
    if (code) console.log("**mongodump process exited with code ", code);
    else if (signal)
      console.log("**mongodump process was killed with singal ", signal);
    else {
      console.log("**mongodump process successful");
      zipIt();
    }
  });
};

const zipIt = async () => {
  console.log("Now Zipping the dump...");
  let zippingProcess = spawn("zip", [
    "-r",
    `${fileNameOfBackup}.zip`,
    `${fileNameOfBackup}`,
  ]);
  zippingProcess.on("exit", async (code, signal) => {
    if (code) console.log("**zipping process exited with code ", code);
    else if (signal)
      console.log("**zipping process was killed with singal ", signal);
    else {
      console.log("**Successfully zipped the database");
      await deleteBackupFolder(true);
    }
  });
};

const deleteBackupFolder = async (folder = true) => {
  console.log(
    `now deleting the backup ${folder ? "folder" : "zip"} ... with rm -r`,
    fileNameOfBackup,
    `${folder ? "" : ".zip"}`
  );
  let removingProcess = spawn("rm", [
    "-r",
    `${fileNameOfBackup}${folder ? "" : ".zip"}`,
  ]);
  removingProcess.on("exit", async (code, signal) => {
    if (code) console.log("**Deleting process exited with code ", code);
    else if (signal)
      console.log("**Deleting process was killed with singal ", signal);
    else {
      console.log("**Successfully deleted the database folder");
      if (folder) await uploadToGoogleDrive();
    }
  });
};

const uploadToGoogleDrive = async () => {
  console.log("now uploading the folder to Google Drive...");
  folderNameOfBackup = moment(Date.now()).tz("Asia/Kolkata").format("YYYY MM DD hh:mm A");
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: createBackupNow
        ? "./googleDrive.json"
        : "classes/googleDrive.json",
      scopes: ["https://www.googleapis.com/auth/drive"],
    });
    const driveService = google.drive({
      version: "v3",
      auth,
    });

    const folderMetaData = {
      name: `${folderNameOfBackup}`,
      parents: [GOOGLE_API_FOLDER_ID],
      mimeType: "application/vnd.google-apps.folder",
    };

    let folderId = "";
    await driveService.files
      .create({
        resource: folderMetaData,
        fields: "id",
      })
      .then(async (response) => {
        console.log(response.data.id);
        folderId = response.data.id;
      });

    const fileMetaData = {
      name: `${fileNameOfBackup}`,
      parents: [folderId],
    };
    const media = {
      mimeType: "application/zip",
      body: fs.createReadStream(`./${fileNameOfBackup}.zip`),
    };

    await driveService.files
      .create({
        resource: fileMetaData,
        media: media,
        fields: "id",
      })
      .then(async (response) => {
        console.log(response.data);
        await deleteBackupFolder(false);
        if (process.env.STAGING === 'false'){
          await sendEmail({ success: true, folderId });
        }
      });
  } catch (e) {
    console.log("**Ran into error while uploading backup to google drive", e);
  }
};

const sendEmail = async ({ success, folderId }) => {
  try {
    console.log("Now sending emails...");
    if (success) {
      console.log("Sending Success Email");
      var mailOptions = {
        from: appconstants.emailFrom,
        to: "udit.sharma_1989@yahoo.com, apoorvbarwa666@gmail.com, sonalikul1999@gmail.com, nayan14jain@gmail.com",
        subject: `Data Backup Successfull for ${folderNameOfBackup}`,
        html: `Data backup was successfull, here is the <a href="https://drive.google.com/drive/folders/${folderId}">link</a> to the drive folder`,
      };
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log("Error sending email ", error);
        } else {
          console.log("Email sent successfully: " + info.response);
        }
      });
    }
    console.log("**********************Backup process complete.");
  } catch (er) {
    console.log("**********************Backup process completed but email was not sent");
  }
};

const initiateBackup = async (now) => {
  console.log("**********************Initiating Backup...");
  if (now) createBackupNow = true;

  //1. creating a mongodump of the current database
  await createMongoDump();
  //2. Zipping the dump
  //3. upload the zipped dump to the google drive
  //4. send the email of data backup
};

module.exports = { initiateBackup };
