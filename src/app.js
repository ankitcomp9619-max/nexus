import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.route.js";
import taskRoutes from "./routes/task.route.js";

const app = express();

// Security headers
app.use(helmet());

// CORS — registered before routes so preflight OPTIONS requests are handled
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Body parsers
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

// Routes
app.use("/api/auth",  authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Hello from NEXUS server!" });
});

export default app;
