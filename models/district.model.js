const mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

const DistrictSchema = mongoose.Schema({
   is_live: { type: String, default: "1" },
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
      Districts: {
         type: [
            String
         ]
      }
   },
   state: {
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
      PreLaunch :  { type: Number ,default:0},
      UnderConstruction :  { type: Number ,default:0},
      ReadyToMove :  { type: Number ,default:0}
  },
   total_projects: { type: Number },
   total_properties: { type: Number },
   price: {
      type: { min:  { type: Number ,default:0}, max:  { type: Number ,default:0}}
   },
   video_url: { type: String },
   tags: { type: [String] },
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
   createdAt: 'created', // Use `created_at` to store the created date
   updatedAt: 'updated' // and `updated_at` to store the last updated date
}});

module.exports = mongoose.model('District', DistrictSchema);


