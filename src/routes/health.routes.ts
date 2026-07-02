import { Router, Request, Response } from "express";

const healthRoutes = Router();

healthRoutes.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

export default healthRoutes;