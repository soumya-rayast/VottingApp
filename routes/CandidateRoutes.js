const express = require("express");
const router = express.Router();
const User = require("../models/candidate");
const { jwtAuthMiddleware, generateToken } = require("../jwt");
const Candidate = require("../models/candidate")

const checkAdminRole = async (userID) => {
    try {
        const user = await user.findById(userID)
        return user.role === 'admin';
    } catch (error) {
        return false;
    }
}
router.post("/", jwtAuthMiddleware, async (req, res) => {
    try {
        if (!checkAdminRole(req.user.id))
            return res.status(403).json({ message: 'user does not have admin role' })
        const data = req.body;
        const newCandidate = new Candidate(data);

        const response = await newCandidate.save();
        console.log('data saved');

        const payload = {
            id: response.id
        }
        console.log(JSON.stringify(payload));
        const token = generateToken(payload);
        console.log("Token is :", token);

        res.status(200).json({ response: response })
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
})

router.put("/:candidateID",jwtAuthMiddleware, async (req, res) => {
    try {
        if (!checkAdminRole(req.user.id))
            return res.status(404).json({ message: 'user has not admin role' });
        const candidateID = req.params.candidateID;
        const updatedCandidateData = req.body;

        const response = await Candidate.findByIdAndUpdate(candidateID, updatedCandidateData, {
            new: true,
            runValidators: true,
        })
        if (!response) {
            return res.status(404).json({ error: "Candidate not found" });
        }
        console.log("candidate data updated");
        res.status(200).json(response);
    } catch (error) {
        console.log(err);
        res.status(500).json({ error: "internal sever Error " })
    }
})
router.delete("/:candidateID",jwtAuthMiddleware, async (req, res) => {
    try {
        if (!checkAdminRole(req.user.id))
            return res.status(404).json({ message: 'user does not have admin role' });
        const candidateID = req.params.candidateID;

        const response = await Person.findByIdAndDelete(candidateID);
        if (!response) {
            return res.status(404).json({ error: "Candidate not found" });
        }
        console.log("candidate data updated");
        res.status(200).json(response);
    } catch (error) {
        console.log(err);
        res.status(500).json({ error: "internal sever Error " })
    }
});


module.exports = router;