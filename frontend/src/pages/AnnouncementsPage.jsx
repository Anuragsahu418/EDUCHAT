// frontend/src/pages/AnnouncementsPage.jsx
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import AnnouncementInput from "../components/AnnouncementInput";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/useAuthStore";
import { Trash2 } from "lucide-react";

const AnnouncementsPage = () => {
  const { authUser } = useAuthStore();
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get("http://localhost:5001/api/announcements", { withCredentials: true });
      setAnnouncements(response.data);
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.error("Failed to fetch announcements");
    }
  };

  const handleSendAnnouncement = async (formData) => {
    try {
      const response = await axios.post("http://localhost:5001/api/announcements/create", formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      setAnnouncements([response.data, ...announcements]);
      toast.success("Announcement posted successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to post announcement");
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      try {
        await axios.delete(`http://localhost:5001/api/announcements/${id}`, { withCredentials: true });
        setAnnouncements(announcements.filter((a) => a._id !== id));
        toast.success("Announcement deleted successfully");
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete announcement");
      }
    }
  };

  const canPost = authUser?.role === "teacher" || authUser?.role === "admin";

  return (
    <div className="min-h-screen bg-base-100">
      <Navbar />
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Announcements</h1>
        {canPost && <AnnouncementInput onSend={handleSendAnnouncement} />}
        <div className="space-y-4 mt-6">
          {announcements.map((announcement) => (
            <div key={announcement._id} className="card bg-base-200 shadow-md p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">{announcement.senderId.fullName}</p>
                  <p className="text-sm text-base-content/70">
                    {new Date(announcement.createdAt).toLocaleString()}
                  </p>
                </div>
                {(authUser?.role === "admin" || announcement.senderId._id === authUser?._id) && (
                  <button
                    onClick={() => handleDeleteAnnouncement(announcement._id)}
                    className="btn btn-error btn-sm"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <p className="mt-2">{announcement.text}</p>
              {announcement.files?.length > 0 && (
                <div className="mt-2 space-y-2">
                  {announcement.files.map((file, index) => (
                    <a key={index} href={file} target="_blank" rel="noopener noreferrer" className="link link-primary">
                      File {index + 1}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementsPage;