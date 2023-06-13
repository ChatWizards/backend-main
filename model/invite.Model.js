const mongoose = require("mongoose");

const inviteSchema = new mongoose.Schema({
    sender:{type:mongoose.SchemaTypes.ObjectId,ref:'user'},
    receiver:{type:mongoose.SchemaType.ObjectId,ref:'user'},
    inviteMessage:{type:String,default:`user wants to connect with you`},
    timeStamp:{type: Date, default: Date.now()},
    inviteStatus:{type:String,enum:['accept','pending','reject'],default:'pending'}
})

const inviteModel = mongoose.model('invite',inviteSchema)

module.exports = inviteModel