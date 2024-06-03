const mongoose = require('mongoose')
const {Schema} = mongoose

const ConversationSchema = new Schema({
    members:{
        type: Array,
        required: true
    },
    Date:{
        type:Date,
        default: Date.now
    }
})
const Conversation = mongoose.model('Conversation',ConversationSchema)
module.exports = Conversation