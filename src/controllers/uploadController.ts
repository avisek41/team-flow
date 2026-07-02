import { NextFunction, Request, Response } from "express";

export const uploadFileToCloudinary = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const file = req.file as Express.Multer.File & {
      path?: string; // Cloudinary URL
    };

    if (!file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    return res.status(200).json({
      message: "File uploaded successfully",
      file: {
        url: file.path,        // 🔥 Cloudinary URL
        filename: file.filename,
      },
    });
  } catch (error) {
    next(error);
  }
};