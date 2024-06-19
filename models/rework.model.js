const mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

const ReWorkSchema = mongoose.Schema({
    entity: { type: String, required: true },
    id: { type: String, required: true },
    reason: { type: String, required: true },
    created: { type: Date, default: Date.now },
    
}, { collection: 'rework' });

module.exports = mongoose.model('ReWork', ReWorkSchema);