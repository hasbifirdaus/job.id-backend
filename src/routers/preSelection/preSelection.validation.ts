import * as yup from "yup";
import { QuestionOption } from "../../generated/prisma";

export const createPreSelectionTestBodySchema = yup.object({
  job_id: yup
    .number()
    .positive()
    .integer()
    .required("Job ID is required")
    .typeError("Job ID must be a number"),
  title: yup.string().required("Test title is required"),
  questions: yup
    .array()
    .of(
      yup.object({
        question: yup.string().required("Question text is required"),
        option_a: yup.string().required("Option A is required"),
        option_b: yup.string().required("Option B is required"),
        option_c: yup.string().required("Option C is required"),
        option_d: yup.string().required("Option D is required"),
        correct_answer: yup
          .mixed<QuestionOption>()
          .oneOf(
            ["A", "B", "C", "D"],
            "Correct answer must be one of 'A','B','C','D'"
          )
          .required("Correct answer is required"),
      })
    )
    .min(1, "At least one question is required")
    .required("Questions are required"),
});

export const jobIdParamSchema = yup.object({
  job_id: yup
    .number()
    .positive()
    .integer()
    .required("Job ID is required")
    .typeError("Job ID must be a number"),
});

export const submitAnswersBodySchema = yup.object({
  job_id: yup
    .number()
    .positive()
    .integer()
    .required("Job ID is required")
    .typeError("Job ID must be a number"),
  expected_salary: yup
    .number()
    .positive()
    .required("Expected salary is required")
    .typeError("Expected salary must be a number"),
  answers: yup
    .array()
    .of(
      yup.object({
        question_id: yup
          .number()
          .positive()
          .integer()
          .required("Question ID is required")
          .typeError("Question ID must be a number"),
        user_answer: yup
          .mixed<QuestionOption>()
          .oneOf(
            ["A", "B", "C", "D"],
            "User answer must be one of 'A','B','C','D'"
          )
          .required("User answer is required"),
      })
    )
    .min(1, "At least one answer is required")
    .required("Answers are required"),
});
