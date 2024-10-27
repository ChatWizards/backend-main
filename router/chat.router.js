const {Router} = require('express')
const authUser = require("../middleware/user.middleware")
const {
       getMessages,createChat,
       sendMessage,
       deleteMessage, updateGroupMembers, getChats, deleteChat
       } = require('../controllers/chat.controller')
const { upload } = require('../utils/storage')

const chatRouter = Router()

chatRouter.route("/").get(authUser,getChats)
chatRouter.route('/send').post(upload.array('message_files'),authUser,sendMessage)
chatRouter.route('/delete/:chatId').get(authUser,deleteChat)
chatRouter.route('/deletemessage/:messageId').delete(authUser,deleteMessage)
chatRouter.route('/updateGroup').post(authUser,updateGroupMembers)
chatRouter.route('/create').post(authUser,createChat)
chatRouter.route('/getMessages').post(authUser,getMessages)

module.exports = chatRouter