import express from "express";
import { getJobsDiscover, getJobById, getRelatedJobs } from "./job.controller";

const userJobRoutes = express.Router();

userJobRoutes.get("/discover", getJobsDiscover);
userJobRoutes.get("/:id", getJobById);
userJobRoutes.get("/:id/related", getRelatedJobs);

export default userJobRoutes;
