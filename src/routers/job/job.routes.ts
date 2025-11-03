import { Router } from "express";
import {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
} from "./job.controller";
import { authMiddleware } from "../../lib/middleware/auth.middleware";

const jobRoutes = Router();

jobRoutes.post("/createjob", authMiddleware(["COMPANY_ADMIN"]), createJob);
jobRoutes.get("/getJobs", authMiddleware(["COMPANY_ADMIN"]), getJobs);
jobRoutes.get("/:id", authMiddleware(["COMPANY_ADMIN"]), getJobById);
jobRoutes.put("/:id", authMiddleware(["COMPANY_ADMIN"]), updateJob);
jobRoutes.delete("/deleteJob", authMiddleware(["COMPANY_ADMIN"]), deleteJob);

export default jobRoutes;
