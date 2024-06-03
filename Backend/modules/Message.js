const mongoose = require('mongoose')
const {Schema} = mongoose

const MessageSchema = new Schema({
    conversationId:{
        type: String,
        required: true
    },
    senderId:{
        type:String,
        required: true
    },
    message:{
        type:String,
        required: true
    },
    Date:{
        type:Date,
        default: Date.now
    }
})
const Message = mongoose.model('Message',MessageSchema)
module.exports = Message