const express = require("express")
const morgan = require("morgan")
const mongoose = require("mongoose")
const dotenv = require('dotenv')
const cors = require('cors')
const errorMiddleware = require("./middleware/error.middleware")
const intializeSocketServer = require('./utils/socket-config')
// const { client } = require("./utils/redis-config")
const https = require('https');
const fs = require('fs');
const userRouter = require("./router/user.router")
const chatRouter = require("./router/chat.router")

const options = {
    key: fs.readFileSync('server.key'),       // Path to your private key file
    cert: fs.readFileSync('server.cert')       // Path to your public certificate file
};

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

app.get('/',(req,res,next)=>{
    try{
        res.send("hello world")
    }catch(err){
        res.send(err)
        // next(err)
    }
})

mongoose.connect(process.env.MONGO_URI_DEV)
        .then((succ)=>{console.log(succ.connection.host)})
        .catch((err)=>{console.log(err.message)})

const server = https.createServer(options,app)

server.on('error', (err) => {
    console.error('Server error:', err);
});
  
server.on('request', (req, res) => {
    // request error to be handled here
    req.on('error', (err) => {
      console.error('Request error:', err);
      console.log('Request details:', req.method, req.url, req.headers);
    });
});

const socketServer = intializeSocketServer(server)

server.listen(port,()=>{
    try{
        console.log("connected to port "+port)
        console.log("socket server up and listening")    
    }catch(err){
        res.json(err)
    }
})

