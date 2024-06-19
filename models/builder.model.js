const mongoose = require("mongoose");
var ObjectId = mongoose.Schema.Types.ObjectId;

const BuilderSchema = mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    website: { type: String, required: true, unique: true },
    local_presence: { type: Array },
    state: { type: String },
    url: { type: String },
    logo: { type: String, required: true },
    pincode: { type: Number },
    district: { type: String },
    city: { type: String },
    phone: { type: String },
    country: { type: String },
    address: { type: String },
    name: { type: String, unique: true },
    email: { type: String },
    subcity: { type: String },
    views:{type: Number, min:0},
    is_live: { type: String, default: "1" },
    // updated: { type: Date, default: Date.now },
    // created: { type: Date },
    total_projects: { type: Number },
    tags: { type: [String] },
    video_url: { type: String },
    price: {
      type: { min:  { type: Number ,default:0}, max:  { type: Number ,default:0} },
    },
    status_project: [],
    project_status_count: {
      PreLaunch:  { type: Number ,default:0},
      UnderConstruction:  { type: Number ,default:0},
      ReadyToMove:  { type: Number ,default:0},
    },
    builder_property_type: { type: [String] },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

module.exports = mongoose.model("Builder", BuilderSchema);
