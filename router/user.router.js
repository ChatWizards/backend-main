const {Router} = require('express')
const {sendInvite,showInvites,login,signUp,verify,forgotPassword,resetPassword,updateInviteStatus,deleteInvite,logOut,deleteUser} = require('../controllers/user.controller')
const authUser = require('../middleware/user.middleware')
const userRouter = Router()

userRouter.route('/signup').post(signUp)
userRouter.route('/verify/:token').get(verify)
userRouter.route('/login').post(login)
userRouter.route('/forgotPassword').post(forgotPassword)
userRouter.route('/resetPassword/:token').post(resetPassword)
userRouter.route('/invite').get(authUser,showInvites).post(authUser,sendInvite)
userRouter.route('/updateInvite/:inviteId').put(authUser,updateInviteStatus)
userRouter.route('/delete').delete(authUser,deleteUser)
userRouter.route('/logout').post(authUser,logOut)

module.exports = userRouter