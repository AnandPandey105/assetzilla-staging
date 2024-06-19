const mongoose = require("mongoose");
var ObjectId = mongoose.Schema.Types.ObjectId;

const inquirySchema = mongoose.Schema(
  {
    name: { type: String },
    email: { type: String },
    phone: { type: String },
    property_type: { type: String },
    condition: { type: String },
    builder: { type: String },
    project: { type: String },
    state: { type: String },
    district: { type: String },
    city: { type: String },
    // created: { type: Date, default: Date.now },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

module.exports = mongoose.model("inquiry", inquirySchema);
