const {Server} = require('socket.io')
const jwt = require('jsonwebtoken')
const socketMiddleWare = require('../middleware/socket.middleware')
const {sendMessage} = require('../controllers/chat.controller')

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
        
        socket.on("message",async(data)=>{
            req.body = data
            res = await sendMessage(req,res)
            if(res) socket.emit("message",res)
        })

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