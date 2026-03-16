import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { createTask, deleteTask, getAllTasksForATeam, getTaskByid } from "../controllers/taskController";

const taskRoutes = express.Router();



taskRoutes.use(authMiddleware);


taskRoutes.post("/create-task",  createTask);
taskRoutes.get("/get-tasks/:teamId",  getAllTasksForATeam);
taskRoutes.get("/get-task-by-id/:taskId", getTaskByid);
taskRoutes.delete("/delete-task/:taskId", deleteTask);






export default taskRoutes;