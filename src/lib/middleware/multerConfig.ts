// src/lib/middleware/multerConfig.ts
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary"; // Perlu diinstall
import cloudinary from "../config/claudinary";
import { Request } from "express";

// Batasan file
const MAX_FILE_SIZE = 1024 * 1024; // 1MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png"];

// Konfigurasi Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "nama_aplikasi/profile_images", // Ganti dengan nama folder di Cloudinary Anda
    resource_type: "image",
    public_id: (req: Request, file: Express.Multer.File) => {
      // Gunakan ID User sebagai bagian dari public_id agar mudah diakses
      const userId = (req as any).user.id; // Asumsi userId ada di req.user
      return `profile_${userId}_${Date.now()}`;
    },
  } as any,
});

// Inisialisasi Multer untuk Cloudinary
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
  ) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      // Lebih baik menggunakan Error agar tertangkap oleh CatchAsync atau Error Handler
      return cb(
        new Error(
          "Ekstensi file tidak valid. Hanya .jpg, .jpeg, .png yang diperbolehkan."
        ) as any,
        false
      );
    }
    cb(null, true);
  },
});
