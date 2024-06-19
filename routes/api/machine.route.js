// user.route.js

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;

// const {authenticate} = require('../middlewares/authenticate.middleware');

const Machine = require('../models/machine.model');

// add a new Machine
router.post('/add', function (req, res) {
    console.log('req.body', req.body);
    var machine = new Machine();

    machine.name = req.body.machine.name;
    machine.desc = req.body.machine.desc;
    machine.locations = req.body.locations;
    machine.save().then((doc) => {
        res.status(200).json({
            success: true,
            message: "Added new machine"
        });
    }, (e) => {
        console.log('Error occured', e);
        res.status(200).json({
            success: false,
            message: "Couldn't add new machine"
        });
    })

});

// update the Machine
router.post('/edit', function (req, res) {
    console.log("body is", req.body);

    Machine.findOneAndUpdate({
        _id: ObjectId(req.body.machine._id)
    }, {
            $set: {
                "name": req.body.machine.name,
                "desc": req.body.machine.desc,
                "locations": req.body.locations
            }
        }).then((doc) => {
            console.log('updated doc', doc);
            res.status(200).json({
                success: true,
                message: "New Machine saved successfully",
                doc
            });
        }, (e) => {
            res.status(501).json({
                success: false,
                message: "Couldnt update the Machine."
            });
        });
});

// delete a Machine
router.post('/delete', function (req, res) {
    console.log(req.body);
    Machine.findOneAndDelete({
        _id: ObjectId(req.body.machine._id)
    }).then((doc) => {
        console.log('deleted doc is ', doc);
        res.status(200).json({
            success: true,
            message: "Machine successfully deleted"
        });
    }, (e) => {
        res.status(501).json({
            success: false,
            message: "Couldnt delete the Machine"
        });
    })
});


router.post('/getMachinesByLocation', function (req, res) {
    console.log(req.body.param);
    Machine.find({ 'locations': { '$elemMatch': { 'name': req.body.param } } }).then((docs) => {
        res.status(200).json({
            success: true,
            message: "Fetched all data",
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

// get list of all machines
router.post('/getAll', function (req, res) {
    var sortBy = req.body.sortBy;
    var sortForm = req.body.sortForm;
    var count;
    var pageIndex = req.body.pageIndex;
    var recordLimit = req.body.recordLimit;
    var skipRecords = (pageIndex - 1) * recordLimit;

    var query = {};
    var mainQuery = {};
    let q = req.body.param;

    if (req.body.hasOwnProperty("param") && q.location.hasOwnProperty("selected") && q.location.selected.length > 0) {
        mainQuery["$and"] = [];
        mainQuery["$and"].push({ 'locations': { '$elemMatch': { 'name': q.location.selected } } });
    }

    if (req.body.hasOwnProperty("param") && q.search.length > 0) {
        query["$or"] = [];
        query["$or"].push({ "name": new RegExp(q.search, "i") });
        query["$or"].push({ "desc": new RegExp(q.search, "i") });
        if (!mainQuery.hasOwnProperty("$and")) {
            mainQuery["$and"] = [];
        }

        mainQuery["$and"].push(query);
    }

    // setting sortBy key in sort object as a variable
    let sortObj = {} 
    sortObj[sortBy] = sortForm;

    Machine.find(mainQuery).sort(sortObj).sort({ '_id': -1 }).skip(skipRecords).limit(recordLimit).then((docs) => {
        Machine.find(mainQuery).count().then((doc) => {
            console.log("count is", doc);
            count = doc;
            res.status(200).json({
                success: true,
                message: "Fetched machine's list",
                count,
                docs
            });
        }, (e) => {
            console.log(e);
        })
        // res.status(200).json({
        //     success: true,
        //     message: "Fetched all data",
        //     docs
        // });
    }, (e) => {
        console.log('Error Occured', e);
        res.status(501).json({
            success: false,
            message: "Couldnt fetch"
        });
    })
});


// router.post('/getAllByFilter', function (req, res) {
//     console.log("body is", req.body);
//     var count;
//     var pageIndex = req.body.pageIndex;
//     var recordLimit = req.body.recordLimit;
//     var skipRecords = (pageIndex - 1) * recordLimit;
//     query = {};
//     let q = req.body.param;
//     Machine.find({ 'locations': { '$elemMatch': { 'name': q.location.selected } } }).sort({ '_id': -1 }).skip(skipRecords).limit(recordLimit).then((docs) => {
//         console.log('docs are ', docs);
//         Machine.find(query).count().then((doc) => {
//             console.log("count is", doc);
//             count = doc;
//             res.status(200).json({
//                 success: true,
//                 message: "Fetched Machine's list",
//                 count,
//                 docs
//             });
//         }, (e) => {
//             console.log(e);
//         });
//     }, (e) => {
//         res.status(501).json({
//             success: false,
//             message: "Couldnt fetch Ticket list"
//         });
//     })
// });

module.exports = router;