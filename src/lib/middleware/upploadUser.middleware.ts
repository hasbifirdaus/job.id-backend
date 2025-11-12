import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// 🔹 Konfigurasi Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const base = file.originalname
      .split(".")[0]
      .replace(/\s+/g, "_")
      .toLowerCase();

    return {
      folder: "jobapp/profile",
      allowed_formats: ["jpg", "jpeg", "png"],
      public_id: `${base}_${Date.now()}`,
      transformation: [{ width: 500, height: 500, crop: "limit" }],
    };
  },
});

// ✅ ekspor instance dan middleware-nya secara terpisah
export const profileUploader = multer({
  storage: profileStorage,
  limits: { fileSize: 1 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Invalid file format"));
    }
    cb(null, true);
  },
});

export const uploadProfile = profileUploader.single("photo");
