import express, {
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
} from "express";
import { UploadController } from "./upload.controller";
import { uploadBannerMiddleware } from "../../../lib/middleware/uploadBanner.middleware";
import { authMiddleware } from "../../../lib/middleware/auth.middleware";
import multer from "multer";

const uploadRoutes = express.Router();

/**
 * Custom error handler khusus Multer
 */
const uploadErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    res.status(400).json({
      message: `Upload failed: ${err.code}. Check file size (max 2MB) or field name ('file').`,
    });
    return; // penting!! → ini membuat return type = void
  }

  if (err) {
    res.status(400).json({
      message: err.message || "Failed to process file upload.",
    });
    return; // penting!!
  }

  next();
};

/**
 * POST /upload/image
 */
uploadRoutes.post(
  "/image",
  authMiddleware(["COMPANY_ADMIN"]),
  uploadBannerMiddleware,
  UploadController.uploadSingleImage
);

/**
 * REGISTER ERROR HANDLER
 */
uploadRoutes.use(uploadErrorHandler);

export default uploadRoutes;
