import multer, { FileFilterCallback } from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/claudinary";
import { Request } from "express";

const allowed = ["application/pdf"];

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req: Request, file: Express.Multer.File) => ({
    folder: "job-app/cv",
    resource_type: "raw",
    format: "pdf",
    public_id:
      file.originalname.split(".")[0].replace(/\s/g, "_") + "_" + Date.now(),
    access_mode: "public",
  }),
});

export const upload = multer({
  storage,
  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ) => {
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only PDF allowed"));
    }
    cb(null, true);
  },
  limits: { fileSize: 2 * 1024 * 1024 },
});
