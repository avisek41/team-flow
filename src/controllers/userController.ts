import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/user";

export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password } = req.body as {
      name: string;
      email: string;
      password: string;
    };

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: "User with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return next(error);
  }
};


export const getUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const users = await User.find();
        return res.status(200).json({
            message: "Users fetched successfully",
            users: users
        });
    } catch (error) {
        return next(error);
    }
}


export const deleteUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndDelete(id);
        return res.status(200).json({
            message: "User deleted successfully",
            user: user
        }); 
    } catch (error) {
        return next(error);
    }
}


export const updateUser = async (
    req:Request,
    res: Response,
    next: NextFunction
) =>  {

    try {
        const {id} = req.params
        if(!id){
            return res.status(400).json({
                message: "User ID is required"
            });
        }
        if(!req.body){
            return res.status(400).json({
                message: "User data is required"
            });
        }
       const user = await User.findByIdAndUpdate(id,req.body, {new: true})
        return res.status(200).json({
            message: "User updated successfully",
            user: user
        });
        
    } catch (error) {
        return next(error);
    }
}