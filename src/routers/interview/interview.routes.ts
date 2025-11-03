import { Router } from "express";
import {
  createInterviewController,
  getInterviewsController,
  getInterviewByIdController,
  updateInterviewController,
  deleteInterviewController,
} from "./interview.controller";
import { authMiddleware } from "../../lib/middleware/auth.middleware";

const interviewRoutes = Router();

interviewRoutes.post(
  "/",
  authMiddleware(["COMPANY_ADMIN"]),
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
  getInterviewByIdController
);
interviewRoutes.put(
  "/:id",
  authMiddleware(["COMPANY_ADMIN"]),
  updateInterviewController
);
interviewRoutes.delete(
  "/:id",
  authMiddleware(["COMPANY_ADMIN"]),
  deleteInterviewController
);

export default interviewRoutes;
