import { Router } from "express";
import { authMiddleware } from "../../lib/middleware/auth.middleware";
import { validate } from "../../lib/middleware/validation.middleware";
import {
  getApplicantsByJob,
  getApplicationDetail,
  updateApplicationStatus,
} from "./applicant.controller";
import {
  getApplicantsByJobQuerySchema,
  applicationIdParamSchema,
  jobIdParamSchema,
  updateApplicationStatusBodySchema,
} from "./application.validation";

const applicantRoutes = Router();

// GET applicants by job
applicantRoutes.get(
  "/company/jobs/:jobId/applicants",
  authMiddleware(["COMPANY_ADMIN"]),
  validate(jobIdParamSchema, "params"), // Validasi jobId
  validate(getApplicantsByJobQuerySchema, "query"), // Validasi query params
  getApplicantsByJob
);

// GET application detail
applicantRoutes.get(
  "/company/applications/:id",
  authMiddleware(["COMPANY_ADMIN"]),
  validate(applicationIdParamSchema, "params"),
  getApplicationDetail
);

// PATCH update application status
applicantRoutes.patch(
  "/company/applications/:id/status",
  authMiddleware(["COMPANY_ADMIN"]),
  validate(applicationIdParamSchema, "params"),
  validate(updateApplicationStatusBodySchema, "body"),
  updateApplicationStatus
);

export default applicantRoutes;
