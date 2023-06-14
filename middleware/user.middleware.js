const jwt = require('jsonwebtoken')
const uuid = require("uuid")
const userModel = require('../model/user.model')
const authUser = async(req,res,next)=>{
    try{
        let regex=/^[0-9a-fA-F]{24}$/;
        console.log(req.headers.authorization)
        if(!req.headers.authorization || !req.headers.authorization.startsWith("Bearer")){
            res.statusCode = 403
            throw new Error("User not authorized")
        }
        const token = req.headers.authorization.split(" ")[1]    
        if(!jwt.verify(token,process.env.JWT_SECRET)){
            res.statusCode = 400
            throw new Error("Invalid token")            
        }
        const {userId} = jwt.decode(token,{complete:true}).payload
        if(!userId.match(regex)){
            res.statusCode = 400
            console.log("invalid uuid")
            throw new Error("Invalid UserId")
        }
        console.log("valid uuid")
        const user = userModel.findById(userId)
        req.user = await user.select('_id fname lname userName email isVerified')
        console.log(req.user)
        next()
    }
    catch(err){
        next(err)
    }
}

module.exports = authUser