const multer = require('multer')
const {GridFsStorage} = require('multer-gridfs-storage')
const conn = require('./db')
const mongoose = require('mongoose')
const crypto = require('crypto')
const path = require('path')
const dotenv = require('dotenv')
const { documentTypes,imageTypes } = require('./filetypes')

dotenv.config()


let gfs = null
conn.once('open',()=>{
    console.log('Database bucket session created');
    gfs = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'files',
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
                bucketName: "files"
              };
              resolve(fileInfo);
            });
        });
    }
})

function getGFS() {
    return gfs;
}

async function getFileUrl(imageId,type='image'){
    const gfs = getGFS()
    const id = new mongoose.Types.ObjectId(imageId)
    const files = await gfs.find({_id:id}).toArray()
    if(!files||files.length==0) return null
    const file = files[0];

    if(!documentTypes.includes(file.contentType)&&!imageTypes.includes(file.contentType)) return null;
    
    return new Promise((resolve, reject) => {
        const readStream = gfs.openDownloadStream(file._id);
        const chunk = []
        readStream.on('data', (data) => {
            chunk.push(data)
        })
        readStream.on('end', () => {
            const buffer = Buffer.concat(chunk)
            resolve(`data:${file.contentType};base64,${buffer.toString('base64')}`)
        })
        readStream.on('error', (err) => {
            reject(err)
        })
    })
}


const upload = multer({
    storage

})

module.exports = {upload,getGFS,getFileUrl}