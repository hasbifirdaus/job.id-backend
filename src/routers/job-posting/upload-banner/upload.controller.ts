import { Request, Response } from "express";

// Perluasan interface Request untuk menyertakan properti file dari Multer
interface MulterRequest extends Request {
  file?: Express.Multer.File & { path: string }; // path adalah URL Cloudinary
}

export const UploadController = {
  /**
   * @route POST /upload/image
   * Menangani upload gambar ke Cloudinary dan mengembalikan URL.
   */
  async uploadSingleImage(req: MulterRequest, res: Response): Promise<void> {
    try {
      const file = req.file;

      if (!file || !file.path) {
        // CloudinaryStorage gagal atau file tidak ada
        // Multer error (seperti batasan ukuran/format) biasanya ditangani otomatis oleh middleware
        res.status(400).json({
          message: "No file uploaded or upload failed (check file size/type).",
        });
        return;
      }

      // req.file.path berisi URL yang dikembalikan oleh multer-storage-cloudinary
      const imageUrl = file.path;

      res.json({
        message: "Image uploaded successfully",
        url: imageUrl, // URL Cloudinary yang akan dikirim kembali ke frontend
      });
    } catch (err: any) {
      console.error("Upload Error:", err);
      // Penanganan Error jika terjadi masalah di luar Multer
      res
        .status(500)
        .json({ message: err.message || "Failed to upload image." });
    }
  },
};
