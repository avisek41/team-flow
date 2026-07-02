import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary";

// 📁 Cloudinary storage config
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
  

    try {
        return {
          folder: "tasks", // folder in cloudinary
          format: file.mimetype?.split("/")[1], // jpg/png
          public_id: `${Date.now()}-${file.originalname}`,
           resource_type: "auto", // 🔥 REQUIRED FOR PDF
        };
        
    } catch (error) {
        console.error("Error configuring Cloudinary storage:", error);
    }   
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});