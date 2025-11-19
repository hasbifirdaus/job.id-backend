import { Router } from "express";
import { preSelectionTestController } from "./preSelectionTest.controller";
import {
  createOrUpdateTestSchema,
  updateQuestionSchema,
  submitAnswerSchema,
} from "./preSelectionTest.validation";
import { authMiddleware } from "../../lib/middleware/auth.middleware";
import { validate } from "../../lib/middleware/validation.middleware";
import { UserRole } from "../../generated/prisma";
import { asyncHandler } from "../../lib/middleware/asyncHandler";

const preSelectionTestRoutes = Router();
const ADMIN = [UserRole.COMPANY_ADMIN];
const SEEKER = [UserRole.JOB_SEEKER];

preSelectionTestRoutes
  .route("/:jobId/test")
  .get(
    authMiddleware(ADMIN),
    asyncHandler(preSelectionTestController.getTestConfig)
  )
  .post(
    authMiddleware(ADMIN),
    validate(createOrUpdateTestSchema),
    asyncHandler(preSelectionTestController.createOrUpdateTest)
  );

preSelectionTestRoutes.patch(
  "/:jobId/test/status/disable",
  authMiddleware(ADMIN),
  asyncHandler(preSelectionTestController.disableTest)
);

preSelectionTestRoutes.get(
  "/:jobId/test/results",
  authMiddleware(ADMIN),
  asyncHandler(preSelectionTestController.getTestResults)
);

preSelectionTestRoutes.get(
  "/:jobId/test/applicant",
  authMiddleware(SEEKER),
  asyncHandler(preSelectionTestController.getTestForApplicant)
);

preSelectionTestRoutes.post(
  "/:jobId/test/submit",
  authMiddleware(SEEKER),
  validate(submitAnswerSchema),
  asyncHandler(preSelectionTestController.submitTest)
);

preSelectionTestRoutes.delete(
  "/:jobId/test/:questionId",
  authMiddleware(ADMIN),
  asyncHandler(preSelectionTestController.deleteQuestion)
);

preSelectionTestRoutes.patch(
  "/:jobId/test/:questionId",
  authMiddleware(ADMIN),
  validate(updateQuestionSchema),
  asyncHandler(preSelectionTestController.updateSingleQuestion)
);

export default preSelectionTestRoutes;
