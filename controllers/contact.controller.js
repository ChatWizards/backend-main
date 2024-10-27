const userModel = require('../model/user.model')
const {getFileUrl} = require('../utils/storage')

const fetchContacts = async(req,res,next)=>{
    try{
        const id = req.user._id
        if(!id){
            throw new Error("user Id is not found")
        }
        const unparsedContacts = await userModel.findById(id).select('contacts').populate("contacts","userName profilePic email")
        const parsedContacts = await Promise.all(unparsedContacts.contacts.map(async(ele)=>{
            return JSON.parse(JSON.stringify({
                ...ele._doc,
                profilePic:await getFileUrl(ele.profilePic)
            }))
        }))
        return res.status(200).json({message:"contacts fetched successfully",status:200,response:parsedContacts})
    }catch(err){
        next(err)
    }
}

const deleteContact = async(req,res,next)=>{
    try{
        const contact = req.params.id
        const user = await userModel.findById(req.user._id)
        if(!user){
            res.statusCode = 400
            throw new Error("user doesn't exist to delete")
        }
        if(!contact){
            res.statusCode = 400
            throw new Error("No contact is given")
        }
        const updatedUser = await userModel.findByIdAndUpdate(req.user._id,{$pull:{contacts:contact}},{new:true}).populate("contacts","userName email fname lname profilePic")
        const parsedContacts = await Promise.all(updatedUser.contacts.map(async(ele)=>{
            return JSON.parse(JSON.stringify({
                ...ele._doc,
                profilePic:await getFileUrl(ele.profilePic)
            }))
        }))
        return res.json({status:200,message:"contact removed successfully",response:parsedContacts})
    }
    catch(err){
        next(err)
    }
}

module.exports = {fetchContacts,deleteContact}