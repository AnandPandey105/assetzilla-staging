const mongoose = require('mongoose');

const AdminConfigSchema = mongoose.Schema({
    lastScheduleSeenAt: { type: Date },
    lastSubmittedPropertyAt:{ type: Date },
});

module.exports = mongoose.model('AdminConfigSchema', AdminConfigSchema);