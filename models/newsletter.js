const mongoose = require("mongoose");

const NewsletterSchema = mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
      dropDups: true,
      lowercase: true,
    },
    isSubscribed: {
      type: Boolean,
      required: true,
      default: true,
    },
    // updated: { type: Date, default: Date.now },
    // created: { type: Date, default: Date.now }
  },
  {
    timestamps: { createdAt: "created", updatedAt: "updated" },
  }
);

module.exports = mongoose.model("Newsletter", NewsletterSchema);
