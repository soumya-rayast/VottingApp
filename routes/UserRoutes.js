const express = require("express");
const router = express.Router();
const User = require("./models/User");
const {jwtAuthMiddleware ,generateToken} = require("./../jwt");

// for sign up 
router.post('/signup' ,async (req,res)=>{
    try {
        const data = req.body;
        const newUser = new User(data);
        const response = await newUser.save();
        console.log('data saved');
        const payload = {
            id:response.id,
        }
        console.log(JSON.stringify(payload));
        const token = generateToken(payload);
        console.log("Token is :",token);
        res.status(200).json({response : response,token : token});
    } catch (err) {
        console.log(err);
        res.status(500).json({error : "Internal server Error"})
    }
})

// for login 
router.post("/login" ,async (req,res)=>{
    try {
        const {aadharCardNumber ,password} = req.body;
        const user = await User.findOne({aadharCardNumber:aadharCardNumber});

        if(!user || (await user.comparePassword(password))){
            return res.status(401).json({error : "Invalid username or password"});
        }

        const payload = {
            id: user.id,
        }
        const token = generateToken(payload);
        re.json({token});
    } catch (err) {
        console.error(err);
        res.status(500).json({error :"Internal server error"})
    }
});
// for profile route 
router.get("/profile",jwtAuthMiddleware,async (req,res)=>{
    try {
        const userData  = req.user;
        const userId = userData.id;
        const user = await User.findOne({userId:})
        res.status(200).json("user")
    } catch (err) {
        console.error(err);
        res.status(500).json({error : "Internal Server Error"});
    }
})

// 
router.put("/profile/password", async (req,res)=>{
    const userId = req.user;
    const {currentPassword , newPassword} = req.body;

    const user = await User.findById(userId);

    if(!user || (await user.comparePassword(password))){
        return res.status(401).json({error:"Invalid username or password"});
    }
})