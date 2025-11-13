import express from "express";
import {
  registerJobSeeker,
  registerCompanyAdmin,
  login,
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

router.get("/me", verifyToken, async (req, res) => {
  const user = (req as any).user;
  res.status(200).json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

export default router;
