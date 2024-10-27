const {fetchContacts,deleteContact} = require('../controllers/contact.controller')
const auth = require('../middleware/user.middleware')

const {Router} = require('express')

const contactRouter = Router()

contactRouter.route('/').get(auth,fetchContacts)
contactRouter.route('/remove/:id').get(auth,deleteContact)

module.exports = contactRouter