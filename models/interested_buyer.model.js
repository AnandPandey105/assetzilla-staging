const mongoose = require("mongoose");

const InterestedBuyerSchema = mongoose.Schema(
  {
    id: { type: String, unique: true },
    name: { type: String },
    number: { type: String },
    country:{
      code:{
        type:String, default:"+91"
      },
      name:{
        type:String, default:"India (भारत)"
      }
    },
    registeredMobileNumber:{ type: String },
    email: { type: String },
    inquiry_about: { type: String },
    url: { type: String },
    isSubscribed: { type: Boolean, default: true },
    notified: {
      is_notified: { type: Boolean, default: false },
      propertyCount: { type: Number, default: 0 },
    },
    latestStatus: { type: String },
    latestSubStatus: { type: String },
    history: [
      {
        notes: { type: String },
        status: { type: String },
        subStatus: { type: String },
        whatsappNumber: { type: String },
        country:{
          code:{
            type:String, default:"+91"
          },
          name:{
            type:String, default:"India (भारत)"
          }
        },
        updated: { type: Date },
        updatedBy: { type: String },
      },
    ],
    // updated: { type: Date, default: Date.now },
    // created: { type: Date, default: Date.now },
  },
  {
    timestamps: { createdAt: "created", updatedAt: "updated" },
  }
);

module.exports = {
  InterestedBuyerSchema: mongoose.model(
    "InterestedBuyer",
    InterestedBuyerSchema
  ),
};
