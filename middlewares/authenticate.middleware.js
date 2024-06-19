var jwt = require('jsonwebtoken');
const config = require('../_helpers/config.json');

var authenticate = function (req, res, next) {
    var token =  req.headers['authorization'];

    if (token) {
        jwt.verify(token, config.secret, function (err, decoded) {
            if (err) {
                res.status(401).json({ success: false, message: 'Token invalid' });
                
            } else {
                req.user = decoded;
                next();
            }
        })
    } else  {
        res.status(403).json({ success: false, message: 'No token provided'});
        // 
    }
};

module.exports = {authenticate};