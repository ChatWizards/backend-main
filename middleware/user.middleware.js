const jwt = require('jsonwebtoken')
const uuid = require("uuid")
const authUser = async(req,res,next)=>{
    try{
        if(!req.header.authorizaton || !req.header.authorizaton.startsWith("bearer")){
            res.statusCode = 403
            throw new Error("User not authorized")
        }
        const token = req.header.authorizaton.startsWith("bearer").split()[1]    
        if(!jwt.verify(token)){
            res.statusCode = 400
            throw new Error("Invalid token")            
        }
        const payload = jwt.decode(token,{complete:true}).payload
        if(!uuid.validate(payload)){
            res.statusCode = 400
            throw new Error("Invalid UserId")
        }
        next()
    }
    catch(err){
        next(err)
    }
}

module.exports = authUser