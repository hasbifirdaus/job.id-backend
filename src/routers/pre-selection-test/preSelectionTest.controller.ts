import { Response } from "express";
import { preSelectionTestService } from "./preSelectionTest.service";
import { AuthenticatedRequest } from "../../lib/middleware/auth.middleware";
import prisma from "../../lib/config/prisma";
import { Question } from "../../types/question";
import { QuestionOption } from "../../generated/prisma";
import { updateQuestionSchema } from "./preSelectionTest.validation";

interface TestPayload {
  questions: Question[];
  status: string;
  title: string;
}

interface AnswerPayload {
  answers: { question_id: number; user_answer: QuestionOption }[];
}

export const preSelectionTestController = {
  // --- COMPANY ADMIN Endpoints ---

  // GET /api/jobs/:jobId/test
  async getTestConfig(req: AuthenticatedRequest, res: Response) {
    try {
      const jobId = parseInt(req.params.jobId);
      // Otorisasi: Admin harus memiliki role COMPANY_ADMIN
      if (req.user?.role !== "COMPANY_ADMIN") {
        return res.status(403).json({ message: "Akses ditolak." });
      }

      const test = await preSelectionTestService.getTestConfig(jobId);

      if (!test) {
        return res.status(200).json({
          jobId,
          status: "draft",
          title: `Test Lowongan ${jobId}`, // Judul default
          questions: [],
          totalQuestions: 0,
        });
      }

      // Otorisasi: Pastikan Admin adalah pemilik job
      // Perlu diingat, ini duplikasi dari logika di service. Biasanya lebih baik
      // membiarkan service yang melakukan cek kepemilikan.
      const job = await prisma.jobs.findUnique({ where: { id: jobId } });
      if (!job || job.company_id !== req.user?.company_id) {
        return res.status(404).json({
          message: "Konfigurasi Tes tidak ditemukan atau Akses ditolak.",
        });
      }

      return res.status(200).json(test);
    } catch (error: any) {
      console.error("Error in getTestConfig:", error);
      res.status(500).json({
        message: "Gagal memuat konfigurasi tes.",
        error: error.message,
      });
    }
  },

  // POST/PUT /api/jobs/:jobId/test
  async createOrUpdateTest(req: AuthenticatedRequest, res: Response) {
    try {
      const jobId = parseInt(req.params.jobId);
      const { questions, status, title } = req.body as TestPayload;
      const companyId = req.user?.company_id;

      if (req.user?.role !== "COMPANY_ADMIN" || !companyId) {
        return res.status(403).json({ message: "Akses ditolak." });
      }

      const updatedTest = await preSelectionTestService.upsertTest(
        jobId,
        title,
        questions,
        status,
        companyId
      );

      res.status(200).json({
        message: `Tes berhasil di${updatedTest.status === "published" ? "aktifkan" : "update"}!`,
        data: updatedTest,
      });
    } catch (error: any) {
      console.error("Error in createOrUpdateTest:", error);
      if (
        error.message.includes("access denied") ||
        error.message.includes("Job not found")
      ) {
        return res.status(403).json({
          message:
            "Akses ditolak: Anda bukan admin perusahaan pemilik lowongan ini atau lowongan tidak ditemukan.",
        });
      }
      res.status(500).json({
        message: "Gagal menyimpan atau mengaktifkan tes.",
        error: error.message,
      });
    }
  },

  // PATCH /api/jobs/:jobId/test/status/disable
  async disableTest(req: AuthenticatedRequest, res: Response) {
    try {
      const jobId = parseInt(req.params.jobId);
      const companyId = req.user?.company_id;

      if (req.user?.role !== "COMPANY_ADMIN" || !companyId) {
        return res.status(403).json({ message: "Akses ditolak." });
      }

      const disabledTest = await preSelectionTestService.disableTest(
        jobId,
        companyId
      );

      res.status(200).json({
        message: "Tes berhasil dinonaktifkan!",
        data: disabledTest,
      });
    } catch (error: any) {
      console.error("Error in disableTest:", error);
      if (
        error.message.includes("access denied") ||
        error.message.includes("Job not found")
      ) {
        return res.status(403).json({
          message:
            "Akses ditolak: Anda bukan admin perusahaan pemilik lowongan ini atau lowongan tidak ditemukan.",
        });
      }
      res
        .status(500)
        .json({ message: "Gagal menonaktifkan tes.", error: error.message });
    }
  },

  // GET /api/jobs/:jobId/test/results
  async getTestResults(req: AuthenticatedRequest, res: Response) {
    try {
      const jobId = parseInt(req.params.jobId);
      const companyId = req.user?.company_id;

      if (req.user?.role !== "COMPANY_ADMIN" || !companyId) {
        return res.status(403).json({ message: "Akses ditolak." });
      }

      const results = await preSelectionTestService.getTestResults(
        jobId,
        companyId
      );

      res.status(200).json(results);
    } catch (error: any) {
      console.error("Error in getTestResults:", error);
      if (
        error.message.includes("access denied") ||
        error.message.includes("Job not found")
      ) {
        return res.status(403).json({
          message:
            "Akses ditolak: Anda bukan admin perusahaan pemilik lowongan ini atau lowongan tidak ditemukan.",
        });
      }
      res
        .status(500)
        .json({ message: "Gagal memuat hasil tes.", error: error.message });
    }
  },

  // --- JOB SEEKER Endpoints ---

  // GET /api/jobs/:jobId/test/applicant
  async getTestForApplicant(req: AuthenticatedRequest, res: Response) {
    try {
      const jobId = parseInt(req.params.jobId);
      const userId = req.user?.id;

      if (req.user?.role !== "JOB_SEEKER" || !userId) {
        return res.status(403).json({
          message: "Akses ditolak. Hanya pelamar yang dapat mengambil tes.",
        });
      }

      const testData =
        await preSelectionTestService.getTestQuestionsForApplicant(
          jobId,
          userId
        );

      res.status(200).json(testData);
    } catch (error: any) {
      console.error("Error in getTestForApplicant:", error);
      // Status 400 untuk Bad Request, misalnya: "Test is not active" atau "Anda sudah menyelesaikan tes"
      res.status(400).json({ message: error.message });
    }
  },

  // POST /api/jobs/:jobId/test/submit
  async submitTest(req: AuthenticatedRequest, res: Response) {
    try {
      const jobId = parseInt(req.params.jobId);
      const userId = req.user?.id;
      const { answers } = req.body as AnswerPayload;

      if (req.user?.role !== "JOB_SEEKER" || !userId) {
        return res.status(403).json({
          message: "Akses ditolak. Hanya pelamar yang dapat mengirimkan tes.",
        });
      }

      const result = await preSelectionTestService.submitTest(
        jobId,
        userId,
        answers
      );

      res.status(200).json({
        message: "Tes berhasil dikirim dan skor dihitung.",
        data: result,
      });
    } catch (error: any) {
      console.error("Error in submitTest:", error);
      // Status 400 untuk Bad Request, misalnya: "Lamaran tidak ditemukan", "Tes tidak aktif", "Harus menjawab semua soal"
      res.status(400).json({ message: error.message });
    }
  },

  async deleteQuestion(req: AuthenticatedRequest, res: Response) {
    try {
      const questionId = parseInt(req.params.questionId);
      const companyId = req.user?.company_id;

      if (req.user?.role !== "COMPANY_ADMIN" || !companyId) {
        return res.status(403).json({ message: "Akses ditolak." });
      }

      await preSelectionTestService.deleteQuestion(questionId, companyId);

      res.status(200).json({ message: "Pertanyaan berhasil dihapus." });
    } catch (error: any) {
      console.error("Error in deleteQuestion:", error);
      if (
        error.message.includes("Akses ditolak") ||
        error.message.includes("Job not found")
      ) {
        return res.status(403).json({ message: error.message });
      }
      res
        .status(404)
        .json({ message: "Gagal menghapus pertanyaan.", error: error.message });
    }
  },

  async updateSingleQuestion(req: AuthenticatedRequest, res: Response) {
    try {
      const questionId = parseInt(req.params.questionId);
      const companyId = req.user?.company_id; // Data di body sesuai dengan Partial<Question> dari frontend, tapi sudah divalidasi
      const updatedData = req.body as Partial<Question>;

      if (req.user?.role !== "COMPANY_ADMIN" || !companyId) {
        return res.status(403).json({ message: "Akses ditolak." });
      }

      const updatedQuestion =
        await preSelectionTestService.updateSingleQuestion(
          questionId,
          companyId,
          updatedData
        );

      res.status(200).json({
        message: "Pertanyaan berhasil diupdate.",
        data: updatedQuestion,
      });
    } catch (error: any) {
      console.error("Error in updateSingleQuestion:", error);
      if (
        error.message.includes("Akses ditolak") ||
        error.message.includes("Job not found")
      ) {
        return res.status(403).json({ message: error.message });
      }
      res.status(404).json({
        message: "Gagal mengupdate pertanyaan.",
        error: error.message,
      });
    }
  },
};
