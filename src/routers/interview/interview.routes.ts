// modules/interview/interview.routes.ts
import { Router } from "express";
import * as controller from "./interview.controller";
import { authMiddleware } from "../../lib/middleware/auth.middleware";
import { validate } from "../../lib/middleware/validation.middleware";
import {
  createInterviewSchema,
  createBulkInterviewSchema,
  interviewIdParamSchema,
  updateInterviewSchema,
} from "./interview.validation";

const router = Router();

router.post(
  "/",
  authMiddleware(["COMPANY_ADMIN"]),
  validate(createInterviewSchema, "body"),
  controller.createInterviewController
);
router.post(
  "/bulk",
  authMiddleware(["COMPANY_ADMIN"]),
  validate(createBulkInterviewSchema, "body"),
  controller.createBulkInterviewsController
);
router.get(
  "/",
  authMiddleware(["COMPANY_ADMIN"]),
  controller.getInterviewsController
);
router.get(
  "/:id",
  authMiddleware(["COMPANY_ADMIN"]),
  validate(interviewIdParamSchema, "params"),
  controller.getInterviewByIdController
);
router.put(
  "/:id",
  authMiddleware(["COMPANY_ADMIN"]),
  validate(interviewIdParamSchema, "params"),
  validate(updateInterviewSchema, "body"),
  controller.updateInterviewController
);
router.delete(
  "/:id",
  authMiddleware(["COMPANY_ADMIN"]),
  validate(interviewIdParamSchema, "params"),
  controller.deleteInterviewController
);

router.post(
  "/:id/send-reminder",
  authMiddleware(["COMPANY_ADMIN"]),
  validate(interviewIdParamSchema, "params"),
  controller.sendReminderByIdController
);

export default router;
