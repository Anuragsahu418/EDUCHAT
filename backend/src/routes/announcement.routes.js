import { Router } from "express";
import { createAnnouncement, getAnnouncements, editAnnouncement, deleteAnnouncement } from "../controllers/announcement.controller.js";
import { protectRoute, isTeacherOrAdmin } from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.middleware.js";

const router = Router();

router.post("/create", protectRoute, isTeacherOrAdmin, upload.array("files", 5), createAnnouncement);
router.get("/", protectRoute, getAnnouncements);
router.put("/:id", protectRoute, isTeacherOrAdmin, editAnnouncement);
router.delete("/:id", protectRoute, isTeacherOrAdmin, deleteAnnouncement);

export default router;