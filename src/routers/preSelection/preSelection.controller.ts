import { Request, Response } from "express";
import {
  createPreSelectionTest,
  getTestByJob,
  submitPreSelectionAnsewrs,
} from "./preSelection.service";
import { QuestionOption } from "../../generated/prisma";

export const createTest = async (req: any, res: Response) => {
  try {
    const company_id = req.user.company_id; //dari token JWT
    const { job_id, title, questions } = req.body;

    const formattedQuestions = questions.map((q: any) => ({
      question: q.question,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_answer: q.correct_answer as QuestionOption,
    }));

    const test = await createPreSelectionTest(
      company_id,
      job_id,
      title,
      formattedQuestions
    );
    res.status(201).json({ message: "Tes created successfully", test });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const getTest = async (req: Request, res: Response) => {
  try {
    const job_id = Number(req.params.job_id);
    const test = await getTestByJob(job_id);
    res.status(200).json(test);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const submitAnswers = async (req: any, res: Response) => {
  try {
    const user_id = req.user.id;
    const { job_id, answers, expected_salary } = req.body;

    const formattedQuestions = answers.map((a: any) => ({
      question_id: a.question_id,
      user_answer: a.user_answer as QuestionOption,
    }));

    const result = await submitPreSelectionAnsewrs(
      user_id,
      job_id,
      formattedQuestions,
      expected_salary
    );
    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
