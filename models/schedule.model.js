const { Schema } = require("mongoose");
const mongoose = require("mongoose");
// var ObjectId = mongoose.Schema.Types.ObjectId;

const ScheduleSchema = mongoose.Schema(
  {
    name: { type: String },
    phone: { type: String },
    country:{
      code:{
        type: String, default:"+91"
      },
      name:{
        type:String, default:"India (भारत)"
      }
    },
    registeredMobileNumber:{type:String},
    email: { type: String },
    date: { type: Date },
    city: [],
    timeZone: { type: String },
    project: [{ type: String }],
    url: [{ type: String }],
    interestedInOtherProjects: { type: String },
    requestSubmittedIds: [{ type: Schema.ObjectId }],
    assignedTo: { type: Schema.ObjectId },
    latestStatus:{type:String},
    history:[{
      type:{type: String},
      status:{type:String},
      subStatus:{type:String},
      whatsappNumber:{type: String},
      notes:{type:String},
      newAppointmentDate:{type: Date},
      updateDate:{type: Date},
      newTimeZone:{type: String},
      updateUser:{type:String},
      country:{
        code:{
          type: String, default:"+91"
        },
        name:{
          type:String, default:"India (भारत)"
        }
      },
    }],
    latestSubStatus: { type: String },
    // updatedAt: { type: Date, default: Date.now },
    // createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

module.exports = mongoose.model("sitevisit", ScheduleSchema);
