const mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

const NewsSchema = mongoose.Schema({
    link_name: {
        type: String
    },
    approval: {
        type: String
    },
    action_date: {
        type: String
    },
    images: {
        type: String
    },
    id: {
        type: String
    },
    user_id: {
        type: String
    },
    video: {
        type: String
    },
    tags: {
        type: [
            String
        ]
    },
    heading: {
        type: String
    },
    link: {
        type: String
    },
    content: {
        type: String
    },
    views:{type:Number, min:0},
    url: { type: String },
    publish_date: { type: Date },
    is_live: { type: String,default:"1" },
    // updated: { type: Date, default: Date.now },
    // created: { type: Date, default: Date.now }
}, {timestamps:{createdAt:"created", updatedAt:"updated"}}, { collection: 'news' });

module.exports = mongoose.model('News', NewsSchema);