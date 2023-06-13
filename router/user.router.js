const {Router} = require('express')
const {sendInvite,showInvites,login,signUp,verify,forgotPassword,resetPassword,updateInviteStatus,deleteInvite,logOut,deleteUser} = require('../controllers/user.controller')

const userRouter = Router()

userRouter.route('/:id').post(sendInvite)
userRouter.route('/invites').post(showInvites)
userRouter.route('/login').post(login)
userRouter.route('/signup').post(signUp)
userRouter.route('/verify/:token').post(verify)
userRouter.route('/forgotPassword').post(forgotPassword)
userRouter.route('/reset/:token').post(resetPassword)
userRouter.route('/update').put(updateInviteStatus)
userRouter.route('/logout').post(logOut)
userRouter.route('/delete').route(deleteUser)

module.exports = userRouter