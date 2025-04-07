import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    files: [{ type: String }],
  },
  { timestamps: true }
);

export const Announcement = mongoose.model("Announcement", announcementSchema);