const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    sender:{type:mongoose.SchemaTypes.ObjectId,ref:"user",required:true},
    content:{type:String,default:""},
    files:[{type:mongoose.SchemaTypes.ObjectId}],
    chat:{type:mongoose.SchemaTypes.ObjectId,ref:"chat",required:true},
    timeStamp:{type: Date, default: Date.now()},
    deliveryStatus:{type:String,enum:['delivered','pending','draft','seen'],default:"pending"},
    readBy:[{type:mongoose.SchemaTypes.ObjectId,ref:'user'}]
})

const messageModel = mongoose.model('message',messageSchema)

module.exports = messageModel