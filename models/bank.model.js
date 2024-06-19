const mongoose = require("mongoose");
var ObjectId = mongoose.Schema.Types.ObjectId;

const BankSchema = mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    url: { type: String, required: true, unique: true },
    name: { type: String, required: true, unique: true },
    logo: { type: String },
    description: { type: String },
    status: { type: String },
    views: { type: Number, min: 0 },
    is_live: { type: String, default: "1" },
    type: { type: String },
    tags: { type: [String] },
    total_projects: { type: Number },
    // updated: { type: Date, default: Date.now },
    // created: { type: Date, default: Date.now }
  },
  { timestamps: { updatedAt: "updated", createdAt: "created" } }
);

module.exports = mongoose.model("Bank", BankSchema);
