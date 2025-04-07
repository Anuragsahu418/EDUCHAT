import { Link, useNavigate } from "react-router-dom"; // Add useNavigate
import { useAuthStore } from "../store/useAuthStore";
import { LogOut, GraduationCap, User, Palette, Bell } from "lucide-react";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const navigate = useNavigate(); // Add navigate hook

  const handleLogout = () => {
    logout(navigate); // Pass navigate to logout
  };

  return (
    <header className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 backdrop-blur-lg bg-base-100/80">
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-all">
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-lg font-bold">Educhat</h1>
            </Link>
          </div>
          {authUser && (
            <div className="flex items-center gap-2">
              <Link to="/settings" className="btn btn-sm gap-2 transition-colors">
                <Palette size={18} />
                <span className="hidden sm:inline">Themes</span>
              </Link>
              <Link to="/announcements" className="btn btn-sm gap-2 transition-colors">
                <Bell size={18} />
                <span className="hidden sm:inline">Announcements</span>
              </Link>
              {authUser.role === "admin" && (
                <Link to="/admin" className="btn btn-sm gap-2 transition-colors">
                  <User size={18} />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              )}
              <Link to="/profile" className="btn btn-sm gap-2 transition-colors">
                <User size={18} />
                <span className="hidden sm:inline">Profile</span>
              </Link>
              <button onClick={handleLogout} className="btn btn-sm gap-2 transition-colors">
                <LogOut size={18} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;