const express = require("express")
const morgan = require("morgan")
const mongoose = require("mongoose")
const dotenv = require('dotenv')
const cors = require('cors')
const errorMiddleware = require("./middleware/error.middleware")
const { client } = require("./utils/redis-config")
const io = require('socket.io')
const userRouter = require("./router/user.router")
const chatRouter = require("./router/chat.router")
dotenv.config()

const app = express()
const port = process.env.PORT || 4000

app.use(express.json())
app.use(cors())
app.use(morgan('dev'))
app.use('/user',userRouter)
app.use('/chat',chatRouter)
app.use(errorMiddleware)

mongoose.connect(process.env.MONGO_URI)
        .then((succ)=>{console.log(succ.connection.host)})
        .catch((err)=>{console.log(err.message)})

const server = app.listen(port,(err)=>{
    console.log("connected to port "+port)
    if(err) console.log(err.message)
})
const socketServer = io(server,{
    pingTimeout:60000,
    cors:{
        origin:"*"
    }
})
