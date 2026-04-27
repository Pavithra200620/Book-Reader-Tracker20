import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Book from "../models/Book.js";
import auth from "../middleware/authMiddleware.js"; // ← இது இல்லாம போச்சு!

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: "Email already registered" });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: "Invalid credentials" });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Profile update
router.patch("/profile", auth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.userId,
      { name: req.body.name, email: req.body.email },
      { new: true }
    );
    res.json({ user: { id: user._id, name: user.name, email: user.email } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Password change
router.patch("/password", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const match = await bcrypt.compare(req.body.oldPassword, user.password);
    if (!match) return res.status(400).json({ error: "Wrong current password" });
    user.password = await bcrypt.hash(req.body.newPassword, 10);
    await user.save();
    res.json({ message: "Password updated" });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Delete account
router.delete("/account", auth, async (req, res) => {
  await User.findByIdAndDelete(req.userId);
  await Book.deleteMany({ userId: req.userId });
  res.json({ message: "Account deleted" });
});

export default router;