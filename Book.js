import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title:       { type: String, required: true },
  author:      { type: String, required: true },
  totalPages:  { type: Number, required: true },
  currentPage: { type: Number, default: 0 },
  rating:      { type: Number, default: 0 },          // ← NEW
  status:      { type: String, default: "reading",    // ← NEW
                 enum: ["reading", "completed", "wishlist"] },
}, { timestamps: true });

export default mongoose.model("Book", bookSchema);