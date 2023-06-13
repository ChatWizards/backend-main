const chatModel = require('../model/chat.model');
const messageModel = require('../model/message.model');
const userModel = require('../model/user.model');

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

const createChat = (req,res,next)=>{
    //can be created after accepting invite
    const chat = await chatModel.create({users:[]})
    //only after accepting user can send the message
} 

const getMessages = async (req,res,next)=>{
    const senderId = req.user._id
    const {recieverId,chatId} = req.body
    if(!chatId || !recieverId){
        res.StatusCode = 400
        throw new Error("Reciever Id or Chat Id is not provided")
    }
    const chat = await chatModel.find({$or:[{senderId:senderId,recieverId:recieverId},{chatId:chatId}]})
    const messages = await messageModel.find({chat:chatId}).populate("sender","userName profilePic").execPopulate()
    return res.json({message:"Messages fetched successfully",data:{...messages},status:200})
}

const getContacts = async (req,res,next)=>{
    let contacts = await chatModel.find({user:{$elemMatch:{$eq:req.user._id}}}).populate("users","-password").populate("lastMessage").sort({updatedAt:-1}).execPopulate()
    return res.json({status:200,data:{...contacts},message:"contacts fetched successfully"})
}


module.exports = {sendMessage,deleteMessage,createChat,updateGroupChat,getMessages,getContacts}
