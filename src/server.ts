import dotenv from "dotenv";
import express from "express";
import { connectDB } from "./config/db";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";
import { requestLogger } from "./middlewares/requestLogger";
import healthRoutes from "./routes/health.routes";
import taskRoutes from "./routes/task.routes";
import teamRoutes from "./routes/team.routes";
import userRoutes from "./routes/userRoutes";
dotenv.config();



const app = express();
const PORT = process.env.PORT || 3000;

app.use("/api/v1/tasks", taskRoutes);
app.use(express.json());
app.use(requestLogger);

    
app.use("/api/v1/users", userRoutes);     // login/register
app.use("/api/v1/teams", teamRoutes);
app.use("/health", healthRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

connectDB();

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
