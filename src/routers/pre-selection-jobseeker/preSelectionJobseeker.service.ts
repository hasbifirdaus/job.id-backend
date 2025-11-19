import prisma from "../../lib/config/prisma";
import { QuestionOption } from "../../generated/prisma";

interface IAnswerIn {
  question_id: number;
  user_answer: QuestionOption;
}

export interface IExtraInfo {
  preselection_progress?: {
    answers: { question_id: number; user_answer: string }[];
    updated_at: string | Date;
  };
  [key: string]: any;
}

export const PreSelectionService = {
  async getTestForJob(jobId: number) {
    return prisma.preSelectionTests.findUnique({
      where: { job_id: jobId },
      include: {
        questions: {
          where: { deleted_at: null },
          orderBy: { id: "asc" },
        },
      },
    });
  },

  async submitTest(applicationId: number, answers: IAnswerIn[]) {
    const application = await prisma.applications.findUnique({
      where: { id: applicationId },
    });
    if (!application) throw new Error("Application not found.");

    const test = await prisma.preSelectionTests.findUnique({
      where: { job_id: application.job_id },
      include: { questions: true },
    });
    if (!test) throw new Error("Test not found");

    let correctCount = 0;
    const answerRecords = [];
    for (const ans of answers) {
      const q = test.questions.find((x) => x.id === ans.question_id);
      if (!q) continue;
      const isCorrect = q.correct_answer === ans.user_answer;
      if (isCorrect) correctCount++;
      answerRecords.push({
        application_id: applicationId,
        question_id: q.id,
        user_answer: ans.user_answer,
        is_correct: isCorrect,
      });
    }

    const score = parseFloat(
      ((correctCount / test.questions.length) * 100).toFixed(2)
    );

    await prisma.$transaction([
      prisma.preSelectionAnswers.deleteMany({
        where: { application_id: applicationId },
      }),
      prisma.preSelectionAnswers.createMany({ data: answerRecords }),
      prisma.applications.update({
        where: { id: applicationId },
        data: {
          test_score: score,
          test_completed_at: new Date(),
        },
      }),
    ]);

    return { score, correctCount, total: test.questions.length };
  },

  async saveProgress(
    applicationId: number,
    answers: { question_id: number; user_answer: string }[]
  ) {
    const application = await prisma.applications.findUnique({
      where: { id: applicationId },
    });
    if (!application) throw new Error("Application not found.");

    const extra = (application.extra_info as IExtraInfo) || {};

    extra.preselection_progress = {
      answers,
      updated_at: new Date(),
    };

    const updated = await prisma.applications.update({
      where: { id: applicationId },
      data: { extra_info: extra },
    });

    return updated;
  },

  async getResultByApplication(applicationId: number) {
    const application = await prisma.applications.findUnique({
      where: { id: applicationId },
      include: {
        answers: {
          include: { question: true },
        },
        job: {
          include: {
            preSelectionTest: {
              include: { questions: true },
            },
          },
        },
      },
    });

    if (!application) throw new Error("Application not found.");

    const test = application.job?.preSelectionTest || null;
    const extra = application.extra_info as IExtraInfo;
    const savedAnswers = extra?.preselection_progress?.answers || [];
    const submittedAnswers = (application.answers || []).map((a: any) => ({
      question_id: a.question_id,
      user_answer: a.user_answer,
      is_correct: a.is_correct,
    }));

    return {
      applicationId,
      test,
      savedAnswers,
      submittedAnswers,
      score: application.test_score,
      test_completed_at: application.test_completed_at,
    };
  },
};
