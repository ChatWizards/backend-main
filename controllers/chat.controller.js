const { default: mongoose } = require('mongoose');
const chatModel = require('../model/chat.model');
const messageModel = require('../model/message.model');
const userModel = require('../model/user.model');
const sendMail = require('../utils/sendMail');
const { getFileUrl } = require('../utils/storage');
const { request } = require('express');

const getChats = async(req,res,next)=>{
    try{
        const chats = await chatModel.find({
            users: {$elemMatch:{$eq:req.user._id }}
        }).populate("users","fname lname userName email profilePic")
        .populate({path:"lastMessage",populate:{path:"sender",model:"user",select:"userName"}})
        .sort({updatedAt:-1}).lean().exec()
        
        const parsedChats = await Promise.all(chats.map(async(ele)=>{
            let file = null
            let chatName = ele.chatName
            if(ele.groupPic){
                const id = new mongoose.Types.ObjectId(ele.groupPic) 
                file = await getFileUrl(id)
            }else {
                const memoizedPics = {}
                const sender = ele.users.filter(ele=>ele._id.toString()!=req.user._id.toString())[0]
                const profilePic = sender.profilePic
                if(!chatName) chatName = sender.userName
                console.log
                if(!memoizedPics[profilePic]){
                    const parsedImageId = new mongoose.Types.ObjectId(profilePic)
                    memoizedPics[profilePic] = await getFileUrl(parsedImageId)
                }
                file = memoizedPics[profilePic]
            }
            return JSON.parse(JSON.stringify({
                ...ele,
                chatName:chatName,
                groupPic: file
            }));
        
        }))
        return res.json({status:200,response:parsedChats,message:"chat fetched successfully"})
    }
    catch(err){
        next(err)
    }
}

const createChat = async(req,res,next)=>{
    try{
    let chat,userIds=[];
    let chatName = req.body.chatName
    const {users,chatType,groupPic} = req.body
    if(!users.length){
        res.StatusCode = 400
        throw new Error("Invalid Request")
    }
    const query = { $or:[{email: { $in : users }}, {userName:{$in : users}}]};
    if(chatType==="indivisual"){
        if(req.user.email==users[0]){
            res.StatusCode = 400
            throw new Error("You cannot enter your own email")
        }
        const user = await userModel.find(query).select('userName email profilePic fname lname')
        if(user==null || user.length==0 || user=={}){
            await sendMail(users[0], "","", "invite",req.user.userName)
            return res.status(200).json({message:"user is not on ChatWizards. But we sent an invitation to invite to platform",response:{},status:200})
        }
        chatName = ''
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
    chat = (await chatModel.create({users:userIds,chatType:chatType,chatName:chatName,groupPic:groupPic}))
    let chats = await chatModel.find({users:{$elemMatch:{$eq:req.user._id}}})
        .populate("users","fname lname userName email profilePic")
        .populate({path:"lastMessage",populate:{path:"sender",model:"user",select:"userName"}}).exec()
    return res.status(201).json({status:201,response:chats,message:"Chat created successfully"})
    }
    catch(err){
        next(err)
    }
} 

const sendMessage = async (req,res,next)=>{
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
        const fileIds = req.files?req.files.map(file=>file.id):[]
        message = await messageModel
        .create({content:messageContent,chat:chat._id,sender:senderId,files:fileIds})
        message = await message.populate("sender","userName profilePic")
        chat.lastMessage = message._id
        await chat.save()
        const parsedImageId = new mongoose.Types.ObjectId(message.sender.profilePic)
        const profilePic = await getFileUrl(parsedImageId)
        const parsedMessage = {
            ...message._doc,
            sender: {
                ...message.sender._doc,
                profilePic: profilePic
            }
        }
        console.log(parsedMessage);
        if(req.type=="webSocket") return {status:201,message:"message delivered successfully",response:{chat,message:parsedMessage}}
        return res.json({status:201,message:"message delivered successfully",response:{chat,message:parsedMessage}})    
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
        const messages = await messageModel.find({chat:chatId}).populate("sender","userName profilePic").lean().exec()
        const parsedMessages = await Promise.all(messages.map(async(ele)=>{
            const memoizedPics = {}
            const files = await Promise.all(ele.files.map(async(file)=>{
                const fileUrl = getFileUrl(new mongoose.Types.ObjectId(file))
                return fileUrl
            }))
            if(!memoizedPics[ele.sender.profilePic]){
                const id = new mongoose.Types.ObjectId(ele.sender.profilePic)
                memoizedPics[ele.sender.profilePic] = await getFileUrl(id)    
            }
            return JSON.parse(JSON.stringify({
                ...ele,
                files:files,
                sender:{
                    ...ele.sender,
                    profilePic:memoizedPics[ele.sender.profilePic]
                }
            }))
        }))
        return res.json({message:"Messages fetched successfully",response:parsedMessages,status:200})    
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


module.exports = {sendMessage,deleteMessage,createChat,getChats,updateGroupMembers,getMessages,deleteChat}
