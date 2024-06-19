const mongoose = require("mongoose");

const UserSubmittedPropertySchema = mongoose.Schema(
  {
    user:{type:mongoose.Schema.Types.ObjectId, ref:'Customer'},
    property_name: { type: String },
    address: { type: String },
    property_type: { type: String },
    builder: { type: String },
    locality: { type: String },
    city: { type: String },
    district: { type: String },
    pincode: { type: String },
    price: { type: String },
    size: { type: String },
    case_id: { type: String },
    case_id_display: { type: String },
    country: {
      code: {
        type: String,
        default: "+91",
      },
      name: {
        type: String,
        default: "India (भारत)",
      },
    },
    email: { type: String },
    history: [
      {
        notes: { type: String },
        status: { type: String },
        subStatus: { type: String },
        whatsappNumber: { type: String },
        country: {
          code: {
            type: String,
            default: "+91",
          },
          name: {
            type: String,
            default: "India (भारत)",
          },
        },
        updated: { type: Date },
        updatedBy: { type: String },
      },
    ],
    isApproved: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    userSubmittedCity: { type: String },
    username: { type: String },
    submittedOn: { type: Date },
    status: { type: String },
    property_images: [{ type: String }],
    latestStatus: { type: String},
    latestSubStatus: { type: String}
  },
  {
    timestamps: { createdAt: "created", updatedAt: "updated" },
  }
);

module.exports = mongoose.model(
  "UserSubmittedProperty",
  UserSubmittedPropertySchema
);
