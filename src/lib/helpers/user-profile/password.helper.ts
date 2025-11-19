// src/lib/helpers/password.helper.ts
import bcrypt from "bcryptjs";

const saltRounds = 10;

/**
 * Menghash password sebelum disimpan ke database.
 * @param password Password yang akan di-hash.
 * @returns Promise<string> Hash password.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, saltRounds);
}

/**
 * Membandingkan password yang diberikan pengguna dengan hash di database.
 * @param plainPassword Password yang diinput pengguna (plain text).
 * @param hashedPassword Hash password dari database.
 * @returns Promise<boolean> True jika cocok, False jika tidak.
 */
export async function comparePassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}
