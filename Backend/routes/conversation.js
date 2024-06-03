const express = require('express')
const router = express.Router()
const Conversation = require('../modules/Conversation')
const User = require('../modules/User')

router.post('/', async (req, res) => {
    const { senderId, receiverId } = req.body;
    try {
        const members = [senderId, receiverId];
        // Use findOne or find with appropriate query to check existing conversation
        let conversation1 = await Conversation.findOne({ members: { $all: members } });
        if (conversation1) {
            conversation1.Date = Date.now()  // Call Date.now() to get the current timestamp
            await conversation1.save();  // Save the updated date if needed
            return res.status(400).send("The conversation already exists");
        }
        const conversation = await Conversation.create({
            members: [senderId, receiverId]
        });
        res.status(201).json(conversation);  // Use 201 status code for created resource
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Some error occurred");
    }
});


router.get('/:userId',async(req,res)=>{
    try{
        const userId = req.params.userId
        const conversations = await Conversation.find({members: {$in: [userId]}})
        const conversationUserData = Promise.all(conversations.map(async(conversation)=>{
            const receiverId = conversation.members.find(member=>member!==userId)
            const user = await User.findById(receiverId)
            return {user:{name:user.name,email:user.email,userId:user._id},conversationId:conversation._id,Date: conversation.Date}
        }))
        res.status(200).json(await conversationUserData)
    }
    catch(error){
        console.log(error)
    }
})
module.exports = router