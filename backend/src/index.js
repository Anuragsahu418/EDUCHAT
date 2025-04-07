import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/message.route.js";
import messageRoutes from "./routes/message.route.js";
import announcementRoutes from "./routes/announcement.routes.js";
import courseRoutes from "./routes/course.route.js";
import adminRoutes from "./routes/admin.route.js";
import http from "http";
import { initializeSocket } from "./lib/socket.js";
import cookieParser from "cookie-parser";
import { connectDB } from "./lib/db.js"; // Import connectDB

dotenv.config();

const app = express();
const server = http.createServer(app);

initializeSocket(server);

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/admin", adminRoutes);

// Connect to MongoDB using connectDB
connectDB();

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});