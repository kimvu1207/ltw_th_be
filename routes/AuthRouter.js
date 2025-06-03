const express = require("express");
const router = express.Router();
const User = require("../db/userModel");
const bcrypt = require("bcrypt");

// Middleware kiểm tra trạng thái đăng nhập
const isAuthenticated = (req, res, next) => {
  console.log("Session:", req.session);
  console.log("Cookies:", req.headers.cookie);
  if (!req.session.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};

// API kiểm tra trạng thái đăng nhập
router.get("/user/me", isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ _id: user._id, first_name: user.first_name, login_name: user.login_name });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// API đăng nhập
router.post("/admin/login", async (req, res) => {
  const { login_name, password } = req.body;
  console.log("Login attempt:", { login_name, password });
  if (!login_name || !password) {
    return res.status(400).json({ error: "Missing login_name or password" });
  }
  try {
    const user = await User.findOne({ login_name });
    console.log("User found:", user);
    if (!user) {
      return res.status(400).json({ error: "Invalid login name" });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    console.log("Password match:", passwordMatch);
    if (!passwordMatch) {
      return res.status(400).json({ error: "Invalid password" });
    }
    req.session.userId = user._id;
    console.log("Session set:", req.session);
    res.json({ _id: user._id, first_name: user.first_name, login_name: user.login_name });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// API đăng xuất
router.post("/admin/logout", (req, res) => {
  if (!req.session.userId) {
    return res.status(400).json({ error: "Not logged in" });
  }
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ error: "Logout failed" });
    }
    res.json({ message: "Logged out successfully" });
  });
});

// API đăng ký
router.post("/user", async (req, res) => {
  const { login_name, password, passwordConfirm, first_name, last_name, location, description, occupation } = req.body;
  if (!login_name || !password || !first_name || !last_name) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  if (password !== passwordConfirm) {
    return res.status(400).json({ error: "Passwords do not match" });
  }
  try {
    const existingUser = await User.findOne({ login_name });
    if (existingUser) {
      return res.status(400).json({ error: "Login name already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      login_name,
      password: hashedPassword,
      first_name,
      last_name,
      location,
      description,
      occupation,
    });
    await user.save();
    res.json({ login_name: user.login_name });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

module.exports = { router, isAuthenticated };