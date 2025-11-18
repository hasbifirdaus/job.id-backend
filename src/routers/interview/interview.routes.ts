import { Router } from "express";
import {
  createInterviewController,
  getInterviewsController,
  getInterviewByIdController,
  updateInterviewController,
  deleteInterviewController,
} from "./interview.controller";
import { authMiddleware } from "../../lib/middleware/auth.middleware";
import { validate } from "../../lib/middleware/validation.middleware";
import {
  createInterviewSchema,
  interviewIdParamSchema,
  updateInterviewSchema,
} from "./interview.validation";

const interviewRoutes = Router();

interviewRoutes.post(
  "/",
  authMiddleware(["COMPANY_ADMIN"]),
  validate(createInterviewSchema, "body"),
  createInterviewController
);

interviewRoutes.get(
  "/",
  authMiddleware(["COMPANY_ADMIN"]),
  getInterviewsController
);

interviewRoutes.get(
  "/:id",
  authMiddleware(["COMPANY_ADMIN"]),
  validate(interviewIdParamSchema, "params"),
  getInterviewByIdController
);

// PUT update
interviewRoutes.put(
  "/:id",
  authMiddleware(["COMPANY_ADMIN"]),
  validate(interviewIdParamSchema, "params"),
  validate(updateInterviewSchema, "body"),
  updateInterviewController
);

interviewRoutes.delete(
  "/:id",
  authMiddleware(["COMPANY_ADMIN"]),
  validate(interviewIdParamSchema, "params"),
  deleteInterviewController
);

export default interviewRoutes;
