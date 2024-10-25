const multer = require('multer')
const {GridFsStorage} = require('multer-gridfs-storage')
const conn = require('./db')
const mongoose = require('mongoose')
const crypto = require('crypto')
const path = require('path')
const dotenv = require('dotenv')

dotenv.config()


let gfs = null
conn.once('open',()=>{
    console.log('Database bucket session created');
    gfs = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'images',
    });
})
  

const storage = new GridFsStorage({
    url:process.env.MONGO_URI,
    file:(req,file)=>{
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
              if (err) return reject(err);
              const filename = buf.toString("hex") + path.extname(file.originalname);
              const fileInfo = {
                filename: filename,
                bucketName: "images"
              };
              resolve(fileInfo);
            });
        });
    }
})

function getGFS() {
    return gfs;
}


const upload = multer({storage})

module.exports = {upload,getGFS}