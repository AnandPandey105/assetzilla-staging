var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var bcrypt = require("bcrypt");

var CustomerSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    country:{
      code:{
        type: String, default:"+91"
      },
      name:{
        type:String, default:"India (भारत)"
      }
    },
    password: { type: String, required: false },
    name: { type: String },
    role: { type: String, default: "" },
    email: { type: String },
    lastLogin: { type: Date, default: Date.now },
    lastActivity: { type: Date },
    viewHistory: {type:[
      { url: { type: String }, date: { type: Date, default: Date.now } },
    ]},
    searchHistory:{type:[
      {url:{type:String}, date:{type:Date, default:Date.now}}
    ]},
    propertyLastSubmittedAt: { type: Date },
    bookmark: { type: Array, default: [] },
    bookmarks: { type: Array, default: [] }, //    [{ url: String, name: String, builder: String }],
    submitted_property: {
      type: Array,
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

// hash the password
CustomerSchema.methods.generateHash = function (password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
CustomerSchema.methods.validPassword = function (password, user_password) {
  return bcrypt.compareSync(password, user_password);
};
var Customer = mongoose.model("Customer", CustomerSchema);
module.exports = Customer;
