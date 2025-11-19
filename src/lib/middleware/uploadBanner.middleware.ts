import multer, { FileFilterCallback } from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/claudinary"; // Pastikan path ini benar
import { Request } from "express";

// Hanya izinkan format gambar
const allowedImageFormats = ["image/jpeg", "image/png", "image/webp"];

// Konfigurasi Storage untuk Banner
const bannerStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    // Folder khusus untuk banner job
    folder: "/job-banners",
    resource_type: "image", // Opsi: Ubah ukuran gambar (opsional, disarankan untuk optimasi)
    transformation: [{ width: 1200, crop: "limit" }],
    public_id: (req: Request, file: Express.Multer.File) => {
      const filename = file.originalname.split(".")[0];
      return `${filename}_${Date.now()}`;
    },
  } as any,
});

// Middleware Upload Banner
export const uploadBannerMiddleware = multer({
  storage: bannerStorage,
  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ) => {
    if (!allowedImageFormats.includes(file.mimetype)) {
      return cb(
        new Error(
          "Invalid file format. Only JPG, PNG, or WEBP images are allowed."
        ) as any,
        false
      );
    }
    cb(null, true);
  },
  limits: { fileSize: 2 * 1024 * 1024 }, // Maks 2MB
}).single("file"); // 'file' adalah nama field yang diharapkan dari FormData frontend
