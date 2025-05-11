const express = require("express");
const router = express.Router();
const Photo = require("../db/photoModel");

router.get("/photosOfUser/:userId", async (req, res) => {
  const photos = await Photo.find({ user_id: req.params.userId });
  res.json(photos);
});

module.exports = router;

