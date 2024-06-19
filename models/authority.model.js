const mongoose = require("mongoose");
var ObjectId = mongoose.Schema.Types.ObjectId;

const AuthoritySchema = mongoose.Schema(
  {
    phone: {
      type: String,
    },
    founded_year: {
      type: String,
    },
    description: {
      type: String,
    },
    url: {
      type: String,
    },
    email: {
      type: String,
    },
    id: {
      type: String,
    },
    logo: {
      type: String,
    },
    website: {
      type: String,
    },
    address: {
      type: String,
    },
    price: {
      min: {type:Number,default:0},
      max: {type:Number,default:0},
    },
    name: {
      type: String,
      unique: true,
    },
    views:{type: Number, min:{type:Number,default:0}},
    pincode: { type: Number },
    tags: { type: [String] },
    // updated: { type: Date, default: Date.now },
    // created: { type: Date, default: Date.now },
    is_live: { type: String, default: "1" },
    major_developments: { type: String },
    master_plan_with_years: { type: String },
    master_plan_with_years_image: { type: [] },
    area_covered: { type: String },
    area_covered_image: { type: [] },
    metro_routes: { type: String },
    metro_routes_image: { type: [] },
    major_initiatives: { type: String },
    country: { type: String },
    state: { type: String },
    district: { type: String },
    total_projects: { type: Number },
    video_url: { type: String },
    project_status_count: {
      PreLaunch: { type:Number,default: 0 },
      UnderConstruction: {type:Number, default: 0 },
      ReadyToMove: { type:Number, default: 0 },
    },
    status_project: [],
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

module.exports = mongoose.model("Authority", AuthoritySchema);
