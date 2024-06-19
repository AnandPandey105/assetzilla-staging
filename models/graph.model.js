const mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

const GraphSchema = mongoose.Schema({
   id: {type: String, required: true, unique: true}
});

module.exports = mongoose.model('Graph', GraphSchema);