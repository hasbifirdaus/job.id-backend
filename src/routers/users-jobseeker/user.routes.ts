import express from "express";
import {
  getProfile,
  updateProfile,
  uploadProfilePhoto,
  verifyEmail,
  resendVerification,
} from "./user.controller";
import { authMiddleware } from "../../lib/middleware/auth.middleware";
import { validate } from "../../lib/middleware/validation.middleware";
import {
  updateProfileValidation,
  verifyEmailParamsValidation,
  resendVerificationValidation,
} from "./user.validation";
import { uploadProfile } from "../../lib/middleware/upploadUser.middleware";

const userRoutes = express.Router();

userRoutes.get("/profile", authMiddleware(), getProfile);

userRoutes.patch(
  "/profile",
  authMiddleware(),
  validate(updateProfileValidation),
  updateProfile
);

userRoutes.patch(
  "/profile/photo",
  authMiddleware(),
  uploadProfile,
  uploadProfilePhoto
);
userRoutes.get(
  "/verify/:token",
  validate(verifyEmailParamsValidation, "params"),
  verifyEmail
);

userRoutes.post(
  "/verify/resend",
  authMiddleware(),
  validate(resendVerificationValidation),
  resendVerification
);

export default userRoutes;
