import express from "express";
import {
  registerJobSeeker,
  registerCompanyAdmin,
  login,
  getMe,
} from "./auth.controller";
import { validate } from "../../lib/middleware/validation.middleware";
import {
  registerJobSeekerValidation,
  registerCompanyAdminValidation,
  loginValidation,
} from "./auth.validation";
import { verifyToken } from "../../lib/middleware/verifyToken";

const router = express.Router();

router.post(
  "/register/jobseeker",
  validate(registerJobSeekerValidation),
  registerJobSeeker
);
router.post(
  "/register/company",
  validate(registerCompanyAdminValidation),
  registerCompanyAdmin
);
router.post("/login", validate(loginValidation), login);

router.get("/me", verifyToken, getMe);

export default router;
