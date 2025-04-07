import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  reason: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Report", reportSchema);