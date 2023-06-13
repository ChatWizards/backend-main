const errorMiddleware = (err,req,res,next)=>{
    if(res.statusCode==200||res.statusCode==201) res.statusCode = 500
    return res.json({message:err.message,data:{},stack:err.stack,status:res.statusCode})
}

module.exports = errorMiddleware