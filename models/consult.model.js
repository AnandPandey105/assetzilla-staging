const mongoose = require("mongoose");
var ObjectId = mongoose.Schema.Types.ObjectId;

const ConsultSchema = mongoose.Schema(
  {
    name: {
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
    email: {
      type: String,
    },
    lookingFor: {
      type: String,
    },
    city: {
      type: String,
    },
    type_of_user: {
      type: String,
    },
    latestStatus:{type:String},
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
    latestSubStatus:{type: String},
    // updated: { type: Date, default: Date.now },
    // created: { type: Date, default: Date.now },
  },
  {
    timestamps: { createdAt: "created", updatedAt: "updated" },
  }
);

module.exports = mongoose.model("Consult", ConsultSchema);
