import bcrypt from "bcryptjs";
import { generateVerifyToken } from "../../../lib/helpers/user-profile/auth.helper";
import { sendVerificationEmail } from "../../../lib/helpers/user-profile/email.helper";
import prisma from "../../../lib/config/prisma";
import { Users } from "../../../generated/prisma";

const saltRounds = 10;

// Asumsi struktur data untuk update
interface UpdatePersonalData {
  name?: string;
  oldPassword?: string;
  newPassword?: string;
}

interface UpdateJobSeekerDetail {
  dob: Date;
  gender: "MALE" | "FEMALE" | "OTHER";
  education: string;
  address: string;
}

// ----------------------------------------------------
// GET PROFILE
// ----------------------------------------------------
export async function getProfile(userId: string): Promise<Users> {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
      name: true,
      email: true,
      dob: true,
      gender: true,
      education: true,
      address: true,
      profile_image_url: true,
      verified: true,
      created_at: true,
    },
  });

  if (!user) {
    throw new Error("Pengguna tidak ditemukan");
  }
  return user as Users;
}

// ----------------------------------------------------
// UPDATE DATA PERSONAL (Nama & Password)
// ----------------------------------------------------
export async function updatePersonalData(
  userId: string,
  data: UpdatePersonalData
): Promise<Users> {
  let updateData: { name?: string; password?: string } = {};

  if (data.name) {
    updateData.name = data.name;
  }

  if (data.oldPassword && data.newPassword) {
    const user = await prisma.users.findUnique({ where: { id: userId } });
    if (!user) throw new Error("Pengguna tidak ditemukan");

    const isPasswordValid = await bcrypt.compare(
      data.oldPassword,
      user.password
    );
    if (!isPasswordValid) {
      throw new Error("Password lama salah");
    }

    updateData.password = await bcrypt.hash(data.newPassword, saltRounds);
  }

  if (Object.keys(updateData).length === 0) {
    throw new Error("Tidak ada data yang diperbarui.");
  }

  const updatedUser = await prisma.users.update({
    where: { id: userId },
    data: updateData,
  });

  return updatedUser;
}

// ----------------------------------------------------
// UPDATE PHOTO PROFILE
// ----------------------------------------------------
export async function updateProfileImage(
  userId: string,
  imageUrl: string
): Promise<Users> {
  const updatedUser = await prisma.users.update({
    where: { id: userId },
    data: { profile_image_url: imageUrl },
  });
  return updatedUser;
}

// ----------------------------------------------------
// UPDATE EMAIL (membutuhkan verifikasi ulang)
// ----------------------------------------------------
export async function requestEmailUpdate(
  userId: string,
  newEmail: string
): Promise<void> {
  const user = await prisma.users.findUnique({ where: { id: userId } });
  if (!user) throw new Error("Pengguna tidak ditemukan");
  if (user.email === newEmail)
    throw new Error("Email baru harus berbeda dari email lama.");

  // Cek apakah email sudah digunakan
  const existingUser = await prisma.users.findUnique({
    where: { email: newEmail },
  });
  if (existingUser) {
    throw new Error("Email ini sudah terdaftar. Silakan gunakan email lain.");
  }

  // Generate token verifikasi
  const verifyToken = generateVerifyToken(); // Asumsi helper
  const verifyTokenExpiredAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 jam

  await prisma.users.update({
    where: { id: userId },
    data: {
      email: newEmail, // Simpan email baru
      verified: false, // Set status belum terverifikasi
      verify_token: verifyToken,
      verify_token_expired_at: verifyTokenExpiredAt,
    },
  });

  // Kirim email verifikasi ke NEW_EMAIL
  await sendVerificationEmail(newEmail, verifyToken); // Asumsi helper
}

// ----------------------------------------------------
// RESEND VERIFICATION EMAIL
// ----------------------------------------------------
export async function resendVerification(userId: string): Promise<void> {
  const user = await prisma.users.findUnique({ where: { id: userId } });
  if (!user) throw new Error("Pengguna tidak ditemukan");
  if (user.verified) throw new Error("Email sudah terverifikasi.");

  const verifyToken = generateVerifyToken(); // Asumsi helper
  const verifyTokenExpiredAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 jam

  await prisma.users.update({
    where: { id: userId },
    data: {
      verify_token: verifyToken,
      verify_token_expired_at: verifyTokenExpiredAt,
    },
  });

  // Kirim email verifikasi ke user.email
  await sendVerificationEmail(user.email, verifyToken); // Asumsi helper
}

// ----------------------------------------------------
// UPDATE DETAIL KHUSUS JOB SEEKER (User Role)
// ----------------------------------------------------
export async function updateJobSeekerDetails(
  userId: string,
  data: UpdateJobSeekerDetail
): Promise<Users> {
  const user = await prisma.users.findUnique({ where: { id: userId } });
  if (!user) throw new Error("Pengguna tidak ditemukan");
  if (user.role !== "JOB_SEEKER")
    throw new Error(
      "Akses ditolak: Hanya JOB_SEEKER yang dapat memperbarui detail ini."
    );

  const updatedUser = await prisma.users.update({
    where: { id: userId },
    data: {
      dob: data.dob,
      gender: data.gender,
      education: data.education,
      address: data.address,
    },
  });
  return updatedUser;
}
