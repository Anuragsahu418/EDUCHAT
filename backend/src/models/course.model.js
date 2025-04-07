import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

export default mongoose.model("Course", courseSchema);