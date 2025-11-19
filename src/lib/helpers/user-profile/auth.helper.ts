// src/lib/helpers/auth.helper.ts
import crypto from "crypto";

/**
 * Menghasilkan token acak untuk verifikasi email.
 * @returns string Token acak.
 */
export function generateVerifyToken(): string {
  return crypto.randomBytes(32).toString("hex");
}
