const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    user:{type:mongoose.SchemaTypes.ObjectId,ref:'user'},
    contact:{type:mongoose.SchemaTypes.ObjectId,ref:'user'},
    createdAt:{type:Date,default:Date.now()},
    updatedAt:{type:Date,default:Date.now()}
})

const contactModel = mongoose.model('contact',contactSchema)

module.exports = contactModel