const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const fs = require('fs');

// mongoose.connect("mongodb://realestate:rEAleStAtepWd91608102022@3.87.184.6:27017/realestate?authSource=realestate&w=1&tls=false", {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.connect("mongodb://localhost:27017/realestate", {useNewUrlParser: true, useUnifiedTopology: true,});
mongoose.connection.on("error", console.error.bind(console, "connection error:"));
mongoose.connection.once("open", () => {console.log("************************************************Database Connected to realestate");});

const getData = async ()=>{
    let data = await Customer.find({});
    return data;
}

getData().then((resp)=>{
    mongoose.connection.close();
    console.log("************************************************Connection closed to realestate");
    // console.log(resp);
    let reqdData = [];
    resp.forEach((customer, index)=>{
        let submittedPropertiesArray = customer.submitted_property;
        for (const element of submittedPropertiesArray){
            element.phoneNumber = element.username;
            element.username = customer.username;
            reqdData.push(element);
        }
        
    });
    console.table(reqdData);
    exportJson(reqdData, 'userSubmittedProperties.json')
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