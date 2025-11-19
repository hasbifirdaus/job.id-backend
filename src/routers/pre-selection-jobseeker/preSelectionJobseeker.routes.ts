import { Router } from "express";
import {
  getTestForJobseekerController,
  submitPreSelectionTestController,
  savePreSelectionProgressController,
  getPreSelectionResultController,
} from "./preSelectionJobseeker.controller";
import { authMiddleware } from "../../lib/middleware/auth.middleware";

const router = Router();

router.get(
  "/job/:jobId",
  authMiddleware(["JOB_SEEKER"]),
  getTestForJobseekerController
);
router.post(
  "/submit/:applicationId",
  authMiddleware(["JOB_SEEKER"]),
  submitPreSelectionTestController
);

router.patch(
  "/progress/:applicationId",
  authMiddleware(["JOB_SEEKER"]),
  savePreSelectionProgressController
);
router.get(
  "/result/:applicationId",
  authMiddleware(),
  getPreSelectionResultController
);

export default router;
