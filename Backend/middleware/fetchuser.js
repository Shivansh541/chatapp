const jwt = require('jsonwebtoken')
const JWT_SECRET = "hi i am shivansh singh rathore"


const fetchuser =(req,res,next)=>{
    const token = req.header('auth-token')
    if(!token){
        return res.status(401).send("Please authenticate using a valid token1")
    }
    try {
        const data= jwt.verify(token, JWT_SECRET)
        req.user=data.user;
        next()
    } catch (error) {
        return res.status(401).send("Please authenticate using a valid token2")
    }
}
module.exports= fetchuser