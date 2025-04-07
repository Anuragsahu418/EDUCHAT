// frontend/src/pages/CoursePage.jsx
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/useAuthStore";

const CoursePage = () => {
  const { authUser } = useAuthStore();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCourse, setNewCourse] = useState({ name: "", description: "" });

  const isAdmin = authUser?.role === "admin";
  const isTeacher = authUser?.role === "teacher";
  const isStudent = authUser?.role === "student";

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5001/api/courses", { withCredentials: true });
      setCourses(response.data);
    } catch (error) {
      toast.error("Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  };

 const handleAddCourse = async (e) => {
  e.preventDefault();
  try {
    const response = await axios.post(
      "http://localhost:5001/api/courses/create",
      newCourse,
      { withCredentials: true }
    );
    setCourses([...courses, response.data]);
    setNewCourse({ name: "", description: "" });
    setShowAddForm(false);
    toast.success("Course added successfully");
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to add course");
  }
};

  const handleEnroll = async (courseId) => {
    try {
      await axios.post(`http://localhost:5001/api/courses/enroll/${courseId}`, {}, { withCredentials: true });
      toast.success("Enrolled successfully");
      fetchCourses();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to enroll");
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        await axios.delete(`http://localhost:5001/api/courses/${courseId}`, { withCredentials: true });
        setCourses(courses.filter((course) => course._id !== courseId));
        toast.success("Course deleted successfully");
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete course");
      }
    }
  };

  const isEnrolled = (course) => course.students.some((student) => student._id === authUser?._id);

  return (
    <div className="min-h-screen bg-base-100">
      <Navbar />
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Courses</h1>
          {(isAdmin || isTeacher) && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="btn btn-primary"
            >
              {showAddForm ? "Cancel" : "Add Course"}
            </button>
          )}
        </div>

        {showAddForm && (
          <div className="card bg-base-200 p-6 mb-6 shadow-md">
            <h2 className="text-xl font-semibold mb-4">Create New Course</h2>
            <form onSubmit={handleAddCourse} className="space-y-4">
              <input
                type="text"
                value={newCourse.name}
                onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                className="input input-bordered w-full"
                placeholder="Course Name"
                required
              />
              <textarea
                value={newCourse.description}
                onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                className="textarea textarea-bordered w-full"
                placeholder="Course Description"
                rows="3"
                required
              />
              <button type="submit" className="btn btn-success">Create Course</button>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-10">Loading courses...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course._id} className="card bg-base-100 shadow-md">
                <div className="card-body">
                  <h2 className="card-title">{course.name}</h2>
                  <p>{course.description}</p>
                  <p className="text-sm text-base-content/70">
                    Instructor: {course.instructor?.fullName || "Not assigned"}
                  </p>
                  <p className="text-sm text-base-content/70">Students: {course.students.length}</p>
                  <div className="card-actions justify-end mt-4">
                    {isStudent && !isEnrolled(course) && (
                      <button
                        onClick={() => handleEnroll(course._id)}
                        className="btn btn-primary btn-sm"
                      >
                        Enroll
                      </button>
                    )}
                    {isEnrolled(course) && (
                      <span className="badge badge-success">Enrolled</span>
                    )}
                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteCourse(course._id)}
                        className="btn btn-error btn-sm"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {courses.length === 0 && (
              <div className="col-span-full text-center py-10 text-base-content/70">
                No courses available
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursePage;