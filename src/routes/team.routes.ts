import express from "express";
import { addMemberToTeam, createTeam, deleteTeam, getTeams, removeMemberFromTeam, updateTeam } from "../controllers/teamController";
import { authMiddleware } from "../middlewares/authMiddleware";

const teamRoutes = express.Router();

teamRoutes.post("/create-team", authMiddleware, createTeam);
teamRoutes.get("/get-teams", authMiddleware, getTeams);
teamRoutes.delete("/delete-team/:id", authMiddleware, deleteTeam);
teamRoutes.put("/update-team/:id", authMiddleware, updateTeam);

teamRoutes.post("/add-member-to-team/:id", authMiddleware, addMemberToTeam);
teamRoutes.delete("/remove-member-from-team/:id/:memberId", authMiddleware, removeMemberFromTeam);



export default teamRoutes;