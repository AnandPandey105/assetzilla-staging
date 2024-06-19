const mongoose = require("mongoose");

const BookingPropertySchema = mongoose.Schema(
  {
    id: { type: String, unique: true },
    name: { type: String },
    number: { type: String },
    country:{
      code:{
        type: String, default:"+91"
      },
      name:{
        type:String, default:"India (भारत)"
      }
    },
    email: { type: String },
    registeredMobileNumber:{type:String},
    latestStatus:{type: String},
    latestSubStatus: { type: String },
    history:[{
      notes:{type: String},
      status: {type: String},
      subStatus: {type: String},
      whatsappNumber: {type: String},
      updated:{type: Date},
      updatedBy:{type:String},
      country:{
        code:{
          type: String, default:"+91"
        },
        name:{
          type:String, default:"India (भारत)"
        }
      },
    }],
    property: { type: String },
  },
  { timestamps: { updatedAt: "updated", createdAt: "created" } }
);

module.exports = {
  BookingPropertySchema: mongoose.model(
    "BookingProperty",
    BookingPropertySchema
  ),
};
