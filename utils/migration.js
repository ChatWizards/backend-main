const {connect} = require('./utils/db')
const {faker} = require('./utils/faker')
const mongoose = require('mongoose')
const {userModel,contactModel,chatModel,inviteModel,messageModel} = require('../model')
const bcrytpt = require('bcryptjs')
require('dotenv').config()

async function main(){
    await connect()
    await createUser()
    await createPost()
}

async function setUpBaseUser(){
    const username = "john_doe@123"
    const fname = "john"
    const lname = "doe"
    const password = await bcrytpt.hash("demo password",process.env.SALT)
    const email = "john@doe.com"
    const profilePic = 'https://www.mnp.ca/-/media/foundation/integrations/personnel/2020/12/16/13/57/personnel-image-4483.jpg?h=800&w=600&hash=9D5E5FCBEE00EB562DCD8AC8FDA8433D'
    
    await mongoose.connection.dropDatabase()
    const user = await userModel.create({
        username,
        password,
        email,
        fname,lname,
        isVerfied:true,
        contacts:[],
        profilePic
    })
    return user
}
