const mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

const PropertySchema = mongoose.Schema({
   ownership: {
      type: String
   },
   city: {
      type: String
   },
   userEnteredCity: {
      type: String
   },
   project: {
      type: String
   },
   project_url: {
      type: String
   },
   property_type: {
      type: String
   },
   description: {
      type: String
   },
   case_id: {
      type: String
   },
   floor_plan: {
      type: [
         String
      ]
   },
   site_plan: {
      type: []
   },
   brochure: {
      type: []
   },
   price_list: {
      type: []
   },
   specification: {
      type: []
   },
   other_document: {
      type: []
   },
   condition: {
      type: String
   },
   banner_image: {
      type: [
         String
      ]
   },
   tower: {
      type: String
   },
   country: {
      type: String
   },
   state: {
      type: String
   },
   district: {
      type: String
   },
   address: {
      type: String
   },
   authority: {
      type: String
   },
   subcity: {
      type: String
   },
   name: {
      type: String
   },
   id: {
      type: String
   },
   bhk_space: {
      type: String
   },
   builder: {
      type: String
   },
   furnished: {
      type: String
   },
   url: {
      type: String
   },
   bank_loan: {
      type: Boolean
   },
   area: {
      area: {
         type: Number
      },
      unit: {
         type: String
      }
   },
   images: {
      Projects: {
         type: [
            String
         ]
      },
      Properties: {
         type: [
            String
         ]
      }
   },
   facing: { type: String },
   construction_years: {
      type: Date
   },
   price: {
      type: Object
   },
   sq_fit_cost: {
      cost: { 
         type: Number
      }
   },
   views:{type: Number, min:0},
   floor: { type: Number },
   loan_amount: { type: Number },
   loan_bank:  { type: String },
   locality: { type: String },
   owner_address: { type: String },
   owner_name: { type: String },
   owner_phone: { type: String },
   // updated: { type: Date, default: Date.now },
   // created: { type: Date, default: Date.now },
   is_live: { type: String, default: "1" },
   pincode: { type: Number },
   tower_number: { type: String },
   unit_number: { type: String },
   video_url: { type: String },
   tags: { type: [String] },
   expected_completion: { type: Date },
   location: { type: Object}
}, {
   timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" }});

module.exports = mongoose.model('Property', PropertySchema);