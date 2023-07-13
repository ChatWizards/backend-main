const mongoose = require("mongoose")
const crypto = require("crypto")
const path = require("path") 
const {GridFsStorage} = require("multer-gridfs-storage")

let profilePicBucket,chatPicBucket;

function connect(){
    const connection = mongoose.createConnection(process.env.MONGO_URI_DEV)
    .then((succ)=>{console.log(succ.connection.host)})
    .catch((err)=>{console.log(err.message)})

    connection.once('open',()=>{
        profilePicBucket = new mongoose.mongo.GridFSBucket(connection.db,{
            bucketName:"profilePic"
        })
        profilePicBucket.collection("profilePic")
        chatPicBucket = new mongoose.mongo.GridFSBucket(connection.db,{
            bucketName:"chatPics"
        })
        chatPicBucket.collection("chatPics")
    })
}

