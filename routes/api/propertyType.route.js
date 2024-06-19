const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;

// const {authenticate} = require('../../middlewares/authenticate.middleware');

const PropertyType = require('../../models/propertyType.model');

// get list of all properties
router.get('/getAllGetAllPropertyTypes', function (req, res) {

    PropertyType.find({}, {name: 1}).then((docs) => {

        res.status(200).json({
            success: true,
            message: "Fetched projectType's list",
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

module.exports = router;