import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  text: { type: String },
  image: { type: String },
  createdAt: { type: Date, default: Date.now },
  deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  status: { type: String, enum: ["sent", "delivered", "read"], default: "sent" }, // Added
});

export default mongoose.model("Message", messageSchema);