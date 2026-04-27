import express from "express";
import Book from "../models/Book.js";
import auth from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all books for user
router.get("/", auth, async (req, res) => {
  const books = await Book.find({ userId: req.userId }).sort({ createdAt: -1 });
  res.json(books);
});

// Add book
router.post("/", auth, async (req, res) => {
  try {
    const { title, author, totalPages } = req.body;
    const book = await Book.create({ userId: req.userId, title, author, totalPages });
    res.status(201).json(book);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update progress
router.patch("/:id/progress", auth, async (req, res) => {
  try {
    const { currentPage } = req.body;
    const book = await Book.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { currentPage },
      { new: true }
    );
    if (!book) return res.status(404).json({ error: "Book not found" });
    res.json(book);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete book
router.delete("/:id", auth, async (req, res) => {
  try {
    await Book.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ message: "Deleted" });
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