import express from "express";
import { deleteUser, getUserById, getUsers, loginUser, registerUser, updateUser } from "../controllers/userController";
import { validateCreateUser } from "../middlewares/validateCreateUser";
import { authMiddleware } from "../middlewares/authMiddleware";

const userRoutes = express.Router();

userRoutes.post("/register", validateCreateUser, registerUser);
userRoutes.post("/login", loginUser);

userRoutes.use(authMiddleware);

userRoutes.get("/get",  getUsers);
userRoutes.delete("/delete/:id", deleteUser);
userRoutes.put("/update/:id", updateUser);
userRoutes.get("/get-user-by-id/:id", getUserById);

export default userRoutes;


