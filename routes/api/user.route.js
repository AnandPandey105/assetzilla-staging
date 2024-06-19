// user.route.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
var ObjectId = require('mongoose').Types.ObjectId;
const jwt = require('jsonwebtoken');
const Role = require('../../_helpers/role');
const config = require('../../_helpers/config.json');

const Subcity = require("../../models/subcity.model");
const City = require("../../models/city.model")
const District = require("../../models/district.model")
const State = require("../../models/state.model")

// const authenticate = require('../../middlewares/authenticate.middleware');

const User = require('../../models/user.model');

router.post('/authenticate', (req, res) => {
    res.send({
        'success': true,
        'msg': 'User successfully logged in'
    });
});

// signup
router.post('/createUser', function (req, res) {
    var newPassword = req.body.pwd;
    var newEmailId = req.body.email.toLowerCase();
    bcrypt.hash(newPassword, 10, function (err, hash) {
        if (err) {
            console.log("err", err)
            return res.status(500).json({
                error: err
            });
        }
        else {
            let data = {
                // _id: new  mongoose.Types.ObjectId(),
                email: newEmailId,
                name: req.body.name,
                password: hash,
                role: req.body.role,
                locationAccess: req.body.locationAccess,
                propertyTypeAccess : req.body.propertyTypeAccess
                // created = new Date()
            }
            if (!data.locationAccess || data.locationAccess.length === 0){
                data.locationAccess = [{
                    locationAccessLevel: "FULL ACCESS",
                    locationAccessValue: "FULL ACCESS",
                },]
            }
            if (!data.propertyTypeAccess || data.propertyTypeAccess.length === 0){
                data.propertyTypeAccess = [{
                    propertyTypeAccessLevel: "FULL ACCESS",
                    propertyTypeAccessValue: "FULL ACCESS",
                },]
            }
            const user = new User(data);
            user.save().then(function (result) {
                res.status(200).json({
                    success: true,
                    message: "New user has been created"
                });
            }).catch(error => {
                console.log("error", error)
                res.status(200).json({
                    success:false,
                    error: error
                });
            });
        }
    });
});

// signin
router.post('/signin', function (req, res) {
    var emailId = req.body.email.toLowerCase();
    User.findOne({ email: emailId })
        .exec()
        .then(function (user) {
            bcrypt.compare(req.body.password, user.password, function (err, result) {
                if (err) {
                    return res.status(401).json({
                        success: false,
                        message: 'Unauthorized Access'
                    });
                }
                else if (result) {
                    const JWTToken = jwt.sign({
                        email: user.email,
                        _id: user._id
                    },
                        config.secret,
                        {
                            expiresIn: '2h'
                        });
                    return res.status(200).json({
                        success: true,
                        message: 'Succesfully logged in',
                        role: user.role,
                        token: JWTToken,
                        user: user.email
                    });

                    // return res.status(200).json({
                    //     success: true,
                    //     message: 'Succesfully logged in'
                    // });
                } else {
                    res.json({
                        success: false,
                        message: 'Username or password does not match.'
                    });
                }
                
            });
        })
        .catch(error => {
            res.json({
                success: false,
                message: 'Username or password does not match.'
            });
        });;
});

router.get('/getRoles', (req, res) => {
    return res.status(200).json({
        success: true,
        message: 'Succesfully fetched roles',
        roles: config.roles
    });
})

// get list of all products
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

    User.find(mainQuery, { 'password': 0 }).sort(sortObj).skip(skipRecords).limit(recordLimit).then((docs) => {
        User.find(query).count().then((doc) => {
            count = doc;
            res.status(200).json({
                success: true,
                message: "Fetched User's list",
                count,
                docs,
                mainQuery
            });
        }, (e) => {
            console.log(e);
        })

    }, (e) => {
        console.log("Error is", e);
        res.status(501).json({
            success: false,
            message: "Couldnt fetch the User's list"
        });
    })
});

// update the product
router.post('/edit', function (req, res) {
    console.log(req.body)
    var data = {}
    data.name = req.body.user.name,
    data.email = req.body.user.email,
    data.role = req.body.user.role;
    data.locationAccess = req.body.user.locationAccess;
    data.propertyTypeAccess = req.body.user.propertyTypeAccess;
    console.log(data)
    if ('pwd' in req.body.user) {
    var password = req.body.user.pwd
        bcrypt.hash(password, 10, function (err, hash) {
            if (err) {
                return res.status(500).json({
                    error: err
                });
            }
            else {
                data.password = hash;
                User.findOneAndUpdate({
                    _id: ObjectId(req.body.user._id)
                }, {
                    $set: data
                }).then((doc) => {
                    res.status(200).json({
                        success: true,
                        message: "User updated successfully"
                    });
                }, (e) => {
                    res.status(501).json({
                        success: false,
                        message: "Couldnt update the User."
                    });
                });
            }
        });
    }
    else{
        User.findOneAndUpdate({
            _id: ObjectId(req.body.user._id)
        }, {
            $set: data
        }).then((doc) => {
            res.status(200).json({
                success: true,
                message: "User updated successfully"
            });
        }, (e) => {
            res.status(501).json({
                success: false,
                message: "Couldnt update the User."
            });
        });
    }


});

// delete a user
router.post('/delete', function (req, res) {
    User.findOneAndDelete({
        _id: ObjectId(req.body.user._id)
    }).then((doc) => {
        res.status(200).json({
            success: true,
            message: "User successfully deleted"
        });
    }, (e) => {
        res.status(501).json({
            success: false,
            message: "Couldnt delete the User"
        });
    })
});

router.post('/checkLogin', (req, res) => {
    token = req.body.token
    jwt.verify(token, "somesecretkeyishere", function (err, decoded) {
        if (err) {
            res.send({
                "success": false,
            })

        } else {
            res.send({ "success": true })

        }
    })
})

router.post('/location-wise-access', async (req, res)=>{
    try{
        let states = await State.find({},{name:1, _id:0});
        let cities = await City.find({},{name:1, _id:0});
        let districts = await District.find({},{name:1, _id:0});
        let subcities = await Subcity.find({},{name:1, _id:0});

        states = states.map((location)=>location.name);
        cities = cities.map((location)=>location.name);
        subcities = subcities.map((location)=>location.name);
        districts = districts.map((location)=>location.name);

        let dataToSend = {
            State: states,
            City: cities,
            District: districts,
            Subcity: subcities
        }

        res.status(200).json({
            success:true,
            data:dataToSend
        })

    } catch(e){
        console.log("Error while fetcing location wise object", e);
        res.status(200).json({
            success:false,
            msg:"Error while fetcing location wise object"
        })
    }
})

module.exports = router;