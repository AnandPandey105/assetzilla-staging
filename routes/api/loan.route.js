const express = require('express');
const router = express.Router();
AlphaId = require('../../classes/alphaId');
Elastic = require('../../classes/elasticsearch');

const Loan = require('../../models/loan.model');

router.post("/add", function (req, res) {
    console.log('req body', req.body); 
    let data = req.body
    let date = new Date();
    let id = AlphaId.encode(date.getTime());
    data.id = id
    
    var loan = new Loan();
    Object.assign(loan, data);
    loan.save().then((doc) => {
        console.log('Loan data saved succesfully')
        res.status(200).json({
                    success: true,
                    message: "Your loan details has been submitted. Our team will contact you shortly."
                });

    }, (e) => {
        console.log('Error occured', e);
        res.status(200).json({
            success: false,
            message: "Couldn't save loan request"
        });
    })
});

module.exports = router;