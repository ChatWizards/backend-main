const mongoose = require('mongoose')

const chatSchema = new mongoose.Schema({
    chatName:{type:String,trim:true},
    users:[{type:mongoose.SchemaTypes.ObjectId,required:true,ref:'user'}],
    chatType:{type:String,default:"indivisual",enum:["group","indivisual"]},
    lastMessage:{type:mongoose.SchemaTypes.ObjectId,ref:'message'},
    groupAdmin:{type:mongoose.SchemaTypes.ObjectId,ref:'user'},
},{ timestamps: true })

const chatModel = mongoose.model('chat',chatSchema)

module.exports = chatModel