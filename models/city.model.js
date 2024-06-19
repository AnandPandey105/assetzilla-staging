const mongoose = require('mongoose');
const type = require('mongoose/lib/schema/operators/type');
var ObjectId = mongoose.Schema.Types.ObjectId;

const CitySchema = mongoose.Schema({
   is_live: { type: String,default:"1" },
   history: {
      type: String
   },
   about: {
      type: String
   },
   population: {
      type: Number
   },
   capital_income: {
      type: Number
   },
   banner_image: {
      type: [
         String
      ]
   },
   gdp: {
      type: Number
   },
   id: {
      type: String
   },
   country: {
      type: String
   },
   images: {
      Cities: {
         type: [
            String
         ]
      }
   },
   state: {
      type: String
   },
   district: {
      type: String
   },
   url: {
      type: String
   },
   details: {
      type: String
   },
   area: {
      area: {
         type: Number
      },
      unit: {
         type: String
      }
   },
   name: {
      type: String,
      unique: true
   },
   facilities: {
      type: String
   },
   highlights: {
      type: String
   },
   project_status_count: {
      PreLaunch : {type: Number,default:0},
      UnderConstruction : {type: Number,default:0},
      ReadyToMove : {type: Number,default:0},
  },
   total_projects: { type: Number },
   total_properties: { type: Number },
   price: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 }
   }
,   
   tags: { type: [String] },
   video_url: { type: String },
   // updated: { type: Date, default: Date.now },
   // created: { type: Date, default: Date.now },
   isBoundryAdded: {
      type: Boolean
   },
   views:{
      type:Number,
      min:0
   }

},{timestamps: {
   createdAt: 'created',
   updatedAt: 'updated'
}});

module.exports = mongoose.model('City', CitySchema);