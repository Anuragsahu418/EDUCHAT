import Course from "../models/course.model.js";
import User from "../models/user.model.js";

export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate("instructor", "fullName")
      .populate("students", "fullName")
      .sort({ createdAt: -1 });
      
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: "Error fetching courses", error: error.message });
  }
};

export const createCourse = async (req, res) => {
  try {
    const { name, description } = req.body;
    const user = req.user;

    // Only teachers and admin can create courses
    if (!["teacher", "admin"].includes(user.role)) {
      return res.status(403).json({ message: "Only teachers and admin can create courses" });
    }

    const course = new Course({
      name,
      description,
      instructor: user._id
    });

    await course.save();
    
    const populatedCourse = await Course.findById(course._id)
      .populate("instructor", "fullName");
      
    res.status(201).json(populatedCourse);
  } catch (error) {
    res.status(500).json({ message: "Failed to create course", error: error.message });
  }
};

export const enrollInCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (course.students.includes(req.user._id)) {
      return res.status(400).json({ message: "Already enrolled" });
    }

    course.students.push(req.user._id);
    await course.save();

    res.json({ message: "Enrolled successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error enrolling in course", error: error.message });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const user = req.user;

    // Only admin can delete courses
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Only admin can delete courses" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    await Course.findByIdAndDelete(courseId);
    res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete course", error: error.message });
  }
};