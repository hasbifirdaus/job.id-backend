import { Router } from "express";
import { authMiddleware } from "../../../lib/middleware/auth.middleware";
import { validate } from "../../../lib/middleware/validation.middleware";
import {
  updatePersonalSchema,
  updateEmailSchema,
  updateJobSeekerDetailSchema,
} from "./profile.validation";
import * as profileController from "./profile.controller";
import { upload } from "../../../lib/middleware/multerConfig";
import { catchAsync } from "../../../lib/middleware/catchAsync";

const profileRoutes = Router();

// Endpoint 1: GET Profile Detail (Untuk Admin/User)
profileRoutes.get(
  "/",
  authMiddleware(), // Auth wajib
  catchAsync(profileController.getProfileDetails)
);

// Endpoint 2: Update Data Personal (Nama, Password)
profileRoutes.put(
  "/personal",
  authMiddleware(),
  validate(updatePersonalSchema),
  catchAsync(profileController.updatePersonal)
);

// Endpoint 3: Update Foto Profil
profileRoutes.put(
  "/photo",
  authMiddleware(),
  upload.single("profile_image"),
  catchAsync(profileController.updateProfilePhoto)
);

// Endpoint 4: Request Update Email (Membutuhkan verifikasi ulang)
profileRoutes.put(
  "/email",
  authMiddleware(),
  validate(updateEmailSchema),
  catchAsync(profileController.requestUpdateEmail)
);

// Endpoint 5: Resend Email Verification (Jika belum terverifikasi)
profileRoutes.post(
  "/resend-verification",
  authMiddleware(),
  catchAsync(profileController.resendEmailVerification)
);

// Endpoint 6: Update Detail Khusus Job Seeker (Hanya untuk JOB_SEEKER)
profileRoutes.put(
  "/jobseeker-details",
  authMiddleware(["JOB_SEEKER"]),
  validate(updateJobSeekerDetailSchema),
  catchAsync(profileController.updateJobSeekerDetails)
);

export default profileRoutes;
