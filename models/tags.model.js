const mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

const TagsSchema = mongoose.Schema({
    tags: {
        type: []
    },
}, { collection: 'tags' });

module.exports = mongoose.model('Tags', TagsSchema);