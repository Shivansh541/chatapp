const express = require('express')
const router = express.Router()
const User = require('../modules/User')
const { body, validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const fetchuser = require('../middleware/fetchuser')

const JWT_SECRET = "hi i am shivansh singh rathore"

router.post('/createuser',
    [
        body('name', 'Enter a valid name').isLength({ min: 3 }),
        body('email', "Enter a valid email").isEmail(),
        body('password', 'Enter a valid password').isLength({ min: 5 })
    ],
    async (req, res) => {
        let success = false
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }
        try {
            let user = await User.findOne({ email: req.body.email })
            if (user) {
                return res.status(400).json({ error: "User With this email already exists" })
            }
            if(req.body.password!==req.body.confirmPassword){
                return res.status(400).json({ error: "Confirm Password and Password do not match!" })
            }
            const salt = await bcrypt.genSalt(10)
            const secPass = await bcrypt.hash(req.body.password, salt)
            user = await User.create({
                name: req.body.name,
                email: req.body.email,
                password: secPass,
            })
            const data = {
                user: {
                    id: user.id
                }
            }
            const authToken = jwt.sign(data, JWT_SECRET)
            success=true
            res.json({'success':success, 'authToken': authToken })
        } catch (error) {
            console.log(error.message)
            res.status(500).send("some error occured")
        }
    })

router.post('/login',
    [
        body('email', "Enter a valid email").isEmail(),
        body('password', 'Password should not be blank').exists()
    ],
    async (req, res) => {
        let success=false
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }
        const {email, password} = req.body
        try {
            let user = await User.findOne({ email })
            if (!user) {
                return res.status(400).json({ error: "Account Not Found! Either you have entered the details wrong or not created an account" })
            }

            const passwordCompare = await bcrypt.compare(password, user.password)
            if (!passwordCompare) {
                return res.status(400).json({ error: "Please try to login with correct credentials" })
            }
            const data = {
                user: {
                    id: user.id
                }
            }
            const authToken = jwt.sign(data, JWT_SECRET)
            success=true
            res.json({'success': success, 'authToken': authToken })
        } catch (error) {
            success=false
            console.log(error.message)
            res.status(500).send("some error occured")
        }
    }
)

router.post('/getuser', fetchuser, async(req,res)=>{
    try{
        userId=req.user.id
        const user=await User.findById(userId).select('-password')
        res.send(user)
    } catch(error){
        console.log(error.message)
        return res.status(500).send("Internal Server Error")
    }
})
router.put('/addContact/:id', fetchuser, async (req, res) => {
    try {
        const { email } = req.body;
        const userId = req.params.id;

        // Retrieve the user by ID
        let user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).send("User not found");
        }

        // Retrieve the contact user by email
        let contact = await User.findOne({ email }).select('-password -contacts');
        if (!contact) {
            return res.status(400).json({ error: "The contact you are trying to add is not using the app" });
        }

        // Check if the contact is already in the user's contact list
        if (user.contacts.some(c => c._id.toString() === contact._id.toString())) {
            return res.status(400).json({ error: "The contact you are trying to add already exists in your contact list" });
        }

        // Add the contact to the user's contact list
        user.contacts.push(contact);
        await user.save();

        res.json({ user });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router