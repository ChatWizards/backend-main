const {Server} = require('socket.io')
const jwt = require('jsonwebtoken')
const messageModel = require('../model/message.model')
const mongoose = require('mongoose')
const socketMiddleWare = require('../middleware/socket.middleware')
const {sendMessage} = require('../controllers/chat.controller')
const { getGFS,getFileUrl } = require('./storage')

function intializeSocketServer(server){
    
    const io = new Server(server,{cors:{
        origin:"*",
        methods: ["GET", "POST"],
        transports: ['websocket', 'polling'],
        credentials: true
    },
    allowEIO3: true
    })

    io.engine.on('headers', (headers, req) => {
        headers['Access-Control-Allow-Origin'] = '*';
        headers['Access-Control-Allow-Credentials'] = true;
    });

    const activeUsers = {}
    io.on("listening",()=>{console.log("listening for events")})
    
    io.use(socketMiddleWare)

    io.on("connection",(socket)=>{
        let req = socket.request;
        req.user = {_id:socket.userId}
        let res = {statusCode:'',message:'',response:''}
        req.type = 'webSocket';
        const token = jwt.sign({userId:socket.userId},process.env.JWT_SECRET,{ expiresIn: Number(process.env.JWT_MAIN_EXPIRE) })        
        
        activeUsers[socket.id] = socket.userId
        
        socket.on("message",async(data,callback)=>{
            req.body = data
            res = await sendMessage(req,res)
            if(res.status==201&&callback) callback({messageId:res.response.message._id})
            else socket.emit("message_error")
        })

        socket.on("send-file", (data,callback) => {
            console.log("inside file socket");
            
            const { messageId, fileData, fileName, fileType } = data;
            const gfs = getGFS()
            const uploadStream = gfs.openUploadStreamWithId(new mongoose.Types.ObjectId(), fileName, { metadata: { messageId }, contentType: fileType });
            uploadStream.end(Buffer.from(fileData), () => {
              console.log(`File ${fileName} uploaded for message ${messageId}`);
            });
            callback({ fileId: uploadStream.id });
        });
        
        socket.on("update-message-with-files", async (data,callback) => {
            console.log("inside final socket");
            const { messageId, fileIds } = data;
            const message = await messageModel.findByIdAndUpdate(messageId, { $set: { files:fileIds } }).populate('sender','userName email profilePic _id').lean();
            const parsedImageId = new mongoose.Types.ObjectId(message.sender.profilePic)
            const profilePic = await getFileUrl(parsedImageId)
            const files = await Promise.all(fileIds.map(async(ele)=>{
                const id = new mongoose.Types.ObjectId(ele)
                const file = await getFileUrl(id)
                return file
            }))
            const parsedMessage = {
                ...message,
                files:files,
                sender: {
                    ...message.sender,
                    profilePic: profilePic
                }
            }
            console.log(`Message ${messageId} updated with files:`, fileIds);
            // socket.emit('message_upload_completed',message)
            callback(parsedMessage)
        });
        
        socket.on("fileUpload",()=>{
            console.log("recieved message")
        })
        socket.on("fileDownload",()=>{
            console.log("recieved message")
        })
        socket.on("error",(err)=>{
            console.log(err)
        })
        socket.on('disconnect', () => {
            delete activeUsers[socket.id];
            io.emit('activeUsers', Object.values(activeUsers));
        });

        socket.emit('active_user', Object.values(activeUsers))
       

    })
    io.on('error',(err)=>{
        console.log(err)
    })
    return io
}

module.exports = intializeSocketServer