import { Router } from "express";
import { createTest, getTest, submitAnswers } from "./preSelection.controller";
import { authMiddleware } from "../../lib/middleware/auth.middleware";

const preSelectionRoutes = Router();

preSelectionRoutes.post("/", authMiddleware(["COMPANY_ADMIN"]), createTest);
preSelectionRoutes.get("/:job_id", authMiddleware(), getTest);
preSelectionRoutes.post(
  "/submit",
  authMiddleware(["JOB_SEEKER"]),
  submitAnswers
);

export default preSelectionRoutes;
