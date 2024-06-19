// user.route.js

const express = require('express');
const router = express.Router();
Images = require('../../classes/images');
Filters = require('../../classes/filters');
const mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;

const Mailer = require('../../models/mailer.model');
require("../../classes/mailin");
var client = new Mailin("https://api.sendinblue.com/v2.0", "w5gJTHtF02aSzsVW");

router.post("/add", function (req, res) {
    let data = req.body;
    var mailer = new Mailer();
    Object.assign(mailer, data);
    mailer.save().then((doc) => {
        res.status(200).json({
            success: true,
            message: "New Inquiry has been saved"
        });
    }, (e) => {
        console.log('Error occured', e);
        res.status(200).json({
            success: false,
            message: "Couldn't save new inquiry"
        });
    })
})

router.post('/sendResponse', function (req, res) {
    if ('name' in req.body) { var name = req.body.name; }
    if ('email' in req.body) { var email = req.body.email; }
    if ('phone' in req.body) { var phone = req.body.phone; }

    var data = {
        "to": { [email]: name },
        "cc": { "test@startupflux.com": "Test" },
        "from": ["ekansh@startupflux.com", "Ekansh"],
        "subject": "Your Enquiry @ AssetZilla",
        "html": "<div><h1 style='text-align:center'>Submitted query</h1> <br>Full Name - " + name + "<br>Email - " + email + "<br>Phone - " + phone + "<br>About - " + "<br><p>Thank you for submitting a request on AzzetZilla.</p></div>",
        "headers": { "Content-Type": "text/html;charset=iso-8859-1" },
    }
    client.send_email(data).on('complete', function (resp) {
    });
});

module.exports = router;