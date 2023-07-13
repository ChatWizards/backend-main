const userModel = require('../model/user.model')
const inviteModel = require('../model/invite.Model')
const sendMail = require('../utils/sendMail')
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const path = require('path')
const {storeLocal,upload, gridStorage} = require('../utils/db')
const { default: mongoose, connection } = require('mongoose')
const fileModel = require('../model/fileModel')

const signUp = async(req,res,next)=>{
    try{
        let {email,fname,lname} = req.body
        if(await userModel.findOne({email})){
            res.statusCode = 409
            throw new Error("User with given email already exists")
        }
        fileModel.create({fileName:req.file.filename,fileId:req.file.id,profilePic:true})
        const token = jwt.sign({...req.body,fileId:req.file.id},process.env.JWT_TEMP_SECRET,{ expiresIn: Number(process.env.JWT_TEMP_EXPIRE) })
        var mailResp = await sendMail(email, token, "verify")
        if(!mailResp) res.status(400).json({message:"unable to send the mail",response:{token},status:400})
        res.status(200).json({message:"Please verfiy your email to create user",response:{token},status:200})
    }
    catch(err){
        next(err)
    }
}

const verify = async(req,res,next)=>{
    try{
        const {userName,password,token} = req.body
        let gfs = ""
        const {fname,lname,email,fieldname,fileId} = jwt.decode(token,{complete:true}).payload
        const hashedPassword = await bcrypt.hash(password,Number(process.env.SALT))
        if(!fieldname=="profiePic"){
            res.statusCode = 400
            throw new Error("No profilePic Found")
        }
        if(await userModel.findOne({$or:[{userName}]})){
            res.statusCode = 400
            throw new Error("Username already taken")
        }
        if(!jwt.verify(token,process.env.JWT_TEMP_SECRET)){
            const token = jwt.sign({userId:user._id},process.env.JWT_TEMP_SECRET,{ expiresIn: Number(process.env.JWT_TEMP_EXPIRE) })
            var mailResp = await sendMail(user.email, user.userId, token, "verify")
            throw new Error("Given token is Invalid! Please Signup again")
        }
        const user = await userModel.create({fname:fname,lname:lname,email:email,userName:userName,profilePic:fileId,password:hashedPassword,isVerfied:true})     
        await fileModel.findByIdAndUpdate(fileId,{userId:user._id}) 
        return res.status(200).json({message:"user verifed successfully!proceed to login",response:user,status:200})
    }
    catch(err){
        next(err)
    }
}

const login = async(req,res,next)=>{
    try{
        const {userName,email,password} = req.body 
        const user = await userModel.findOne({email:email})
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
            response:{token,userName:user.userName,email,profilePic:user.profilePic},
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
        await sendMail(user.email, token, "resetPassword")
        res.status(200).json({
            message:"Password reset link send to the user successfully",
            response:{token},
            status:200
        })
    
    }
    catch(err){
        next(err)
    }
}

const resetPassword = async(req,res,next)=>{
    try{
        const {password,token} = req.body
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
        res.status(200).json({message:"password changed successfully",response:{},status:200})
    }
    catch(err){
        next(err)
    }
}

const sendInvite = async(req,res,next)=>{
    try{
        const {contact} = req.body
        if(!contact){
            res.statusCode = 400
            throw new Error("No UserName or Email is Provided")
        }
        let invite;
        const user = await userModel.findOne({$or:[{email:contact},{userName:contact}]})
        if(!user){
         //verify if contact is email
         await sendMail(contact, "","", "invite",req.user.userName)
         return res.status(204).json({message:"user is not on ChatWizards!.Invitation link sent via Mail",response:{},status:204})
        }
        invite = await inviteModel.create({ sender: req.user._id, receiver: user.id, inviteMessage: `${req.user.userName} wants to connect with you` });
        invite = await inviteModel.findOne({ _id: invite._id })
          .populate('sender', 'userName profilePic userId')
          .populate('receiver', 'userName profilePic userId')
          .exec();
        return res.json({message:"Invite sent to the user successfully",response:invite,status:201})
    }
    catch(err){
    next(err)        
    }
}

const showInvites = async(req,res,next)=>{
    try{
        const invites = await inviteModel.find({$or:[{sender:req.user._id},{receiver:req.user._id}]}).populate("sender","userName profilePic").populate("receiver","userName profilePic")
        return res.json({message:"invitations fetched successfully",response:invites,status:200})
    }catch(err){
        next(err)
    }
}

const updateInviteStatus = async(req,res,next)=>{
    try{
        let result,regex=/^[0-9a-fA-F]{24}$/;
        var inviteStatus = req.body.inviteStatus
        const {inviteId} = req.params
        if(!inviteId.match(regex)){
            res.status(400)
            throw new Error("Invititation Id is not valid")
        }
        if(!inviteId){
            res.statusCode = 400
            throw new Error("No invite Id provied")
        }
        const invite = await inviteModel.findByIdAndUpdate(inviteId,{inviteStatus:inviteStatus},{new:true})
                                .populate('sender', 'userName profilePic userId')
                                .populate('receiver', 'userName profilePic userId')
                                .exec();
        if(invite.inviteStatus=="accepted"){
            const updateReceiver = userModel.findByIdAndUpdate(invite.receiver._id ,
                { $addToSet: { contacts: invite.sender._id }},
                {new:true}
              ).select("userName profilePic email fname lname").lean();
              
              const updateSender = userModel.findByIdAndUpdate(invite.sender ,
                { $addToSet: { contacts: invite.receiver._id } }
              ).select("userName profilePic email fname lname").lean();
              result = await Promise.all([updateReceiver, updateSender]);        
            }
        return res.json({message:`invitation ${inviteStatus} successfully`,response:{invite,contact:result[0]},status:200})
    }
    catch(err){
        next(err)
    }
}

const deleteInvite = async(req,res,next)=>{
    try{
        const inviteId = req.params.inviteId
        const invite = await inviteModel.findByIdAndDelete(inviteId)
        if(!inviteId){
            res.statusCode = 400
            throw new Error("No invite Id provied")
        }
        return res.json({message:`invitation deleted successfully`,response:{...invite},status:200})
    }catch(err){
        next(err)
    }
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
        return res.json({message:`user removed Successfully`,response:{},status:200})
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
        return res.json({message:`invitation deleted successfully`,response:{},status:200})
    }
    catch(err){
        next(err)
    }
}

const fetchContacts = async(req,res,next)=>{
    try{
        const id = req.user._id
        if(!id){
            throw new Error("user Id is not found")
        }
        const contacts = await userModel.findById(id).select('contacts').populate("contacts","userName profilePic email")
        return res.status(200).json({message:"contacts fetched successfully",status:200,response:contacts})
    }catch(err){
        next(err)
    }
}

const deleteContact = async(req,res,next)=>{
    try{
        const {contact} = req.body
        const user = await userModel.findById(req.user._id)
        if(!user){
            res.statusCode = 400
            throw new Error("user doesn't exist to delete")
        }
        if(!contact){
            res.statusCode = 400
            throw new Error("No contact is given")
        }
        const updatedUser = await userModel.findByIdAndUpdate(req.user._id,{$pull:{contacts:contact}},{new:true}).populate("contacts","userName email fname lname profilePic")
        return res.json({status:200,message:"contact removed successfully",response:updatedUser.contacts})
    }
    catch(err){
        next(err)
    }
}

module.exports = {logOut,deleteUser,deleteContact,signUp,fetchContacts,sendInvite,showInvites,resetPassword,forgotPassword,verify,login,updateInviteStatus,deleteInvite}