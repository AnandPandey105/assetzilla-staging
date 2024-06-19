const mongoose = require("mongoose");

const user = mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    locationAccess: [
      {
        locationAccessLevel: String,
        locationAccessValue: String,
      },
    ],
    propertyTypeAccess:[
      {
        propertyTypeAccessLevel: String,
        propertyTypeAccessValue: String,
      },
    ],
    // locationAccessValue: { type: String },
    // locationAccessLevel: { type: String },
    // updated: { type: Date, default: Date.now },
    // created: { type: Date, default: Date.now },
  },
  {
    timestamps: { createdAt: "created", updatedAt: "updated" },
  }
);

module.exports = mongoose.model("User", user);
