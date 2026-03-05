import { Router, Request, Response } from "express";

const authRoutes = Router();

authRoutes.post("/register", (_req: Request, res: Response) => {
  res.status(201).json({
    message: "Register route ready",
  });
});
authRoutes.post("/login",(_req:Request,res:Response)=>{
  res.status(200).json({
    message:'Login route ready'
  })
})

export default authRoutes;
