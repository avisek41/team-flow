import express from "express";
import { deleteUser, getUsers, loginUser, registerUser, updateUser } from "../controllers/userController";
import { validateCreateUser } from "../middlewares/validateCreateUser";

const userRoutes = express.Router();

userRoutes.post("/register", validateCreateUser, registerUser);
userRoutes.get("/get",  getUsers);
userRoutes.delete("/delete/:id", deleteUser);
userRoutes.put("/update/:id", updateUser);
userRoutes.post("/login", loginUser);

export default userRoutes;


