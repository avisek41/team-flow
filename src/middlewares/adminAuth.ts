import { Request, Response, NextFunction } from "express";

export const adminAuth = (req: Request, res: Response, next: NextFunction) => {
  // Browser CORS preflight has no Authorization header — never block OPTIONS
  if (req.method === "OPTIONS") {
    return next();
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Missing or invalid Authorization header.",
      });
    }

    const token = authHeader.split(" ")[1];
    if (token !== process.env.ADMIN_SECRET_TOKEN) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Invalid admin token.",
      });
    }

    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Unauthorized.",
    });
  }
};
