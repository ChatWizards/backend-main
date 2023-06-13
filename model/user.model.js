const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fname: { type: String, required: true },
  lname: { type: String, required: true },
  userName:{type:String, required:true,immutable:true,unique:true},
  email: { type: String, required: true, immutable: true, unique: true},
  password: { type: String, required: true },
  profilePic:{type:String,required:true},
  isVerfied:{type:Boolean,default:false},
  contacts: [{type:mongoose.SchemaTypes.ObjectId,ref:'user'}],
  createdAt: { type: Date, default: Date.now(), immutable: true },
  updatedAt:{type:Date,default:Date.now()}
});

const userModel = mongoose.model("user", userSchema);

module.exports = userModel;
