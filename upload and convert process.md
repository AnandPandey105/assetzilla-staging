1. When the file is received, save it on the local storage on the server
2. Retrieve the file present in the local storage with either png or jpeg extension and convert it to a webp format
3. take the new webp format and upload it to the aws s3 server.
4. After successfull upload, delete the png/jpeg and webp file from the local storage
5. continue with the flow of saving the image names and corresponding data into the database.

---

1. Receive the images and upload them as is to the old s3 bucket
2. download the image back from s3 on local storage of server
3. convert it to the webp format
4. save the new webp format to new bucket of s3
5. after succesfull upload delete the old png/jpeg file which was downloaded from old s3 bucket from local storage
6. continue the flow of saving the image names and corresponding data into the database
