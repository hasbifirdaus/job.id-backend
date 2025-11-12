import prisma from "../../lib/config/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmail } from "../../lib/utils/sendEmail";

const JWT_SECRET = process.env.JWT_SECRET_KEY!;
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const VERIFICATION_EXP_HOURS = 1;

// ---------------- GET PROFILE ----------------
export const getProfileService = async (userId: string) => {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      dob: true,
      gender: true,
      education: true,
      address: true,
      profile_image_url: true,
      verified: true,
      created_at: true,
      updated_at: true,
    },
  });

  if (!user) throw new Error("User not found");
  return user;
};

// ---------------- UPDATE PROFILE ----------------
export const updateProfileService = async (userId: string, payload: any) => {
  const {
    name,
    email,
    dob,
    gender,
    education,
    address,
    new_password,
    current_password,
  } = payload;

  const user = await prisma.users.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const updateData: any = {};

  if (name) updateData.name = name;
  if (dob !== undefined) updateData.dob = dob ? new Date(dob) : null;
  if (gender !== undefined) updateData.gender = gender;
  if (education !== undefined) updateData.education = education;
  if (address !== undefined) updateData.address = address;

  if (email && email !== user.email) {
    const exists = await prisma.users.findUnique({ where: { email } });
    if (exists) throw new Error("Email already in use");
    updateData.email = email;
    updateData.verified = false;
  }

  if (new_password) {
    if (!current_password) throw new Error("Current password is required");
    const match = await bcrypt.compare(current_password, user.password);
    if (!match) throw new Error("Current password is incorrect");
    updateData.password = await bcrypt.hash(new_password, 10);
  }

  const updated = await prisma.users.update({
    where: { id: userId },
    data: updateData,
  });

  if (email && email !== user.email) {
    await generateAndSendVerification(updated.id, updated.email);
    return { message: "Profile updated. Verification email sent." };
  }

  return { message: "Profile updated", user: updated };
};

// ---------------- UPLOAD PHOTO ----------------
export const uploadProfilePhotoService = async (
  userId: string,
  filePath: string,
  publicUrl?: string
) => {
  const url = publicUrl || filePath;
  const updated = await prisma.users.update({
    where: { id: userId },
    data: { profile_image_url: url },
  });
  return { message: "Profile photo updated", user: updated };
};

// ---------------- VERIFICATION ----------------
export const generateAndSendVerification = async (
  userId: string,
  email: string
) => {
  const token = jwt.sign({ id: userId, email }, JWT_SECRET, {
    expiresIn: `${VERIFICATION_EXP_HOURS}h`,
  });

  const expiredAt = new Date(Date.now() + VERIFICATION_EXP_HOURS * 3600 * 1000);

  await prisma.users.update({
    where: { id: userId },
    data: { verify_token: token, verify_token_expired_at: expiredAt },
  });

  const verifyLink = `${process.env.BASE_URL_BACKEND}/api/users/verify/${encodeURIComponent(token)}`;
  const html = `
    <p>Hi ${email},</p>
    <p>Click below to verify your email (valid for ${VERIFICATION_EXP_HOURS} hour):</p>
    <a href="${verifyLink}">${verifyLink}</a>
    <p>If you didn't register, ignore this email.</p>
  `;

  await sendEmail({ to: email, subject: "Email Verification", html });
  return token;
};

// ---------------- VERIFY EMAIL ----------------
export const verifyEmailService = async (token: string) => {
  let payload: any;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch {
    throw new Error("Invalid or expired token");
  }

  const user = await prisma.users.findFirst({ where: { verify_token: token } });
  if (!user) throw new Error("Invalid verification token");

  if (
    !user.verify_token_expired_at ||
    user.verify_token_expired_at < new Date()
  )
    throw new Error("Token expired, please resend verification");

  await prisma.users.update({
    where: { id: user.id },
    data: {
      verified: true,
      verify_token: null,
      verify_token_expired_at: null,
    },
  });

  return { message: "Email verified successfully" };
};

// ---------------- RESEND VERIFICATION ----------------
export const resendVerificationService = async (
  userId?: string,
  email?: string
) => {
  const user = userId
    ? await prisma.users.findUnique({ where: { id: userId } })
    : email
      ? await prisma.users.findUnique({ where: { email } })
      : null;

  if (!user) throw new Error("User not found");
  if (user.verified) throw new Error("User already verified");

  await generateAndSendVerification(user.id, user.email);
  return { message: "Verification email resent" };
};
