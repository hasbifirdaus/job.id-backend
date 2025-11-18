import { Router } from "express";
import { validate } from "../../../lib/middleware/validation.middleware";
import {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
} from "./job.controller";
import { authMiddleware } from "../../../lib/middleware/auth.middleware";
import {
  createJobBodySchema,
  updateJobBodySchema,
  jobIdParamSchema,
} from "./job.validation";

const jobRoutes = Router();

jobRoutes.post(
  "/createjob",
  authMiddleware(["COMPANY_ADMIN"]),
  validate(createJobBodySchema, "body"),
  createJob
);

jobRoutes.get("/getJobs", authMiddleware(["COMPANY_ADMIN"]), getJobs);

jobRoutes.get(
  "/:id",
  authMiddleware(["COMPANY_ADMIN"]),
  validate(jobIdParamSchema, "params"),
  getJobById
);

jobRoutes.put(
  "/:id",
  authMiddleware(["COMPANY_ADMIN"]),
  validate(jobIdParamSchema, "params"),
  validate(updateJobBodySchema, "body"),
  updateJob
);

jobRoutes.delete(
  "/deleteJob",
  authMiddleware(["COMPANY_ADMIN"]),
  validate(jobIdParamSchema, "body"),
  deleteJob
);

export default jobRoutes;
