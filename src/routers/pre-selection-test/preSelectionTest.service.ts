import prisma from "../../lib/config/prisma";
import {
  PreSelectionTests,
  Applications,
  QuestionOption,
} from "../../generated/prisma";
import { Question } from "../../types/question";
import { Decimal } from "decimal.js";

const validQuestionOptions: QuestionOption[] = [
  QuestionOption.A,
  QuestionOption.B,
  QuestionOption.C,
  QuestionOption.D,
];

const getOptionEnum = (index: number): QuestionOption => {
  switch (index) {
    case 0:
      return QuestionOption.A;
    case 1:
      return QuestionOption.B;
    case 2:
      return QuestionOption.C;
    case 3:
      return QuestionOption.D;
    default:
      throw new Error("Invalid correct answer index");
  }
};

interface ApplicantAnswer {
  question_id: number;
  user_answer: QuestionOption;
}

export const preSelectionTestService = {
  // --- Manajemen Tes oleh Company Admin ---

  async getTestConfig(jobId: number) {
    const test = await prisma.preSelectionTests.findUnique({
      where: { job_id: jobId },
      include: { questions: { orderBy: { id: "asc" } } },
    });

    // Struktur untuk frontend
    if (test) {
      // Konversi struktur questions dari Prisma ke struktur Frontend/Draf
      const questionsForFrontend: Question[] = test.questions.map(
        (q, index) => {
          const correctAnswerIndex = validQuestionOptions.indexOf(
            q.correct_answer
          ) as 0 | 1 | 2 | 3;

          return {
            id: index + 1,
            question: q.question,
            options: [q.option_a, q.option_b, q.option_c, q.option_d],
            correctAnswer: correctAnswerIndex,
          };
        }
      );

      return {
        testId: test.id,
        jobId: test.job_id,
        title: test.title,
        status: test.status,
        questions: questionsForFrontend,
        // Tambahkan total pertanyaan untuk referensi
        totalQuestions: questionsForFrontend.length,
      };
    }
    return null; // Tes belum dikonfigurasi
  },

  async upsertTest(
    jobId: number,
    title: string,
    questions: Question[],
    status: string,
    companyId: number
  ) {
    // 1. Cek kepemilikan Job
    const job = await prisma.jobs.findUnique({ where: { id: jobId } });
    if (!job || job.company_id !== companyId) {
      throw new Error("Job not found or access denied.");
    }

    const existingTest = await prisma.preSelectionTests.findUnique({
      where: { job_id: jobId },
    });

    const transactionResult = await prisma.$transaction(async (tx) => {
      let test: PreSelectionTests;

      if (existingTest) {
        // A. UPDATE Test Utama
        test = await tx.preSelectionTests.update({
          where: { id: existingTest.id },
          data: { title, status },
        });

        // B. Hapus semua pertanyaan lama
        await tx.preSelectionQuestions.deleteMany({
          where: { test_id: existingTest.id },
        });
      } else {
        // A. CREATE Test Utama
        test = await tx.preSelectionTests.create({
          data: { job_id: jobId, title, status },
        });
      }

      // C. Buat pertanyaan baru
      const newQuestions = questions.map((q) => {
        const correctAnswerEnum = getOptionEnum(q.correctAnswer);
        return {
          test_id: test.id,
          question: q.question,
          option_a: q.options[0],
          option_b: q.options[1],
          option_c: q.options[2],
          option_d: q.options[3],
          correct_answer: correctAnswerEnum,
        };
      });

      await tx.preSelectionQuestions.createMany({
        data: newQuestions,
      });

      return test;
    });

    return transactionResult;
  },

  async disableTest(jobId: number, companyId: number) {
    // 1. Cek kepemilikan Job
    const job = await prisma.jobs.findUnique({ where: { id: jobId } });
    if (!job || job.company_id !== companyId) {
      throw new Error("Job not found or access denied.");
    }

    const test = await prisma.preSelectionTests.update({
      where: { job_id: jobId },
      data: { status: "draft" },
    });
    return test;
  },

  // --- Pengambilan Hasil Tes ---

  async getTestResults(jobId: number, companyId: number) {
    // 1. Cek kepemilikan Job
    const job = await prisma.jobs.findUnique({ where: { id: jobId } });
    if (!job || job.company_id !== companyId) {
      throw new Error("Job not found or access denied.");
    }

    const applications = await prisma.applications.findMany({
      where: {
        job_id: jobId,
        test_completed_at: { not: null }, // Hanya yang sudah menyelesaikan tes
      },
      select: {
        id: true,
        test_score: true,
        test_completed_at: true,
        status: true,
        user: {
          select: { name: true, email: true },
        },
      },
      orderBy: { test_completed_at: "desc" },
    });

    // Mapping ke format yang lebih mudah digunakan oleh frontend
    return applications.map((app) => ({
      applicationId: app.id,
      applicantName: app.user.name,
      applicantEmail: app.user.email,
      score: app.test_score ? parseFloat(app.test_score.toFixed(2)) : 0, // Konversi Decimal
      // Asumsi: Status Lulus/Gagal ditentukan oleh perusahaan,
      // di sini kita hanya menggunakan skor, frontend bisa menentukan passing score
      isPassed: app.test_score ? app.test_score.toNumber() >= 60 : false, // Contoh passing score 60
      testDate: app.test_completed_at?.toISOString().split("T")[0],
      applicationStatus: app.status,
    }));
  },

  // --- Proses Pengambilan dan Pengiriman Tes oleh Pelamar ---

  async getTestQuestionsForApplicant(jobId: number, userId: string) {
    const test = await prisma.preSelectionTests.findUnique({
      where: { job_id: jobId },
      include: { questions: { orderBy: { id: "asc" } } },
    });

    if (!test || test.status !== "published") {
      throw new Error("Test is not active or does not exist.");
    }

    // Cek apakah pelamar sudah mengambil tes untuk lamaran ini
    const existingApplication = await prisma.applications.findUnique({
      where: { user_id_job_id: { user_id: userId, job_id: jobId } },
    });

    if (existingApplication?.test_completed_at) {
      throw new Error("Anda sudah menyelesaikan tes untuk lowongan ini.");
    }

    // Mapping untuk Pelamar (TIDAK menyertakan jawaban yang benar!)
    const questionsForApplicant = test.questions.map((q) => ({
      question_id: q.id,
      question: q.question,
      options: {
        A: q.option_a,
        B: q.option_b,
        C: q.option_c,
        D: q.option_d,
      },
    }));

    return {
      testId: test.id,
      title: test.title,
      questions: questionsForApplicant,
      totalQuestions: questionsForApplicant.length,
    };
  },

  async submitTest(jobId: number, userId: string, answers: ApplicantAnswer[]) {
    const application = await prisma.applications.findUnique({
      where: { user_id_job_id: { user_id: userId, job_id: jobId } },
    });

    if (!application) {
      throw new Error(
        "Lamaran tidak ditemukan. Anda harus melamar terlebih dahulu."
      );
    }

    if (application.test_completed_at) {
      throw new Error("Anda sudah menyelesaikan tes untuk lowongan ini.");
    }

    const test = await prisma.preSelectionTests.findUnique({
      where: { job_id: jobId },
      include: { questions: true },
    });

    if (!test || test.status !== "published") {
      throw new Error("Tes tidak aktif.");
    }

    if (answers.length !== test.questions.length) {
      // Ini adalah aturan bisnis yang ketat: harus menjawab semua soal
      throw new Error(
        `Anda harus menjawab semua ${test.questions.length} pertanyaan.`
      );
    }

    let correctCount = 0;
    const totalQuestions = test.questions.length;
    const answersToCreate: {
      application_id: number;
      question_id: number;
      user_answer: QuestionOption;
      is_correct: boolean;
    }[] = [];

    for (const submittedAnswer of answers) {
      const question = test.questions.find(
        (q) => q.id === submittedAnswer.question_id
      );
      if (!question) {
        // Jika ada ID pertanyaan yang tidak valid
        throw new Error(
          `Pertanyaan dengan ID ${submittedAnswer.question_id} tidak ditemukan.`
        );
      }

      const isCorrect = submittedAnswer.user_answer === question.correct_answer;
      if (isCorrect) {
        correctCount++;
      }

      answersToCreate.push({
        application_id: application.id,
        question_id: question.id,
        user_answer: submittedAnswer.user_answer,
        is_correct: isCorrect,
      });
    }

    const score = (correctCount / totalQuestions) * 100;
    // Menggunakan Decimal yang sudah diimpor (MEMPERBAIKI ERROR 2339)
    const scoreDecimal = new Decimal(score);

    await prisma.$transaction([
      // 1. Simpan semua jawaban
      prisma.preSelectionAnswers.createMany({
        data: answersToCreate,
        skipDuplicates: true,
      }),

      // 2. Update status Lamaran (Applications) dengan skor
      prisma.applications.update({
        where: { id: application.id },
        data: {
          test_id: test.id, // Link ke tes yang diambil
          test_score: scoreDecimal,
          test_completed_at: new Date(),
          // Opsional: ganti status jika lolos ambang batas otomatis
          // status: score >= PASSING_SCORE ? ApplicationStatus.REVIEWED : ApplicationStatus.REJECTED
        },
      }),
    ]);

    return {
      score: parseFloat(scoreDecimal.toFixed(2)),
      correctAnswers: correctCount,
      totalQuestions,
    };
  },

  async deleteQuestion(questionId: number, companyId: number) {
    // 1. Temukan pertanyaan dan Tes terkait
    const question = await prisma.preSelectionQuestions.findUnique({
      where: { id: questionId },
      include: { test: { select: { job_id: true } } },
    });

    if (!question) {
      throw new Error("Pertanyaan tidak ditemukan.");
    }
    const job = await prisma.jobs.findUnique({
      where: { id: question.test.job_id },
    });
    if (!job || job.company_id !== companyId) {
      throw new Error(
        "Akses ditolak: Anda bukan admin perusahaan pemilik lowongan ini."
      );
    }
    const deletedQuestion = await prisma.preSelectionQuestions.delete({
      where: { id: questionId },
    });
    return deletedQuestion;
  },

  async updateSingleQuestion(
    questionId: number,
    companyId: number,
    updatedQuestionData: Partial<Question>
  ) {
    // 1. Temukan pertanyaan dan Tes terkait
    const question = await prisma.preSelectionQuestions.findUnique({
      where: { id: questionId },
      include: { test: { select: { job_id: true } } },
    });

    if (!question) {
      throw new Error("Pertanyaan tidak ditemukan.");
    }
    // 2. Cek kepemilikan Job
    const job = await prisma.jobs.findUnique({
      where: { id: question.test.job_id },
    });
    if (!job || job.company_id !== companyId) {
      throw new Error(
        "Akses ditolak: Anda bukan admin perusahaan pemilik lowongan ini."
      );
    }

    const dataToUpdate: any = {};

    if (updatedQuestionData.question !== undefined) {
      dataToUpdate.question = updatedQuestionData.question;
    }

    if (updatedQuestionData.options) {
      dataToUpdate.option_a = updatedQuestionData.options[0];
      dataToUpdate.option_b = updatedQuestionData.options[1];
      dataToUpdate.option_c = updatedQuestionData.options[2];
      dataToUpdate.option_d = updatedQuestionData.options[3];
    }

    if (updatedQuestionData.correctAnswer !== undefined) {
      dataToUpdate.correct_answer = getOptionEnum(
        updatedQuestionData.correctAnswer
      );
    }

    if (Object.keys(dataToUpdate).length === 0) {
      return question; // Tidak ada yang perlu diupdate
    } // 4. Update pertanyaan

    const updatedQuestion = await prisma.preSelectionQuestions.update({
      where: { id: questionId },
      data: dataToUpdate,
    });

    return updatedQuestion;
  },
};
