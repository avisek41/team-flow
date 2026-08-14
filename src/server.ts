import dotenv from "dotenv";
import path from "path";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";
import { requestLogger } from "./middlewares/requestLogger";
import healthRoutes from "./routes/health.routes";
import taskRoutes from "./routes/task.routes";
import teamRoutes from "./routes/team.routes";
import userRoutes from "./routes/userRoutes";
import uiConfigRoutes from "./routes/uiConfigRoutes";
import publicRoutes from "./routes/publicRoutes";
import adminRoutes from "./routes/adminRoutes";

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, "../dynamic-ui-backend.env") });

const app = express();
const PORT = process.env.PORT || 5000;

// Must run before auth so browser preflight (OPTIONS) succeeds cross-origin
app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use("/api/v1/tasks", taskRoutes);
app.use(express.json());
app.use(requestLogger);

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/teams", teamRoutes);
app.use("/api/v1/ui-config", uiConfigRoutes);
app.use("/api/v1/public", publicRoutes);
app.use("/admin/v1", adminRoutes);
app.use("/health", healthRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

connectDB();

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
