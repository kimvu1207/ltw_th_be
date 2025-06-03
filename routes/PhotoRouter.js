// backend/routes/PhotoRouter.js
const express = require("express");
const router = express.Router();
const Photo = require("../db/photoModel");
const { isAuthenticated } = require("./AuthRouter");
const multer = require("multer");
const path = require("path");
const mongoose = require("mongoose");
const fs = require("fs");
const sanitize = require("sanitize-filename"); // Thêm gói này

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./images/";
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const sanitizedName = sanitize(file.originalname); // Chuẩn hóa tên file
    cb(null, `${Date.now()}-${sanitizedName}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed"), false);
    }
  },
});

router.get("/photosOfUser/:userId", isAuthenticated, async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("Fetching photos for userId:", userId);
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    const photos = await Photo.find({ user_id: userId }).populate(
      "comments.user_id",
      "first_name last_name"
    );
    console.log("Photos with populated comments:", JSON.stringify(photos, null, 2));
    res.json(photos);
  } catch (error) {
    console.error("Error fetching photos:", error.stack);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/commentsOfPhoto/:photoId", isAuthenticated, async (req, res) => {
  const { comment } = req.body;
  if (!comment || comment.trim() === "") {
    return res.status(400).json({ error: "Comment cannot be empty" });
  }
  try {
    const photoId = req.params.photoId;
    if (!mongoose.Types.ObjectId.isValid(photoId)) {
      return res.status(400).json({ error: "Invalid photo ID" });
    }
    const photo = await Photo.findById(photoId);
    if (!photo) {
      return res.status(404).json({ error: "Photo not found" });
    }
    photo.comments.push({
      comment,
      user_id: req.session.userId,
      date_time: new Date(),
    });
    await photo.save();
    res.json({ message: "Comment added", photo });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ error: "Failed to add comment" });
  }
});

router.post("/photos/new", isAuthenticated, upload.single("photo"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  try {
    const userId = req.session.userId;
    console.log("Uploading photo for userId:", userId, "File:", req.file.filename); // Log tên file
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    const photo = new Photo({
      file_name: req.file.filename,
      user_id: userId,
      date_time: new Date(),
      comments: [],
    });
    await photo.save();
    console.log("Photo saved to DB:", photo); // Log bản ghi
    res.json({
      _id: photo._id,
      file_name: photo.file_name,
      user_id: photo.user_id,
      date_time: photo.date_time,
      comments: photo.comments,
    });
  } catch (error) {
    console.error("Error uploading photo:", error);
    res.status(500).json({ error: "Failed to upload photo" });
  }
});

module.exports = router;