const chatModel = require('../model/chat.model');
const messageModel = require('../model/message.model');

const getChats = async(req,res,next)=>{
    const chats = await chatModel.find({
        users: {$elemMatch:{$eq:req.user._id }}
    }).populate("users","fname lname userName email profilePic").populate("lastMessage").sort({updatedAt:-1}).exec()
    return res.json({status:200,data:{chats},message:"chat fetched successfully"})
}

const createChat = async(req,res,next)=>{
    try{
    let chat;
    const {users,type,groupPic} = req.body
    if(!users.length){
        res.StatusCode = 400
        throw new Error("Invalid Request")
    }
    users.push(req.user._id.toString())
    console.log(users)
    if(type!="group"){
        chat = await chatModel.find({users: { $all: users },chatType:{$ne:"group"}}) 
        if(chat.length){
            res.statusCode = 400
            throw new Error("chat already exists")
        }     
    }
    
    chat = await chatModel.create({users:users,chatType:type,groupPic:groupPic})
    const chats = await chatModel.find({users:{$elemMatch:{$eq:req.user._id}}}).populate("users","fname lname userName email profilePic").populate("lastMessage").sort({updatedAt:-1}).exec()
    return res.json({status:200,data:{chats},message:"Chat created successfully"})
    }
    catch(err){
        next(err)
    }
} 

const sendMessage = async (req,res,next)=>{
    try{
        const {recieverId,chatId,messageContent} = req.body
        const senderId = req.user._id
        let chat,message;
        
        if(!recieverId||!chatId){
            res.StatusCode = 400
            throw new Error("No chatId or Reciever Id to send the message")
        }
        if(chatId){chat = await chatModel.findById(chatId)}
        else chat = await chatModel.find({chatType:"indivisual",
        $and: [
            { users: { $elemMatch: { $eq: senderId } } },
            { users: { $elemMatch: { $eq: recieverId } } },
        ]})
        if(!chat) {
            res.statusCode = 400
            throw new Error("send invite to chat")
        }
        message = await messageModel.create({content:messageContent,chat:chat._id,sender:senderId})
        message = await message.populate("sender","userName").execPopulate()
        chat.lastMessage = message
        await chat.save()
        return res.json({status:201,message:"message delivered successfully",data:{chat}})    
    }
    catch(err){
        next(err)
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
        return res.json({status:200,message:"message deleted successfully",data:{message}})
    }
    catch(err){
        next(err)
    }
}


const getMessages = async (req,res,next)=>{
    try{
        const senderId = req.user._id
        const {recieverId,chatId} = req.body
        if(!chatId || !recieverId){
            res.StatusCode = 400
            throw new Error("Reciever Id or Chat Id is not provided")
        }
        const chat = await chatModel.find({$or:[{senderId:senderId,recieverId:recieverId},{chatId:chatId}]})
        const messages = await messageModel.find({chat:chat._id}).populate("sender","userName profilePic").execPopulate()
        return res.json({message:"Messages fetched successfully",data:{...messages},status:200})    
    }
    catch(err){
        next(err)
    }
}

const getContacts = async (req,res,next)=>{
    try{
        let contacts = await chatModel.find({user:{$elemMatch:{$eq:req.user._id}}}).populate("users","-password").populate("lastMessage").sort({updatedAt:-1}).execPopulate()
        return res.json({status:200,data:{...contacts},message:"contacts fetched successfully"})
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
        return res.json({status:200,data:{},message:"chat deleted successfully"})    
    }catch(err){
        next(err)
    }
}


module.exports = {sendMessage,deleteMessage,createChat,getChats,updateGroupMembers,getMessages,getContacts,deleteChat}
