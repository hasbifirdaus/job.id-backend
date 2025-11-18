import { Router } from "express";
import {
  applyJob,
  getUserApplications,
  getApplicationDetail,
} from "./applications.controller";
import { authMiddleware } from "../../lib/middleware/auth.middleware";
import { upload } from "../../lib/middleware/upload.middleware";
import { validate } from "../../lib/middleware/validation.middleware";
import {
  applyJobBodySchema,
  applicationIdParamSchema,
} from "./applications.validation";

const applicationsRoutes = Router();

applicationsRoutes.post(
  "/",
  authMiddleware(),
  upload.single("cv"),
  validate(applyJobBodySchema, "body", { fileField: "cv" }),
  applyJob
);

applicationsRoutes.get(
  "/my-applications",
  authMiddleware(),
  getUserApplications
);

applicationsRoutes.get(
  "/my-applications/:applicationId",
  authMiddleware(),
  validate(applicationIdParamSchema, "params"),
  getApplicationDetail
);

export default applicationsRoutes;
