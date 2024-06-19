const mongoose = require("mongoose");
const News = require("../models/news.model");
const fs = require('fs');

mongoose.connect("mongodb://localhost:27017/realestate", {useNewUrlParser: true, useUnifiedTopology: true,});
mongoose.connection.on("error", console.error.bind(console, "connection error:"));
mongoose.connection.once("open", () => {console.log("************************************************Database Connected to realestate");});

const getData = async ()=>{
    let data = await News.find({});
    return data;
}

getData().then((resp)=>{
    mongoose.connection.close();
    console.log("************************************************Connection closed to realestate");
    // console.log(resp);
    let reqdData = [];
    resp.forEach((article, index)=>{
        let data = {id:'', heading:'', tags:[]}
        data.id = article._id;
        data.heading =  article.heading;
        data.tags = article.tags;
        data.is_live = article.is_live;
        reqdData.push(data);
    });
    console.table(reqdData);
    exportJson(reqdData, 'newsCapitalize.json')
});



const exportJson = (data, fn) => {
    let jsonString = JSON.stringify(data);    

    fs.writeFile(`./${fn}`, jsonString, err => {
        if (err) {
            console.log('Error writing file', err)
        } else {
            console.log('Successfully wrote file')
        }
    });
}