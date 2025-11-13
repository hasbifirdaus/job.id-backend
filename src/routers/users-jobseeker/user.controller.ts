import { Request, Response, RequestHandler } from "express";
import * as userService from "./user.service";

// -------------------- GET PROFILE --------------------
export const getProfile: RequestHandler = async (
  req: any,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const result = await userService.getProfileService(userId);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// -------------------- UPDATE PROFILE --------------------
export const updateProfile: RequestHandler = async (
  req: any,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const result = await userService.updateProfileService(userId, req.body);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// -------------------- UPLOAD PROFILE PHOTO --------------------
export const uploadProfilePhoto: RequestHandler = async (
  req: any,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: "File required" });
      return;
    }

    const result = await userService.uploadProfilePhotoService(
      userId,
      req.file.path,
      req.file.path // karena Cloudinary sudah memberi URL langsung
    );

    res.status(200).json({
      message: "Profile photo updated successfully",
      photo_url: req.file.path, // URL Cloudinary
    });
  } catch (err: any) {
    if (err.message === "Invalid file format") {
      res.status(400).json({ error: "Invalid file format" });
    } else if (err.code === "LIMIT_FILE_SIZE") {
      res.status(400).json({ error: "File too large" });
    } else {
      res.status(400).json({ error: err.message });
    }
  }
};

// -------------------- VERIFY EMAIL --------------------
export const verifyEmail: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { token } = req.params;
    const result = await userService.verifyEmailService(token);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// -------------------- RESEND VERIFICATION --------------------
export const resendVerification: RequestHandler = async (
  req: any,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const email = req.body?.email;
    const result = await userService.resendVerificationService(userId, email);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
