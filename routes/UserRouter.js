const express = require("express");
const router = express.Router();
const User = require("../db/userModel");

router.get("/", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

router.get("/:userId", async (req, res) => {
  const user = await User.findById(req.params.userId);
  res.json(user);
});

module.exports = router;
