import User from "../models/user.model.js";
import Report from "../models/report.model.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
};

export const banUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isBanned = true;
    await user.save();

    res.json({ message: "User banned successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error banning user", error: error.message });
  }
};

export const getReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("reportedBy", "fullName")
      .populate("user", "fullName");
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reports", error: error.message });
  }
};