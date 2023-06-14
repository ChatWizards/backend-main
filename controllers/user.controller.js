const userModel = require('../model/user.model')
const inviteModel = require('../model/invite.Model')
const sendMail = require('../utils/sendMail')
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const signUp = async(req,res,next)=>{
    try{
        let {fname,lname,email,userName,profilePic,password,DoB} = req.body
        console.log(await userModel.findOne({userName}))
        if(await userModel.findOne({userName})){
            res.statusCode = 400
            throw new Error("Username already taken")
        }
        if(await userModel.findOne({email})){
            res.statusCode = 400
            throw new Error("User with given email already exists")
        }
        password = await bcrypt.hash(password,Number(process.env.SALT))
        const user = await userModel.create({fname,lname,email,userName,profilePic,password,DoB})
        const token = jwt.sign({userId:user._id},process.env.JWT_TEMP_SECRET,{ expiresIn: Number(process.env.JWT_TEMP_EXPIRE) })
        var mailResp = await sendMail(email, user.userId, token, "verify")
        if(!mailResp) res.status(400).json({message:"unable to send the mail",data:{token},status:400})
        res.status(200).json({message:"User created. Please verfiy your email",data:{token},status:200})
    }
    catch(err){
        next(err)
    }
}

const verify = async(req,res,next)=>{
    try{
        const token = req.params.token
        const payload = jwt.decode(token,{complete:true}).payload
        console.log(payload)
        const userId = payload.userId
        if(!jwt.verify(token,process.env.JWT_TEMP_SECRET)){
            await userModel.findByIdAndDelete(userId)
            const token = jwt.sign({userId:user._id},process.env.JWT_TEMP_SECRET,{ expiresIn: Number(process.env.JWT_TEMP_EXPIRE) })
            var mailResp = await sendMail(user.email, user.userId, token, "verify link")
            throw new Error("Given token is Invalid! Please Signup again")
        }
        const user = await userModel.findByIdAndUpdate(userId,{isVerfied:true},{new:true})
        return res.status(200).json({message:"user verifed successfully!proceed to login",data:{user},status:200})
    }
    catch(err){
        next(err)
    }
}

const login = async(req,res,next)=>{
    try{
        const {userName,password} = req.body 
        const user = await userModel.findOne({$or:[{userName:userName},{email:userName}]})
        if(!user){
            res.statusCode = 404
            throw new Error(`User with username ${userName} not found`)
        }
        if(!user.isVerfied){
            await sendMail()
            res.statusCode = 403
            throw new Error("Please verify the Email")
        }
        const passCheck = await bcrypt.compare(password,user.password)
        if(!passCheck){
            res.statusCode = 400
            throw new Error(`Wrong credentials`)
        }    
        //add redis here
        const token = jwt.sign({userId:user._id},process.env.JWT_SECRET,{ expiresIn: Number(process.env.JWT_MAIN_EXPIRE) })
        res.status(200).json({
            message:"User loggedIn successfully",
            data:{token},
            status:200
        })
    }
    catch(err){
        next(err)
    }
    
}

const forgotPassword = async(req,res,next)=>{
    try{
        const email = req.body.email;
        const user = await userModel.findOne({ email: email });
        if (!user) {
            res.statusCode = 404
            throw new Error("User with the given mail doesn't exist")
        }
        const token = jwt.sign(
            { userid: user._id, password: " " },
            process.env.JWT_TEMP_SECRET,
            { expiresIn: Number(process.env.JWT_TEMP_EXPIRE) }
          );
        console.log(token)
        await sendMail(user.email, user.userId, token, "resetPassword")
        res.status(200).json({
            message:"Password reset link send to the user successfully",
            data:{token},
            status:200
        })
    
    }
    catch(err){
        next(err)
    }
}

const resetPassword = async(req,res,next)=>{
    try{
        let token = req.params.token
        const {password} = req.body
        const userId = jwt.decode(token,{complete:true}).payload.userId
        if(!jwt.verify(token,process.env.JWT_TEMP_SECRET)){
            throw new Error("Given token is Invalid! Please check your mail again")
        }
        if(!password){
            res.statusCode = 400
            throw new Error("No password provided")
        }
        const hashPassword = await bcrypt.hash(password,Number(process.env.SALT))
        await userModel.findByIdAndUpdate(userId,{password:hashPassword},{new:true})
        res.status(200).json({message:"password changed successfully",data:{},status:200})
    }
    catch(err){
        next(err)
    }
}

const sendInvite = async(req,res,next)=>{
   const {contact} = req.body
   let invite;
   const user = await userModel.findOne({$or:[{email:contact},{userName:contact}]})
   
   if(!user){
    //verify if contact is email
    await sendMail(contact, "","", "invite",req.user.userName)
    return res.json({message:"user is not on ChatWizards!.Invitation link sent via Mail",data:{},status:204})
    }

    invite = inviteModel.create({sender:req.user._id,receiver:user.id,inviteMessage:`${req.user.userName} wants to connect with you`})
   return res.json({message:"Invite sent to the user successfully",data:{invite},status:201})
}

const showInvites = async(req,res,next)=>{
    const invites = await inviteModel.find({receiver:req.user._id})
    return res.json({message:"invitations fetched successfully",data:{invites},status:200})
}

const updateInviteStatus = async(req,res,next)=>{
    let contacts = {},regex=/^[0-9a-fA-F]{24}$/;
    var updateStatus = req.body.updateStatus
    const {inviteId} = req.params
    if(!inviteId.match(regex)){
        res.status(400)
        throw new Error("Invititation Id is not valid")
    }
    if(!inviteId){
        res.statusCode = 400
        throw new Error("No invite Id provied")
    }
    const invite = await inviteModel.findByIdAndUpdate(inviteId,{inviteStatus:updateStatus})
    if(invite.inviteStatus=="accept"){
        contacts = await userModel.findByIdAndUpdate(req.user._id,{$addToSet:{contacts:invite.receiver}},{new:true}).select("userName contacts").lean()
    }

    return res.json({message:`invitation ${updateStatus} successfully`,data:{...contacts},status:200})
}

const deleteInvite = async(req,res,next)=>{
    const inviteId = req.params.inviteId
    const invite = await inviteModel.findByIdAndDelete(inviteId)
    if(!inviteId){
        res.statusCode = 400
        throw new Error("No invite Id provied")
    }
    return res.json({message:`invitation deleted successfully`,data:{...invite},status:200})
}

const deleteUser = async (req,res,next)=>{
    try{
        let userId;
        if(req.isAdmin){userId = req.body.userId}
        userId = req.userId
        const deleteDoc = await userModel.findByIdAndDelete(userId)   
        await sendMail(user.email, user.userId, token, "account delete") 
        if(deleteDoc==null) {
            res.status(400)
            throw new Error("user doesn't exist")
        }    
    }
    catch(err){
        next(err)
    }
}

const logOut = async (req,res,next)=>{
    try{
        const userId = req.userId
        const data = await deleteCachedInfo(req.user._id);
        delete req.headers.authorization;
        delete req;

    }
    catch(err){
        next(err)
    }
}

module.exports = {logOut,deleteUser,signUp,sendInvite,showInvites,resetPassword,forgotPassword,verify,login,updateInviteStatus,deleteInvite}