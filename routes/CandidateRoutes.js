const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { jwtAuthMiddleware, generateToken } = require("../jwt");
const Candidate = require("../models/candidate");


// for admin check 
const checkAdminRole = async (userID) => {
    try {
        const user = await User.findById(userID)
        if (user.role === "admin") {
            return true;
        }
    } catch (err) {
        return false;
    }
}

// new candidate register 
router.post("/", jwtAuthMiddleware, async (req, res) => {
    try {
        if (!(await checkAdminRole(req.user.id)))
            return res.status(403).json({ message: 'user does not have admin role' })
        const data = req.body;
        const newCandidate = new Candidate(data);
        const response = await newCandidate.save();
        console.log('data saved');
        res.status(200).json({ response: response });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
})
//update candidate profile 
router.put("/:candidateID", jwtAuthMiddleware, async (req, res) => {
    try {
        if (!checkAdminRole(req.user.id))
            return res.status(403).json({ message: 'user does not have admin role' });
        const candidateID = req.params.candidateID;
        const updatedCandidateData = req.body;
        // Ensuring candidateID is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(candidateID)) {
            return res.status(400).json({ error: "invalid Candidate ID" })
        }
        const response = await Candidate.findByIdAndUpdate(candidateID, updatedCandidateData, {
            new: true,
            runValidators: true,
        });
        if (!response) {
            return res.status(404).json({ error: "Candidate not found" });
        }
        console.log('Candidate Data updated');
        res.status(200).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Internal sever Error " })
    }
})


router.delete("/:candidateID", jwtAuthMiddleware, async (req, res) => {
    try {
        if (!checkAdminRole(req.user.id))
            return res.status(403).json({ message: 'user does not have admin role' });

        const candidateID = req.params.candidateID;
        const response = await Candidate.findByIdAndDelete(candidateID);

        if (!response) {
            return res.status(404).json({ error: "Candidate not found" });
        }
        console.log("candidate deleted");
        res.status(200).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Internal sever Error " })
    }
});


// for voting 
router.get("/vote/:candidateID", jwtAuthMiddleware, async (req, res) => {
    // no admin can vote 
    // user can only vote 
    candidateID = req.params.candidateID;
    userId = req.user.id;
    try {
        const candidate = await Candidate.findById(candidateID);
        if (!candidate) {
            return res.status(404).json({ message: "Candidate not found" });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "user not found" });
        }
        if (user.isVoted) {
            res.status(400).json({ message: "You have already voted" });
        }
        if (user.role == "admin") {
            res.status(403).json({ message: "admin is not allowed" });
        };
        candidate.votes.push({ user: userId });
        candidate.voteCount++;
        await candidate.save();

        // updating the user document 
        user.isVoted = true;
        await user.save();
        res.status(200).json({ message: "voted recorded successfully " })

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Internal sever Error" })
    }
})
// for vote count
router.get("/vote/count", async (req, res) => {
    try {
        const candidate = await Candidate.find().sort({ voteCount: "desc" });
        const voteRecord = candidate.map((data) => {
            return {
                party: data.party,
                count: data.voteCount
            }
        })
        return res.status(200).json(voteRecord);

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "internal sever Error  " });
    }
})

// getting all candidates with only name and party fields 
router.get("/", async (req, res) => {
    try {
        const candidates = await Candidate.find({}, 'name party-_id');
        res.status(200).json(candidates);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Internal Server Error" })
    }
})
module.exports = router;