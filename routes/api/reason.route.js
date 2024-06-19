const express = require('express');
const router = express.Router();
const ReWork = require('../../models/rework.model');
router.post('/get', function (req, res) {
    ReWork.find({ entity: req.body.entity.toLowerCase(), id: req.body.id }).then((doc) => {
        results=[];
        doc.forEach(element => {
            results.push({ reason: element.reason, time: element.created.toLocaleDateString("en-US")})    
        });
        res.status(200).json({
            success: true,
            results: results
        });
    })

});

module.exports = router;