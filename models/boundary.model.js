const mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

const BoundarySchema = mongoose.Schema({
    id: { type: String, required: true },
    location_type: { type: String, required: true},
    boundary : {type : Array},
    geoJSON: {
    	type: Object
    }
}, { collection: 'boundary_data' });

module.exports = mongoose.model('Boundary', BoundarySchema);