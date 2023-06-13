const express = require("express")
const morgan = require("morgan")
const mongoose = require("mongoose")
const dotenv = require('dotenv')
const errorMiddleware = require("./middleware/error.middleware")
const { client } = require("./utils/redis-config")
const io = require('socket.io')
const userRouter = require("./router/user.router")
const chatRouter = require("./router/chat.router")
dotenv.config()

const app = express()
const port = process.env.PORT || 5000

app.use(express.json())
app.use(cors())
app.use(morgan('dev'))
app.use('/user',userRouter)
app.use('/chat',chatRouter)
app.use(errorMiddleware())

client.on('error',(err)=>{
    console.log(err)
})

client.on("connect",(err)=>{
    console.log("connected to database successfully.")
})

mongoose.connect(process.env.MONGO_URI)
        .then((succ)=>{console.log(succ.connection.host)})
        .catch((err)=>{console.log(err.message)})

const server = app.listen('/',()=>{
    console.log("connected to port "+port)
})
const socketServer = io(server,{
    pingTimeout:60000,
    cors:{
        origin:"*"
    }
})

socketServer.on('connection',(socket)=>{
    console.log("connected to socket")
})