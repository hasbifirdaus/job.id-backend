import { Router } from "express";
import { authMiddleware } from "../../lib/middleware/auth.middleware";
import {
  getApplicantsByJob,
  getApplicationDetail,
  updateApplicationStatus,
} from "./applicant.controller";

const applicantRoutes = Router();

applicantRoutes.get(
  "/company/jobs/:jobId/applicants",
  authMiddleware(["COMPANY_ADMIN"]),
  getApplicantsByJob
);

applicantRoutes.get(
  "/company/applications/:id",
  authMiddleware(["COMPANY_ADMIN"]),
  getApplicationDetail
);

applicantRoutes.patch(
  "/company/applications/:id/status",
  authMiddleware(["COMPANY_ADMIN"]),
  updateApplicationStatus
);

export default applicantRoutes;
