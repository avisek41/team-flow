import express from "express";
import { addMemberToTeam, createTeam, deleteTeam, getTeams, removeMemberFromTeam, updateTeam } from "../controllers/teamController";
import { authMiddleware } from "../middlewares/authMiddleware";

const teamRoutes = express.Router();


teamRoutes.use(authMiddleware);


teamRoutes.post("/create-team",  createTeam);
teamRoutes.get("/get-teams",  getTeams);
teamRoutes.delete("/delete-team/:id",  deleteTeam);
teamRoutes.put("/update-team/:id",  updateTeam);

teamRoutes.post("/add-member-to-team/:id",  addMemberToTeam);
teamRoutes.delete("/remove-member-from-team/:id/:memberId",  removeMemberFromTeam);



export default teamRoutes;



