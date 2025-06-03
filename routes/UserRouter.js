const express = require("express");
const router = express.Router();
const User = require("../db/userModel");
const { isAuthenticated } = require("./AuthRouter");

router.get("/", isAuthenticated, async (req, res) => {
  try {
    const users = await User.find();
    console.log("Fetched users:", users); // Debug
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:userId", isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;