import { Router } from "express";
import { getCourses, createCourse, enrollInCourse, deleteCourse } from "../controllers/course.controller.js";
import { protectRoute, isTeacherOrAdmin } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", protectRoute, getCourses);
router.post("/create", protectRoute, isTeacherOrAdmin, createCourse); // Added create route
router.post("/enroll/:courseId", protectRoute, enrollInCourse);
router.delete("/:courseId", protectRoute, isTeacherOrAdmin, deleteCourse);

export default router;