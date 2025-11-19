// src/lib/helpers/email.helper.ts

/**
 * Asumsi fungsi untuk mengirim email verifikasi.
 * Diimplementasi menggunakan library seperti nodemailer.
 * @param email Email tujuan
 * @param token Token verifikasi
 */
export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<void> {
  // --- Implementasi Nodemailer / Mail Service di sini ---
  console.log(
    `[EMAIL SIMULASI] Mengirim verifikasi ke ${email} dengan token: ${token}`
  );
  // Contoh link verifikasi: `${process.env.FRONTEND_URL}/verify?token=${token}`
  // throw new Error("Fitur pengiriman email belum diimplementasikan!");
  // Anda perlu mengganti ini dengan logic pengiriman email yang sebenarnya.
}
