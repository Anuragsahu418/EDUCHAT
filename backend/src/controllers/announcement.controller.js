import { Announcement } from "../models/announcement.model.js";
import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";

export const createAnnouncement = async (req, res) => {
  try {
    const { text } = req.body;
    const files = req.files?.files;
    const senderId = req.user._id;

    const user = await User.findById(senderId);
    if (!["teacher", "admin"].includes(user.role)) {
      return res.status(403).json({ message: "Only teachers and admins can create announcements" });
    }

    let fileUrls = [];
    if (files && files.length > 0) {
      const uploadPromises = Array.isArray(files) ? files : [files];
      fileUrls = await Promise.all(
        uploadPromises.map(async (file) => {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "educhat/announcements",
            allowed_formats: ["jpg", "png", "pdf", "docx"],
          });
          return result.secure_url;
        })
      );
    }

    const announcement = await Announcement.create({
      senderId,
      text,
      files: fileUrls,
    });

    const populatedAnnouncement = await Announcement.findById(announcement._id).populate(
      "senderId",
      "fullName profilePic"
    );

    res.status(201).json(populatedAnnouncement);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate("senderId", "fullName profilePic")
      .sort({ createdAt: -1 });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: "Error fetching announcements", error: error.message });
  }
};

export const editAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const user = req.user;

    const announcement = await Announcement.findById(id);
    if (!announcement) return res.status(404).json({ message: "Announcement not found" });

    // Admins can edit any announcement, otherwise only the sender
    if (user.role !== "admin" && announcement.senderId.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized to edit this announcement" });
    }

    announcement.text = text;
    await announcement.save();

    res.json(announcement);
  } catch (error) {
    res.status(500).json({ message: "Error editing announcement", error: error.message });
  }
};

export const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const announcement = await Announcement.findById(id);
    if (!announcement) return res.status(404).json({ message: "Announcement not found" });

    // Admins can delete any announcement, otherwise only the sender
    if (user.role !== "admin" && announcement.senderId.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized to delete this announcement" });
    }

    await announcement.deleteOne();
    res.json({ message: "Announcement deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting announcement", error: error.message });
  }
};