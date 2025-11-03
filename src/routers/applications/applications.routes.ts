import { Router } from "express";
import {
  applyJob,
  getUserApplications,
  getApplicationDetail,
} from "./applications.controller";
import { authMiddleware } from "../../lib/middleware/auth.middleware";
import { upload } from "../../lib/middleware/upload.middleware";

const applicationsRoutes = Router();

applicationsRoutes.post("/", authMiddleware(), upload.single("cv"), applyJob);
applicationsRoutes.get(
  "/my-applications",
  authMiddleware(),
  getUserApplications
);
applicationsRoutes.get(
  "/my-applications/:applicationId",
  authMiddleware(),
  getApplicationDetail
);

export default applicationsRoutes;
