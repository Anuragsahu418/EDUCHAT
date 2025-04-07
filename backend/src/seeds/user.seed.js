import { config } from "dotenv";
import { connectDB } from "../lib/db.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

config();

const seedUsers = [
  {
    email: "admin@gmail.com",
    fullName: "ADMIN",
    password: "Admin@12345",
    role: "admin",
  },
  {
    email: "teacher@example.com",
    fullName: "Teacher User",
    password: "Teacher123!",
    role: "teacher",
  },
  {
    email: "student@example.com",
    fullName: "Student User",
    password: "Student123!",
    role: "student",
  },
];

const seedDatabase = async () => {
  try {
    await connectDB();
    await User.deleteMany({});

    const hashedUsers = await Promise.all(
      seedUsers.map(async (user) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        return { ...user, password: hashedPassword };
      })
    );

    await User.insertMany(hashedUsers);
    console.log("Database seeded successfully with default admin");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();