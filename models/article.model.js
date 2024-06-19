const mongoose = require("mongoose");
var ObjectId = mongoose.Schema.Types.ObjectId;

const ArticleSchema = mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    heading: { type: String },
    url: { type: String },
    content: { type: String },
    user_id: { type: String },
    link_name: { type: String },
    images: { type: String },
    approval: { type: String, default: "1" },
    category: { type: String, default: "1" },
    link: { type: String },
    video: { type: String },
    tags: { type: [String] },
    is_live: { type: String, default: "1" },
    // updated: { type: Date, default: Date.now },
    // created: { type: Date, default: Date.now }
  },
  {
    timestamps: {
      createdAt: "created", // Use `created_at` to store the created date
      updatedAt: "updated", // and `updated_at` to store the last updated date
    },
  }
);

module.exports = mongoose.model("Article", ArticleSchema);
