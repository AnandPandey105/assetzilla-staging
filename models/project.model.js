const mongoose = require("mongoose");
var ObjectId = mongoose.Schema.Types.ObjectId;

const ProjectSchema = mongoose.Schema(
  {
    details: {
      type: [mongoose.Schema.Types.Mixed],
    },
    parking_details: { type: mongoose.Schema.Types.Mixed },
    subcity: {
      type: String,
    },
    property_type: {
      type: String,
    },
    banks: {
      type: Array,
    },
    description: {
      type: String,
    },
    floors: {
      type: String,
    },
    green_amenites_json: {
      type: [String],
    },
    health_amenites_json: {
      type: [String],
    },
    township: {
      type: String,
    },
    builder: {
      type: String,
    },
    rera: {
      type: String,
    },
    name: {
      type: String,
      unique: true,
    },
    road_width: {
      type: { width: Number, unit: String },
    },
    banner_image: {
      type: [String],
    },
    state: {
      type: String,
    },
    images: {
      Projects: {
        type: [String],
      },
    },
    authority: {
      type: String,
    },
    area: {
      area: {
        type: Number,
      },
      unit: {
        type: String,
      },
      min: {
        type: Number,
      },
      max: {
        type: Number,
      },
    },
    details_area: {
      min: {
        type: Number,
      },
      max: {
        type: Number,
      },
    },
    amenities_json: {
      type: [String],
    },
    connectivity_amenites_json: {
      type: [String],
    },
    other_amenites_json: {
      type: [String],
    },
    project_status: {
      type: String,
    },
    locality: {
      type: String,
    },
    pincode: {
      type: Number,
    },
    address: {
      type: String,
    },
    url: {
      type: String,
    },
    country: {
      type: String,
    },
    facing: {
      type: String,
    },
    kid_amenites_json: {
      type: [String],
    },
    video_url: {
      type: String,
    },
    id: {
      type: String,
    },
    lease_rent: {
      type: String,
    },
    city: {
      type: String,
    },
    district: {
      type: String,
    },
    case_id: {
      type: String,
    },
    status: {
      type: Date,
    },
    expected_completion: {
      type: Date,
    },
    floor_plan: {
      type: [],
    },
    site_plan: {
      type: [],
    },
    brochure: {
      type: [],
    },
    price_list: {
      type: [],
    },
    specification: {
      type: [],
    },
    other_document: {
      type: [],
    },
    location: {
      type: mongoose.Schema.Types.Mixed,
    },
    basement: {
      type: Boolean,
    },
    basement_purpose: {
      type: String,
    },
    total_floors: {
      type: Number,
    },
    total_properties: {
      type: Number,
    },
    visitor_parking: {
      type: Boolean,
    },
    visitor_parking_spot: {
      type: [],
    },
    space: {
      type: [],
    },
    retail_floor_type: {
      type: [],
    },
    retail_type: {
      type: [],
    },
    retail_additional: {
      type: [],
    },
    price: {
      type: {
        min:  { type: Number ,default:0},
        max:  { type: Number ,default:0},
        zeroTo25Lacs:  { type: Number ,default:0},
        twentyfiveTo50Lacs:  { type: Number ,default:0},
        fiftyTo1cr:  { type: Number ,default:0},
        oneTo5cr:  { type: Number ,default:0},
        fiveToabove:  { type: Number ,default:0},
      },
    },
    sq_fit_cost: {
      min: {
        type: Number,
      },
      max: {
        type: Number,
      },
    },
    views:{type: Number, min:0},
    tags: { type: [String] },
    // updated: { type: Date, default: Date.now },
    // created: { type: Date, default: Date.now },
    is_live: { type: String, default: "1" },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

module.exports = mongoose.model("Project", ProjectSchema);
