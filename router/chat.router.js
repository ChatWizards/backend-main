const {Router} = require('express')
const {
       getMessages,createChat,
       getContacts,sendMessage,
       deleteMessage,updateGroupChat, 
       getMessages} = require('../controllers/chat.controller')

const chatRouter = Router()

chatRouter.route("/:id").get(getMessages)
chatRouter.route("/:id").post(createChat)
chatRouter.route('/contacts').post(getContacts)
chatRouter.route('/send').post(sendMessage)
chatRouter.route('/delete').post(deleteMessage)
chatRouter.route('/update').post(updateGroupChat)

module.exports = chatRouter