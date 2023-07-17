const chatModel = require('../model/chat.model');
const messageModel = require('../model/message.model');
const userModel = require('../model/user.model');
const sendMail = require("../utils/sendMail")

const getChats = async(req,res,next)=>{
    try{
        const chats = await chatModel.find({
            users: {$elemMatch:{$eq:req.user._id }}
        }).populate("users","fname lname userName email profilePic")
        .populate({path:"lastMessage",populate:{path:"sender",model:"user",select:"userName"}})
        .sort({updatedAt:-1}).exec()
        return res.json({status:200,response:chats,message:"chat fetched successfully"})
    }
    catch(err){
        next(err)
    }
}

const createChat = async(req,res,next)=>{
    try{
    let chat,userIds=[];
    let chatName = req.body.chatName || ""
    const {users,chatType,groupPic} = req.body
    console.log(users)
    if(!users.length){
        res.StatusCode = 400
        throw new Error("Invalid Request")
    }
    const query = { $or:[{email: { $in : users }}, {userName:{$in : users}}]};
    if(chatType==="indivisual"){
        const user = await userModel.find(query).select('userName email groupPic fname lname')
        console.log(JSON.stringify(user))
        if(user==null || user.length==0 || user=={}){
            await sendMail(users[0], "","", "invite",req.user.userName)
            return res.status(204).json({message:"user is not on ChatWizards",response:{},status:204})
        }
        userIds.push(req.user._id)
        userIds.push(user[0]._id)    
        chat = await chatModel.find({users: { $all: userIds },chatType:{$ne:"group"}}) 
    }else{
        userIds = users
        userIds.push(req.user._id)
    }
    if(chat&&chat.length){
        res.statusCode = 400
        throw new Error("chat already exists")
    }     
    chat = await chatModel.create({users:userIds,chatType:chatType,chatName:chatName,groupPic:groupPic})
    let chats = await chatModel.find({users:{$elemMatch:{$eq:req.user._id}}}).populate("users","fname lname userName email groupPic").exec()
    return res.json({status:200,response:chats,message:"Chat created successfully"})
    }
    catch(err){
        next(err)
    }
} 

const sendMessage = async (req,res,next={})=>{
    try{
        const {chatId,messageContent} = req.body
        const senderId = req.user._id
        let chat,message;
        if(!chatId){
            res.statusCode = 400
            throw new Error("No chatId to send the message")
        }
        chat = await chatModel.findById(chatId)
        if(!chat) {
            res.statusCode = 400
            throw new Error("send invite to chat")
        }
        console.log(messageContent)
        message = await messageModel.create({content:messageContent,chat:chat._id,sender:senderId})
        message = await message.populate("sender","userName profilePic")
        chat.lastMessage = message._id
        await chat.save()
        console.log(message)
        if(req.type=="webSocket") return {status:201,message:"message delivered successfully",response:{chat,message}}
        return res.json({status:201,message:"message delivered successfully",response:{chat,message}})    
    }
    catch(err){
        if(req.type!="webSocket") next(err)
    }
}

const deleteMessage = async (req,res,next)=>{
    try{
        const {messageId} = req.params
        if(!messageId){
            res.StatusCode = 400
            throw new Error("Invalid request!! unable to delete message")
        }
        const message = await messageModel.findByIdAndDelete(messageId)
        //code to check if the message is latest message
        // await chatModel.findOneAndDelete({message:messageId})
        return res.json({status:200,message:"message deleted successfully",response:message})
    }
    catch(err){
        next(err)
    }
}


const getMessages = async (req,res,next)=>{
    try{
        const senderId = req.user._id
        const {recieverId,chatId} = req.body
        if(!chatId && !recieverId){
            res.StatusCode = 400
            throw new Error("Reciever Id or Chat Id is not provided")
        }
        const chat = await chatModel.find({$and:[{senderId:senderId,recieverId:recieverId},{chatId:chatId}]})
        const messages = await messageModel.find({chat:chatId}).populate("sender","userName profilePic").exec()
        return res.json({message:"Messages fetched successfully",response:messages,status:200})    
    }
    catch(err){
        next(err)
    }
}

const getContacts = async (req,res,next)=>{
    try{
        let contacts = await chatModel.find({user:{$elemMatch:{$eq:req.user._id}}}).populate("users","-password").populate("lastMessage").sort({updatedAt:-1}).execPopulate()
        return res.json({status:200,response:{...contacts},message:"contacts fetched successfully"})
    }
    catch(err){
        next(err)
    }
}

const updateGroupMembers = async(req,res,next)=>{
    try{
        const {chatId} = req.params
        let chat,regex=/^[0-9a-fA-F]{24}$/;
        if(!chatId.match(regex)){
            res.statusCode = 400
            throw new Error("Invalid ChatId")
        }
        switch(req.body.type){
            case 'remove':
                chat = await chatModel.findByIdAndUpdate(chatId,{$pull:{users:{ $in: req.body.members}}})
            case 'add':
                chat = await chatModel.findByIdAndUpdate(chatId,{$push:{users:{ $in: req.body.members}}})
        }
    }catch(err){
        next(err)
    }
}



const deleteChat = async(req,res,next)=>{
    try{
        const {chatId} = req.params
        let regex=/^[0-9a-fA-F]{24}$/;
        if(!chatId.match(regex)){
            res.statusCode = 400
            throw new Error("Invalid ChatId")
        }
            const chat = await chatModel.findByIdAndDelete(chatId)
        return res.json({status:200,response:{},message:"chat deleted successfully"})    
    }catch(err){
        next(err)
    }
}


module.exports = {sendMessage,deleteMessage,createChat,getChats,updateGroupMembers,getMessages,getContacts,deleteChat}
