const dotenv = require('dotenv')
const jwt = require('jsonwebtoken')
dotenv.config()

const socketMiddleWare = (socket,next)=>{
    const req = socket.request
    const token = socket.handshake.auth.token;
    if (!token) {
      // Reject the connection if token is missing
      return next(new Error('Unauthorized. Token missing.'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log(decoded)
      socket.userId = decoded.userId;
      next();
    } catch (err) {
      console.log(err.message)
      return next(new Error('Unauthorized. Invalid token.'));
    }
}

module.exports = socketMiddleWare