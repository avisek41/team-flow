import { NextFunction, Request, Response } from "express";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateCreateUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, email, password } = req.body as {
    name?: unknown;
    email?: unknown;
    password?: unknown;
  };

  if (typeof name !== "string" || name.trim().length < 2) {
    return res.status(400).json({
      message: "Invalid name. Name must be at least 2 characters.",
    });
  }

  if (typeof email !== "string" || !emailRegex.test(email.trim())) {
    return res.status(400).json({
      message: "Invalid email format.",
    });
  }

  if (typeof password !== "string" || password.trim().length < 6) {
    return res.status(400).json({
      message: "Invalid password. Password must be at least 6 characters.",
    });
  }

  req.body.name = name.trim();
  req.body.email = email.trim().toLowerCase();
  req.body.password = password.trim();

  next();
};
