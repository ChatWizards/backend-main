const {Router} = require('express')
const {sendInvite,showInvites,login,signUp,verify,deleteContact,forgotPassword,resetPassword,fetchContacts,updateInviteStatus,deleteInvite,logOut,deleteUser} = require('../controllers/user.controller')
const authUser = require('../middleware/user.middleware')
const userRouter = Router()
const multer = require('multer')
const fs = require('fs');
const path = require('path')

// const memoryStorage = multer.memoryStorage()
const diskStorage = multer.diskStorage({
    destination:function(req,file,cb){
        let url = (__dirname.split(path.sep)).slice(0,-1)
        console.log(url)
        url = url.join(path.sep)
        cb(null,path.join(url+'/uploads/'))
    },
    filename:function(req,file,cb){
        cb(null,file.originalname)
    }
})

const upload = multer({storage:diskStorage})



userRouter.route('/signup').post((req,res,next)=>{
    let url = (__dirname.split(path.sep))
    console.log(url)
    url = url.join(path.sep)
    next()
},upload.single("profilePic"),signUp)
userRouter.route('/verify').post(verify)
userRouter.route('/login').post(login)
userRouter.route('/forgotPassword').post(forgotPassword)
userRouter.route('/resetPassword').post(resetPassword)
userRouter.route('/contacts').get(authUser,fetchContacts)
userRouter.route('/invite').get(authUser,showInvites).post(authUser,sendInvite)
userRouter.route('/updateInvite/:inviteId').put(authUser,updateInviteStatus)
userRouter.route('/deleteInvite/:inviteId').delete(authUser,deleteInvite)
userRouter.route('/delete').delete(authUser,deleteUser)
userRouter.route('/deleteContact').post(authUser,deleteContact)
userRouter.route('/logout').post(authUser,logOut)
userRouter.route('*').get((req,res,next)=>{
    res.statusCode = 400
    throw new Error("Route Not found")
}).post((req,res,next)=>{
    res.statusCode = 404
    throw new Error("Route Not found")
})

module.exports = userRouter