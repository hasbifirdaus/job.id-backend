import { Response, NextFunction, Request } from "express";
import { AuthenticatedRequest } from "../../../lib/middleware/auth.middleware"; // Import interface dari auth.middleware
import * as profileService from "./profile.service";
import { validateProfileImage } from "./profile.validation";
// ----------------------------------------------------
// GET PROFILE DETAIL
// ----------------------------------------------------
export const getProfileDetails = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const user = await profileService.getProfile(userId);
    res.status(200).json({
      success: true,
      message: "Detail profil berhasil diambil.",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// ----------------------------------------------------
// UPDATE DATA PERSONAL (Nama & Password)
// ----------------------------------------------------
export const updatePersonal = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { name, oldPassword, newPassword } = req.body;

    const updatedUser = await profileService.updatePersonalData(userId, {
      name,
      oldPassword,
      newPassword,
    });

    res.status(200).json({
      success: true,
      message: "Data personal berhasil diperbarui.",
      data: { name: updatedUser.name },
    });
  } catch (error) {
    next(error);
  }
};

// ----------------------------------------------------
// UPDATE PROFILE IMAGE
// ----------------------------------------------------
export const updateProfilePhoto = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const uploadedFile = req.file as Express.Multer.File;

    if (!uploadedFile) {
      if ((req as any).fileValidationError) {
        return res
          .status(400)
          .json({ success: false, message: (req as any).fileValidationError });
      }
      return res
        .status(400)
        .json({ success: false, message: "Foto profil wajib diupload." });
    }
    const newImageUrl = (uploadedFile as any).secure_url || uploadedFile.path;

    if (!newImageUrl) {
      throw new Error(
        "Gagal mendapatkan URL gambar dari layanan upload (Cloudinary)."
      );
    }

    await profileService.updateProfileImage(userId, newImageUrl);

    res.status(200).json({
      success: true,
      message: "Foto profil berhasil diperbarui.",
      data: { profile_image_url: newImageUrl },
    });
  } catch (error) {
    next(error);
  }
};

// ----------------------------------------------------
// REQUEST UPDATE EMAIL
// ----------------------------------------------------
export const requestUpdateEmail = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { email } = req.body;

    await profileService.requestEmailUpdate(userId, email);

    res.status(200).json({
      success: true,
      message:
        "Email berhasil diperbarui dan email verifikasi telah dikirim ke alamat baru Anda.",
    });
  } catch (error) {
    next(error);
  }
};

// ----------------------------------------------------
// RESEND VERIFICATION EMAIL
// ----------------------------------------------------
export const resendEmailVerification = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;

    await profileService.resendVerification(userId);

    res.status(200).json({
      success: true,
      message:
        "Email verifikasi telah dikirim ulang. Silakan cek kotak masuk Anda.",
    });
  } catch (error) {
    next(error);
  }
};

// ----------------------------------------------------
// UPDATE DETAIL KHUSUS JOB SEEKER (USER ROLE)
// ----------------------------------------------------
export const updateJobSeekerDetails = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { dob, gender, education, address } = req.body;

    // Convert string date (YYYY-MM-DD) to Date object
    const dobDate = new Date(dob);

    await profileService.updateJobSeekerDetails(userId, {
      dob: dobDate,
      gender,
      education,
      address,
    });

    res.status(200).json({
      success: true,
      message: "Detail job seeker berhasil diperbarui.",
    });
  } catch (error) {
    next(error);
  }
};
