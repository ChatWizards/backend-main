const {Router} = require('express')
const authUser = require("../middleware/user.middleware")
const {
       getMessages,createChat,
       getContacts,sendMessage,
       deleteMessage, updateGroupMembers, createGroupChat,getChats, deleteChat
       } = require('../controllers/chat.controller')

const chatRouter = Router()

chatRouter.route("/").get(authUser,getChats)
chatRouter.route('/contacts').post(authUser,getContacts)
chatRouter.route('/send').post(authUser,sendMessage)
chatRouter.route('/delete/:chatId').get(authUser,deleteChat)
chatRouter.route('/deletemessage/:messageId')
chatRouter.route('/updateGroup').post(authUser,updateGroupMembers)
chatRouter.route('/create').post(authUser,createChat)
chatRouter.route('/get').post(authUser,getMessages)

module.exports = chatRouter