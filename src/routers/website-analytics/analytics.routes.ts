import express from "express";
import {
  getAnalytics,
  getKpiAnalytics,
  getApplicantFlowAnalytics,
  getFunnelAnalytics,
  getTopCategoriesAnalytics,
  getDemographicsAnalytics,
  getSalaryTrendsAnalytics,
} from "./analytics.controller";
import { authMiddleware } from "../../lib/middleware/auth.middleware";

const analyticsRoutes = express.Router();

// Hanya COMPANY_ADMIN yang bisa akses
analyticsRoutes.get("/", authMiddleware(["COMPANY_ADMIN"]), getAnalytics);
analyticsRoutes.get(
  "/kpi/:companyId",
  authMiddleware(["COMPANY_ADMIN"]),
  getKpiAnalytics
);
analyticsRoutes.get(
  "/applicant-flow/:companyId",
  authMiddleware(["COMPANY_ADMIN"]),
  getApplicantFlowAnalytics
);
analyticsRoutes.get(
  "/funnel/:companyId",
  authMiddleware(["COMPANY_ADMIN"]),
  getFunnelAnalytics
);
analyticsRoutes.get(
  "/top-categories/:companyId",
  authMiddleware(["COMPANY_ADMIN"]),
  getTopCategoriesAnalytics
);
analyticsRoutes.get(
  "/demographics/:companyId",
  authMiddleware(["COMPANY_ADMIN"]),
  getDemographicsAnalytics
);
analyticsRoutes.get(
  "/salary-trends/:companyId",
  authMiddleware(["COMPANY_ADMIN"]),
  getSalaryTrendsAnalytics
);

export default analyticsRoutes;
