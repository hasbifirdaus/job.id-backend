import multer, { FileFilterCallback } from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/claudinary";
import { Request } from "express";

const allowedFormats = ["application/pdf"];

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "job-app/cv",
    resource_type: "auto",
    format: async (req: Request, file: Express.Multer.File) => "pdf",
    public_id: (req: Request, file: Express.Multer.File) => {
      const filename = file.originalname.split(".")[0];
      return `${filename}_${Date.now()}`;
    },
  } as any,
});

export const upload = multer({
  storage,
  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ) => {
    if (!allowedFormats.includes(file.mimetype)) {
      return cb(new Error("Invalid file format. Only PDF allowed."));
    }
    cb(null, true);
  },
  limits: { fileSize: 2 * 1024 * 1024 }, //max2mb
});
