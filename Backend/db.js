const mongoose = require('mongoose')

const mongoURI = 'mongodb://localhost:27017/ChatApp'

const connectToMongo = ()=>{
    mongoose.connect(mongoURI,()=>{
        console.log("connected to MongoDB Successfully")
    })

}
module.exports = connectToMongo