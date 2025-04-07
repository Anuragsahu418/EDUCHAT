import { Router } from "express";
import { getAllUsers, banUser, getReports } from "../controllers/admin.controller.js";
import { protectRoute, isAdmin } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/users", protectRoute, isAdmin, getAllUsers);
router.post("/ban/:userId", protectRoute, isAdmin, banUser);
router.get("/reports", protectRoute, isAdmin, getReports);

export default router;