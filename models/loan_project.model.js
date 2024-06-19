const mongoose = require("mongoose");
var ObjectId = mongoose.Schema.Types.ObjectId;

const LoanProjectSchema = mongoose.Schema(
  {
    project: {
      type: String,
    },
    url: {
      type: String,
    },
    user: {
      type: String,
    },
    bank: {
      type: String,
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    country:{
      code:{
        type: String, default:"+91"
      },
      name:{
        type:String, default:"India (भारत)"
      }
    },
    registeredMobileNumber: {
      type: String,
    },
    latestStatus: { type: String },
    latestSubStatus: { type: String },
    history: [
      {
        notes: { type: String },
        status: { type: String },
        subStatus: { type: String },
        whatsappNumber: { type: String },
        updated: { type: Date },
        updatedBy: { type: String },
        country:{
          code:{
            type: String, default:"+91"
          },
          name:{
            type:String, default:"India (भारत)"
          }
        },
      },
    ],
    // updated: { type: Date, default: Date.now },
    // created: { type: Date, default: Date.now },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

module.exports = mongoose.model("LoanProject", LoanProjectSchema);
