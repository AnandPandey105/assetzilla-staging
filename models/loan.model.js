const mongoose = require("mongoose");
var ObjectId = mongoose.Schema.Types.ObjectId;

const LoanSchema = mongoose.Schema(
  {
    user: {
      type: String,
    },
    project: {
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
    // updated: { type: Date, default: Date.now },
    // created: { type: Date, default: Date.now },
  },
  {
    timestamps: { createdAt: "created", updatedAt: "updated" },
  }
);

module.exports = mongoose.model("Loan", LoanSchema);
