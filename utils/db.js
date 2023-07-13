require('dotenv').config()
const mongoose = require('mongoose')
const multer = require('multer')
const {GridFsStorage} = require('multer-gridfs-storage')


mongoose.connect(process.env.MONGO_URI_DEV)
.then((succ)=>{console.log(succ.connection.host)})
.catch((err)=>{console.log(err)})
    


const diskStorage = multer.diskStorage({
    destination:function(req,file,cb){
        let url = (__dirname.split(path.sep)).slice(0,-1)
        console.log(url)
        url = url.join(path.sep)
        cb(null,path.join(url+'/uploads/'))
    },
    filename:function(req,file,cb){
        cb(null,file.originalname)
    }
})

const gridStorage = new GridFsStorage({
    url: process.env.MONGO_URI_DEV,
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err);
          }
          const filename = buf.toString("hex") + path.extname(file.originalname);
          const fileInfo = {
            filename: filename,
            bucketName: "profilePic"
          };
          resolve(fileInfo);
        });
      });
    }
});

const upload = multer({storage:gridStorage})
const storeLocal = multer({storage:diskStorage})

module.exports = {diskStorage,gridStorage,upload,storeLocal}