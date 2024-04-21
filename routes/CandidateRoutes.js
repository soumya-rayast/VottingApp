const express = require("express");
const router = express.Router();
const User = require("../models/candidate");
const { jwtAuthMiddleware, generateToken } = require("../jwt");
const Candidate = require("../models/candidate")

const checkAdminRole = async (userID) => {
    try {
        const user = await user.findById(userID)
        if (user.role === "admin") {
            return true;
        }
    } catch (error) {
        return false;
    }
}
router.post("/", jwtAuthMiddleware, async (req, res) => {
    try {
        if (! await checkAdminRole(req.user.id))
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

router.put("/:candidateID", jwtAuthMiddleware, async (req, res) => {
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
router.delete("/:candidateID", jwtAuthMiddleware, async (req, res) => {
    try {
        if (!checkAdminRole(req.user.id))
            return res.status(404).json({ message: 'user does not have admin role' });
        const candidateID = req.params.candidateID;

        const response = await Person.findByIdAndDelete(candidateID);
        if (!response) {
            return res.status(404).json({ error: "Candidate not found" });
        }
        console.log("candidate deleted");
        res.status(200).json(response);
    } catch (error) {
        console.log(err);
        res.status(500).json({ error: "internal sever Error " })
    }
});
// for voting 
router.post("/vote/:candidateID", jwtAuthMiddleware, async (req, res) => {
    // no admin can vote 
    // user can only vote 

    candidateID = req.params.candidateID;
    userID = req.user.id;
    try {
        const candidate = await User.findById(candidateID);
        if (!candidate) {
            return res.status(404).json({ message: "Candidate not found" });
        }
        const user = await User.findById(userID);
        if (!user) {
            return res.status(404).json({ message: "user not found" })
        }
        if (user.isVoted) {
            res.status(400).json({ message: "You have already voted" })
        }
        if (user.role == "admin") {
            res.status(403).json({ message: "admin is not allowed" })
        };
        candidate.votes.push({ user: userID });
        candidate.voteCount++;
        await candidate.save();

        // updating the user document 
        user.isVoted = true;
        await user.save();
        res.status(200).json({ message: "voted recorded successfully " })

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "internal sever Error " })
    }
})

// vote count 
router.post("/vote/count", async (req, res) => {
    try {
        const candidate = await Candidate.find().sort({ voteCount: "desc" });
        const voterecord = candidate.map((data) => {
            return {
                party: data.party,
                count: data.voteCount
            }
        })
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "internal sever Error " })
    }
})
module.exports = router;