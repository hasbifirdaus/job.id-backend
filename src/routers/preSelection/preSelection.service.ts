import prisma from "../../lib/config/prisma";
import { QuestionOption } from "../../generated/prisma";

interface ICreateQuestionInput {
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: QuestionOption;
}

export const createPreSelectionTest = async (
  company_id: number,
  job_id: number,
  title: string,
  questions: ICreateQuestionInput[]
) => {
  //pastikan job milik company ini
  const job = await prisma.jobs.findFirst({
    where: { id: job_id, company_id },
  });

  if (!job) throw new Error("Job not found or unauthorized.");

  //Buat test baru
  const test = await prisma.preSelectionTests.create({
    data: {
      job_id,
      title,
      questions: {
        create: questions.map((q) => ({
          question: q.question,
          option_a: q.option_a,
          option_b: q.option_b,
          option_c: q.option_c,
          option_d: q.option_d,
          correct_answer: q.correct_answer,
        })),
      },
    },
    include: { questions: true },
  });
  return test;
};

export const getTestByJob = async (job_id: number) => {
  return prisma.preSelectionTests.findUnique({
    where: { job_id },
    include: { questions: true },
  });
};

interface ISubmitAnswer {
  question_id: number;
  user_answer: QuestionOption;
}

export const submitPreSelectionAnsewrs = async (
  user_id: string,
  job_id: number,
  answers: ISubmitAnswer[],
  expected_salary: number
) => {
  const test = await prisma.preSelectionTests.findUnique({
    where: { job_id },
    include: { questions: true },
  });

  if (!test) throw new Error("No test found for this job.");

  //Hitung Skor
  let correctCount = 0;
  for (const question of test.questions) {
    const answer = answers.find((a) => a.question_id === question.id);
    if (answer && answer.user_answer === question.correct_answer) {
      correctCount++;
    }
  }

  const score = parseFloat(
    ((correctCount / test.questions.length) * 100).toFixed(2)
  );

  //Buat Application baru
  const application = await prisma.applications.create({
    data: {
      job_id,
      user_id,
      test_id: test.id,
      expected_salary,
      test_score: score,
      test_completed_at: new Date(),
      status: "SUBMITTED",
    },
  });

  //simpan jawaban
  await prisma.preSelectionAnswers.createMany({
    data: answers.map((a) => {
      const question = test.questions.find((q) => q.id === a.question_id);
      const isCorrect = question?.correct_answer === a.user_answer;
      return {
        application_id: application.id,
        question_id: a.question_id,
        user_answer: a.user_answer,
        is_correct: isCorrect ?? false,
      };
    }),
  });

  return { score, application };
};
