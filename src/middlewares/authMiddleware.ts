import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import User from "../models/user";

type AuthUser = {
  userId: string;
  email: string;
};

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userIdHeader = req.headers["user-id"];
    const userId = Array.isArray(userIdHeader) ? userIdHeader[0] : userIdHeader;

    if (!userId || typeof userId !== "string") {
      return res.status(401).json({
        message: "Unauthorized. Missing x-user-id header.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({
        message: "Unauthorized. Invalid user id format.",
      });
    }

    const user = await User.findById(userId).select("_id email");
    if (!user) {
      return res.status(401).json({
        message: "Unauthorized. User not found.",
      });
    }

    (req as Request & { user?: AuthUser }).user = {
      userId: user._id.toString(),
      email: user.email,
    };

    return next();
  } catch {
    return res.status(500).json({
      message: "Authentication check failed.",
    });
  }
};
