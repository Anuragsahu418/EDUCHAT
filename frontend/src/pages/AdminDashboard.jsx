import { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const AdminDashboard = () => {
  const { authUser } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersRes = await axiosInstance.get("/admin/users");
        const reportsRes = await axiosInstance.get("/admin/reports");
        setUsers(usersRes.data);
        setReports(reportsRes.data);
      } catch (error) {
        toast.error("Failed to fetch admin data");
      }
    };
    if (authUser?.role === "admin") fetchData();
  }, [authUser]);

  const handleBanUser = async (userId) => {
    if (window.confirm("Are you sure you want to ban this user?")) {
      try {
        await axiosInstance.post(`/admin/ban/${userId}`);
        toast.success("User banned successfully");
        setUsers(users.map((user) => (user._id === userId ? { ...user, isBanned: true } : user)));
      } catch (error) {
        toast.error("Failed to ban user");
      }
    }
  };

  if (authUser?.role !== "admin") {
    return <div className="text-center p-5">Access denied. Admins only.</div>;
  }

  return (
    <div className="min-h-screen bg-base-100 pt-20 px-4">
      <h1 className="text-3xl font-bold mb-4 text-center">Admin Dashboard</h1>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Users</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {users.map((user) => (
            <div key={user._id} className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <p><strong>Name:</strong> {user.fullName}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Role:</strong> {user.role}</p>
                <p><strong>Status:</strong> {user.isBanned ? "Banned" : "Active"}</p>
                {!user.isBanned && (
                  <button className="btn btn-error btn-sm" onClick={() => handleBanUser(user._id)}>
                    Ban User
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h2 className="text-2xl font-semibold mb-2">Reports</h2>
        {reports.length === 0 ? (
          <p>No reports yet.</p>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report._id} className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <p><strong>Reported By:</strong> {report.reportedBy.fullName}</p>
                  <p><strong>User:</strong> {report.user.fullName}</p>
                  <p><strong>Reason:</strong> {report.reason}</p>
                  <p><strong>Date:</strong> {new Date(report.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;