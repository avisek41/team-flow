import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/user";
import mongoose from "mongoose";

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const users = await User.find();
    return res.status(200).json({
      message: "Users fetched successfully",
      users: users,
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    return res.status(200).json({
      message: "User deleted successfully",
      user: user,
    });
  } catch (error) {
    return next(error);
  }
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        message: "User ID is required",
      });
    }
    if (!req.body) {
      return res.status(400).json({
        message: "User data is required",
      });
    }
    const user = await User.findByIdAndUpdate(id, req.body, { new: true });
    return res.status(200).json({
      message: "User updated successfully",
      user: user,
    });
  } catch (error) {
    return next(error);
  }
};

export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
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

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body as {
      email: string;
      password: string;
    };

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      auth: {
        userId: user._id,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    if(!id){
      return res.status(400).json({
        message: "User ID is required",
      });
    }
    if(!mongoose.Types.ObjectId.isValid(id as string)){
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }
    const user = await User.findById(id);
    if(!user){
      return res.status(400).json({
        message: "User not found",
      });
    }
    return res.status(200).json({
      message: "User fetched successfully",
      user: user,
    });
  } catch (error) {
    return next(error);
  }
};
