const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
    fileName:{type:String,required:true,unique:true},
    message:{type:mongoose.SchemaTypes.ObjectId,ref:"message"},
    fileId:{type:mongoose.SchemaTypes.ObjectId,required:true},
    profilePic:{type:Boolean,default:false},
    userId:{type:mongoose.SchemaTypes.ObjectId,ref:"user"}
})

const fileModel = mongoose.model('file',fileSchema)

module.exports = fileModel