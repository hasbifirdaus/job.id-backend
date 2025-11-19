import * as yup from "yup";

// ----------------------------------------------------
// VALIDASI UNTUK UPDATE DATA PERSONAL (Nama, Password)
// ----------------------------------------------------
export const updatePersonalSchema = yup.object({
  name: yup
    .string()
    .trim()
    .max(100, "Nama tidak boleh lebih dari 100 karakter")
    .optional(),

  oldPassword: yup
    .string()
    .min(8, "Password lama harus minimal 8 karakter")
    .optional(),

  newPassword: yup
    .string()
    .min(8, "Password baru harus minimal 8 karakter")
    .when("oldPassword", {
      is: (val: string) => !!val,
      then: (schema) =>
        schema.required("Password baru wajib diisi jika mengganti password"),
      otherwise: (schema) => schema.optional(),
    }),
});

// ----------------------------------------------------
// VALIDASI UNTUK UPDATE EMAIL
// ----------------------------------------------------
export const updateEmailSchema = yup.object({
  email: yup
    .string()
    .trim()
    .email("Format email tidak valid")
    .max(100, "Email tidak boleh lebih dari 100 karakter")
    .required("Email wajib diisi"),
});

// ----------------------------------------------------
// VALIDASI UNTUK UPDATE DETAIL KHUSUS JOB SEEKER (USER)
// ----------------------------------------------------
export const updateJobSeekerDetailSchema = yup.object({
  dob: yup.date().nullable().required("Tanggal lahir wajib diisi"),
  gender: yup
    .mixed<"MALE" | "FEMALE" | "OTHER">()
    .oneOf(["MALE", "FEMALE", "OTHER"], "Jenis kelamin tidak valid")
    .required("Jenis kelamin wajib diisi"),
  education: yup
    .string()
    .trim()
    .max(100, "Pendidikan tidak boleh lebih dari 100 karakter")
    .required("Pendidikan terakhir wajib diisi"),
  address: yup.string().trim().required("Alamat domisili terkini wajib diisi"),
});

// ----------------------------------------------------
// VALIDASI UNTUK FILE UPLOAD FOTO PROFIL
// ----------------------------------------------------
const MAX_FILE_SIZE = 1024 * 1024;
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png"];

export const validateProfileImage = (
  file: Express.Multer.File
): string | null => {
  if (!file) return "Foto profil wajib diupload.";
  if (file.size > MAX_FILE_SIZE) {
    return "Ukuran file terlalu besar. Maksimum 1MB.";
  }
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return "Ekstensi file tidak valid. Hanya .jpg, .jpeg, .png yang diperbolehkan.";
  }
  return null;
};
