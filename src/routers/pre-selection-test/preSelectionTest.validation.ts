import * as yup from "yup";
import { QuestionOption } from "../../generated/prisma";

// Tipe untuk opsi pertanyaan yang valid
const validQuestionOptions: QuestionOption[] = ["A", "B", "C", "D"];

// --- 1. Skema untuk satu objek Question (Digunakan di createOrUpdateTestSchema) ---
export const questionInputSchema = yup.object().shape({
  id: yup.number().integer().min(1).required(), // Diperlukan untuk identifikasi di frontend
  question: yup
    .string()
    .trim()
    .min(1, "Teks pertanyaan tidak boleh kosong.")
    .required(),
  options: yup
    .array()
    .of(
      yup.string().trim().min(1, "Opsi jawaban tidak boleh kosong.").required()
    )
    .length(4, "Setiap soal harus memiliki tepat 4 opsi jawaban.")
    .required(),
  correctAnswer: yup.number().integer().min(0).max(3).required(), // Frontend menggunakan index 0-3
});

// --- 2. Skema untuk payload POST/PUT tes ---
export const createOrUpdateTestSchema = yup.object().shape({
  questions: yup
    .array()
    .of(questionInputSchema) // Menggunakan skema yang didefinisikan di atas
    .min(1, "Tes harus memiliki minimal 1 pertanyaan.")
    .max(25, "Tes dibatasi maksimal 25 pertanyaan.")
    .required(), // Status tes di skema prisma Anda adalah String, kita akan validasi isinya.

  status: yup
    .string()
    .oneOf(["draft", "published"], "Status tidak valid.")
    .required(),

  title: yup.string().trim().min(3, "Judul tes minimal 3 karakter.").required(),
});

// --- 3. Skema untuk pengiriman jawaban pelamar ---
export const submitAnswerSchema = yup.object().shape({
  answers: yup
    .array()
    .of(
      yup.object().shape({
        question_id: yup
          .number()
          .integer()
          .required("ID pertanyaan harus ada."),
        user_answer: yup
          .string()
          .oneOf(validQuestionOptions, "Jawaban tidak valid (A, B, C, atau D).")
          .required("Jawaban pelamar harus ada."),
      })
    )
    .min(1, "Minimal 1 jawaban harus disertakan.")
    .required(),
});

// --- 4. Skema untuk update satu pertanyaan (PATCH) ---
export const updateQuestionSchema = yup.object().shape({
  question: yup
    .string()
    .trim()
    .min(1, "Teks pertanyaan tidak boleh kosong.")
    .optional(),

  options: yup
    .array()
    .of(
      yup.string().trim().min(1, "Opsi jawaban tidak boleh kosong.").required()
    )
    .length(4, "Opsi jawaban harus memiliki tepat 4 elemen.")
    .optional(),

  correctAnswer: yup.number().integer().min(0).max(3).optional(),
});
