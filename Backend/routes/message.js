const express = require('express')
const router = express.Router()
const Message = require('../modules/Message');
const User = require('../modules/User');
const Conversation = require('../modules/Conversation');


router.post('/', async (req, res) => {
    try {
        const { conversationId, senderId, message ,receiverId } = req.body;
        if(!senderId || !message) return res.status(400).send("Please fill all required fields")
        if(!conversationId && receiverId){
            const conversation = new Conversation({members: [senderId, receiverId]})
            await conversation.save()
            const newMessage = new Message({ conversationId: conversationId._id, senderId: senderId, message: message })
            await newMessage.save()
            return res.status(200).send(newMessage)
        }
        const newMessage = await Message.create({
            conversationId: conversationId,
            senderId: senderId,
            message: message,
        })
        return res.send(newMessage)
    } catch (error) {
        console.log(error.message)
        return res.status(500).send("Internal Server Error")
    }
})
router.get('/:conversationId',async(req,res)=>{
    try{
        const conversationId = req.params.conversationId
        if(!conversationId) return res.status(200).json([])
        const messages = await Message.find({conversationId: conversationId})
        const messageUserData = Promise.all(messages.map(async(message)=>{
            const user = await User.findById(message.senderId)
            return {user:{name:user.name,email:user.email,userId: user._id},messageId:message._id,message:message.message}
        }))
        // console.log(messages)
        res.status(200).json(await messageUserData)
    }
    catch(error){
        console.log(error)
    }
})
module.exports = router