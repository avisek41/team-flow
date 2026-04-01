import express from "express";
import { assignTask, completeTask, createTask, deleteTask, getAllTasksForATeam, getTaskByid, searchTasksGlobal, updateTask } from "../controllers/taskController";
import { authMiddleware } from "../middlewares/authMiddleware";

const taskRoutes = express.Router();



taskRoutes.use(authMiddleware);


taskRoutes.post("/create-task",  createTask);
taskRoutes.get("/get-tasks/:teamId",  getAllTasksForATeam);
taskRoutes.get("/get-task-by-id/:taskId", getTaskByid);
taskRoutes.delete("/delete-task/:taskId", deleteTask);
// Assign task (Owner only)
taskRoutes.put("/assign/:taskId", assignTask);
// Complete task (Owner / Assigned user)
taskRoutes.put("/complete/:taskId", completeTask);
taskRoutes.put("/update-task/:taskId", updateTask);
// 🔍 Search (GLOBAL - text based)
taskRoutes.get("/search", searchTasksGlobal);






export default taskRoutes;