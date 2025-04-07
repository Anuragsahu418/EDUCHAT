import { Router } from "express";
import {
  getUsersForSidebar,
  getMessages,
  sendMessage,
  deleteMessages,
  clearChat,
} from "../controllers/message.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.middleware.js";

const router = Router();

router.use(protectRoute);

router.get("/users", getUsersForSidebar);
router.get("/:id", getMessages);
router.post("/send/:id", upload.single("image"), sendMessage);
router.delete("/", deleteMessages);
router.delete("/clear/:id", clearChat);

export default router;