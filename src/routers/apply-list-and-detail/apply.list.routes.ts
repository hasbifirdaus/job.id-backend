// src/modules/applications/applications.routes.ts
import { Router } from "express";
import {
  applyJob,
  getUserApplications,
  getApplicationDetail,
  withdrawApplication,
  listApplicationsForJob,
  updateApplicationStatus,
} from "./apply.list.controller";
import { authMiddleware } from "../../lib/middleware/auth.middleware";
import { validate } from "../../lib/middleware/validation.middleware";
import {
  applyJobSchema,
  applicationIdParamSchema,
  listApplicationsQuerySchema,
  updateApplicationStatusSchema,
} from "./apply.list.validation";
// optional: import upload middleware if you have one
// import { upload } from "../../lib/middleware/upload.middleware";

const applyListRoutes = Router();

// Applicant routes (requires JOB_SEEKER or any authenticated user)
applyListRoutes.post(
  "/",
  authMiddleware(), // any authenticated user
  // If you use file upload: upload.single("cv"),
  validate(applyJobSchema, "body" /*, { fileField: "cv" } */),
  applyJob
);

applyListRoutes.get(
  "/",
  authMiddleware(),
  validate(listApplicationsQuerySchema, "query"),
  getUserApplications
);

// detail (owner or company admin)
applyListRoutes.get(
  "/:id",
  authMiddleware(),
  validate(applicationIdParamSchema, "params"),
  getApplicationDetail
);

// withdraw (applicant)
applyListRoutes.delete(
  "/:id",
  authMiddleware(),
  validate(applicationIdParamSchema, "params"),
  withdrawApplication
);

// Company admin: list applications for a job
applyListRoutes.get(
  "/job/:jobId",
  authMiddleware(["COMPANY_ADMIN"]),
  validate(listApplicationsQuerySchema, "query"),
  listApplicationsForJob
);

// Company admin: update application status
applyListRoutes.patch(
  "/:id/status",
  authMiddleware(["COMPANY_ADMIN"]),
  validate(updateApplicationStatusSchema, "body"),
  validate(applicationIdParamSchema, "params"),
  updateApplicationStatus
);

export default applyListRoutes;
