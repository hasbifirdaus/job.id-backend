import express from "express";
import { validate } from "../../../lib/middleware/validation.middleware";
import { discoverJobsQuerySchema, jobIdParamSchema } from "./job.validation";
import {
  getJobsDiscover,
  getJobById,
  getRelatedJobs,
  getAllCategories,
  getAllTags,
} from "./job.controller";

const userJobRoutes = express.Router();
userJobRoutes.get("/getAllCategories", getAllCategories);

userJobRoutes.get("/getAllTags", getAllTags);

userJobRoutes.get(
  "/discover",
  validate(discoverJobsQuerySchema, "query"),
  getJobsDiscover
);

userJobRoutes.get("/:id", validate(jobIdParamSchema, "params"), getJobById);

userJobRoutes.get(
  "/:id/related",
  validate(jobIdParamSchema, "params"),
  getRelatedJobs
);

export default userJobRoutes;
