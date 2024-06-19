const mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

const PropertyTypeSchema = mongoose.Schema({
   id: {type: String, required: true, unique: true}
});

module.exports = mongoose.model('Property_Type', PropertyTypeSchema);