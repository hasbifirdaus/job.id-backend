import express from "express";
import { JobsController } from "./jobs.controller";
import {
  validateZod,
  createJobSchema,
  updateJobSchema,
} from "./jobs.validation";
import { authMiddleware } from "../../lib/middleware/auth.middleware";

const jobPostingRoutes = express.Router();

// CREATE JOB
jobPostingRoutes.post(
  "/",
  authMiddleware(["COMPANY_ADMIN"]),
  validateZod(createJobSchema),
  JobsController.createJob
);

// LIST JOBS
jobPostingRoutes.get(
  "/",
  authMiddleware(["COMPANY_ADMIN"]),
  JobsController.listJobs
);

// GET JOB DETAIL
jobPostingRoutes.get(
  "/:id",
  authMiddleware(["COMPANY_ADMIN"]),
  JobsController.getJobDetail
);

// UPDATE JOB
jobPostingRoutes.put(
  "/:id",
  authMiddleware(["COMPANY_ADMIN"]),
  validateZod(updateJobSchema),
  JobsController.updateJob
);

// PUBLISH / UNPUBLISH
jobPostingRoutes.patch(
  "/:id/publish",
  authMiddleware(["COMPANY_ADMIN"]),
  JobsController.publishToggle
);

// DELETE JOB
jobPostingRoutes.delete(
  "/:id",
  authMiddleware(["COMPANY_ADMIN"]),
  JobsController.deleteJob
);

export default jobPostingRoutes;
