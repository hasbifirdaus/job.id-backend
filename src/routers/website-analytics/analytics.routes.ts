import { Router } from "express";
import {
  getDemographicsController,
  getSalaryTrendsController,
  getApplicantInterestsController,
  getAnalyticsSummaryController,
  getOtherAnalyticsController,
} from "./analytics.controller";
import { authMiddleware } from "../../lib/middleware/auth.middleware";

const analyticsRoutes = Router();

analyticsRoutes.get(
  "/demographics",
  authMiddleware(["COMPANY_ADMIN"]),
  getDemographicsController
);
analyticsRoutes.get(
  "/salary-trends",
  authMiddleware(["COMPANY_ADMIN"]),
  getSalaryTrendsController
);
analyticsRoutes.get(
  "/interests",
  authMiddleware(["COMPANY_ADMIN"]),
  getApplicantInterestsController
);
analyticsRoutes.get(
  "/summary",
  authMiddleware(["COMPANY_ADMIN"]),
  getAnalyticsSummaryController
);

analyticsRoutes.get(
  "/others",
  authMiddleware(["COMPANY_ADMIN"]),
  getOtherAnalyticsController
);

export default analyticsRoutes;
