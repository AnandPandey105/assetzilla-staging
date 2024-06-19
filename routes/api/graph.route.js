const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;

var multer  = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './static/my-uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
});
var upload = multer({ storage: storage });

// const {authenticate} = require('../../middlewares/authenticate.middleware');

const Graph = require('../../models/graph.model');

router.post('/multer', upload.array('myfile'), function(req, res) {
    res.send('Done');
  });

// get list of all Graph
router.get('/getAllGraphs', function (req, res) {
    Graph.find({}).then((docs) => { //, {name: 1}
        res.status(200).json({
            success: true,
            message: "Fetched graph's list",
            docs
        });
    }, (e) => {
        console.log('Error Occured', e);
        res.status(501).json({
            success: false,
            message: "Couldnt fetch"
        });
    })
});


// get list of all products
router.post('/getAll', function (req, res) {
    var sortBy = req.body.sortBy;
    var sortForm = req.body.sortForm;
    var count;
    var pageIndex = req.body.pageIndex;
    var recordLimit = req.body.recordLimit;
    var skipRecords = (pageIndex-1)*recordLimit;
    var query = {};
    var mainQuery = {};
    let q = req.body.param;

    if (req.body.hasOwnProperty("param") && q.role.hasOwnProperty("selected") && q.role.selected.length > 0) {
        mainQuery["$and"] = [];
        mainQuery["$and"].push({ "role": new RegExp(q.role.selected, "i") });
    }

    if (req.body.hasOwnProperty("param") && q.search.length > 0) {
        
        query["$or"] = [];
        query["$or"].push({ "name": new RegExp(q.search, "i") });
        query["$or"].push({ "email": new RegExp(q.search, "i") });
        if (!mainQuery.hasOwnProperty("$and")) {
            mainQuery["$and"] = [];
        }

        mainQuery["$and"].push(query);
    }

    // setting sortBy key in sort object as a variable
    let sortObj = {} 
    sortObj[sortBy] = sortForm;
    
    Graph.find(mainQuery).sort(sortObj).skip(skipRecords).limit(recordLimit).then((docs) => {
        Graph.find(query).count().then((doc) => {
            count = doc;
            res.status(200).json({
                success: true,
                message: "Fetched Graph's list",
                count,
                docs,
                mainQuery
            });
        }, (e) => {
            console.log(e);
        })
        
    }, (e) => {
        console.log("Error is",e);
        res.status(501).json({
            success: false,
            message: "Couldnt fetch the Graph's list"
        });
    })
});



module.exports = router;