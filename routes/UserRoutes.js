const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { jwtAuthMiddleware, generateToken } = require("./../jwt");

// for sign up  
router.post('/signup', async (req, res) => {
    try {
        const data = req.body; //request the body contains the user data
        const newUser = new User(data); //creating new user
        const response = await newUser.save(); //save the new User
        console.log('data saved');
        const payload = {
            id: response.id
        }
        console.log(JSON.stringify(payload));
        const token = generateToken(payload);
        console.log("Token is :", token);
        res.status(200).json({ response: response, token: token });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Internal server Error" })
    }
})
// for login 
router.post("/login", async (req, res) => {
    try {
        const { aadharCardNumber, password } = req.body; //request aadharCardNumber and Password from the body contains
        
        
        if (!aadharCardNumber || !password) {
            return res.status(400).json({ error: "Aadhar Card Number and Password are required" });
        };
        
        const user = await User.findOne({ aadharCardNumber: aadharCardNumber });
        if(!user){
            return res.status(401).json({error:"Invalid username or password"})
        }
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid){
            return res.status(401).json({ error: "Invalid username or password" });
        };

        const payload = {
            id: user.id,
        }
        const token = generateToken(payload);
        res.json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" })
    }
});

// for profile route 
router.get("/profile", jwtAuthMiddleware, async (req, res) => {
    try {
        const userData = req.user;
        const userId = userData.id;
        const user = await User.findById(userId)
        res.status(200).json({user});
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
})

// password
router.put("/profile/password", jwtAuthMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;
        if(!currentPassword || !newPassword) {
            return res.status(400).json({error :"Both currentPassword and newPassword are required"})
        }
        const user = await User.findById(userId); //finding the user id
        if (!user || !(await user.comparePassword(currentPassword))) {
            return res.status(401).json({ error: "Invalid username or password" });
        }
        user.password = newPassword;
        await user.save();
        console.log("password updated");
        res.status(200).json({ message: "Password updated" });   
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Internal server error" });
    }
})
module.exports = router