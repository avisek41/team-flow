import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

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
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Unauthorized. Missing or invalid Authorization header.",
      });
    }

    const token = authHeader.split(" ")[1];
    const jwtAccessSecret = process.env.JWT_ACCESS_SECRET;
    if (!jwtAccessSecret) {
      return res.status(500).json({
        message: "JWT access secret is not configured.",
      });
    }

    const payload = jwt.verify(token, jwtAccessSecret) as Partial<AuthUser>;
    if (!payload.userId || !payload.email) {
      return res.status(401).json({
        message: "Unauthorized. Invalid token payload.",
      });
    }

    (req as Request & { user?: AuthUser }).user = {
      userId: payload.userId,
      email: payload.email,
    };

    return next();
  } catch {
    return res.status(401).json({
      message: "Authentication failed.",
    });
  }
};
