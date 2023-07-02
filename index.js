const express = require("express")
const morgan = require("morgan")
const mongoose = require("mongoose")
const dotenv = require('dotenv')
const cors = require('cors')
const errorMiddleware = require("./middleware/error.middleware")
const intializeSocketServer = require('./utils/socket-config')
// const { client } = require("./utils/redis-config")
const http = require('http')
const userRouter = require("./router/user.router")
const chatRouter = require("./router/chat.router")
dotenv.config()

const app = express()
const port = process.env.PORT || 4000

app.use(express.json())
app.use(cors())
app.use(morgan('tiny'))
app.use('/user',userRouter)
app.use('/chat',chatRouter)
app.use(errorMiddleware)

app.get('*',(req,res,next)=>{
    res.statusCode = 400
    throw new Error("Route Not found")
})

mongoose.connect(process.env.MONGO_URI_DEV)
        .then((succ)=>{console.log(succ.connection.host)})
        .catch((err)=>{console.log(err.message)})

const server = http.createServer(app)

const socketServer = intializeSocketServer(server)

server.listen(port,(err)=>{
    console.log("connected to port "+port)
    console.log("socket server up and listening")
    if(err) console.log(err.message)
})


app.get('/',(req,res,next)=>{
    try{
        res.send("hello world")
    }catch(err){
        next(err)
    }
})
