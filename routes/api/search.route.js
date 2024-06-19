const express = require('express');
const router = express.Router();
Elastic = require('../../classes/elasticsearch');
router.post('/v1', function (req, res) {
    var filter_ = [{ "term": { "is_live": "2" } }]
    results=Elastic.query_typeahead(req.body.data,filter_);
    results.then((data)=>{
    if (results){
        res.status(200).json({
            success: true,
            results: data
        });
    }
    else{
        res.status(500).json({
            success: false,
            results: results
        });
    }
    })
    
});

module.exports = router;