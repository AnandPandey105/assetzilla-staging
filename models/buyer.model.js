const mongoose = require("mongoose");
var ObjectId = mongoose.Schema.Types.ObjectId;

const RegisteredSchema = mongoose.Schema(
  {
    id: { type: String, unique: true },
    username: { type: String, unique: true },
    name: { type: String },
    number: { type: Number },
    email: { type: String },
    country:{
      code:{
        type: String, default:"+91"
      },
      name:{
        type:String, default:"India (भारत)"
      }
    },
   //  updated: { type: Date, default: Date.now },
   //  created: { type: Date, default: Date.now },
  },
  {
    timestamps: { createdAt: "created", updatedAt: "updated" },
  }
);

const LeadSchema = mongoose.Schema(
  {
    id: { type: String, unique: true },
    name: { type: String },
    number: { type: Number },
    email: { type: String },
    inquiry_about: { type: String },
   //  updated: { type: Date, default: Date.now },
   //  created: { type: Date, default: Date.now },
  },
  {
    timestamps: { createdAt: "created", updatedAt: "updated" },
  }
);

module.exports = {
  RegisteredSchema: mongoose.model("Customers", RegisteredSchema),
  LeadSchema: mongoose.model("Leads", LeadSchema),
};
