import { Router } from "express";
import { createTest, getTest, submitAnswers } from "./preSelection.controller";
import { authMiddleware } from "../../lib/middleware/auth.middleware";
import { validate } from "../../lib/middleware/validation.middleware";
import {
  createPreSelectionTestBodySchema,
  submitAnswersBodySchema,
  jobIdParamSchema,
} from "./preSelection.validation";

const preSelectionRoutes = Router();

preSelectionRoutes.post(
  "/",
  authMiddleware(["COMPANY_ADMIN"]),
  validate(createPreSelectionTestBodySchema, "body"),
  createTest
);

preSelectionRoutes.get(
  "/:job_id",
  authMiddleware(),
  validate(jobIdParamSchema, "params"),
  getTest
);

preSelectionRoutes.post(
  "/submit",
  authMiddleware(["JOB_SEEKER"]),
  validate(submitAnswersBodySchema, "body"),
  submitAnswers
);

export default preSelectionRoutes;
