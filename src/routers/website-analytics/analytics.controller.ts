import { Request, Response } from "express";
import * as analyticsService from "./analytics.service";
import { AuthenticatedRequest } from "../../lib/middleware/auth.middleware";

export const getAnalytics = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const companyId = req.user?.company_id;
    if (!companyId) {
      res.status(403).json({ error: "Company ID not found" });
      return; // jangan return res, cukup return void
    }

    const kpiData = await analyticsService.getKpiData(companyId);
    const applicantFlow = await analyticsService.getApplicantFlow(companyId);
    const funnelData = await analyticsService.getFunnelData(companyId);
    const topCategories = await analyticsService.getTopCategories(companyId);
    const demographics = await analyticsService.getDemographics(companyId);
    const salaryTrends = await analyticsService.getSalaryTrends(companyId);

    res.json({
      kpiData,
      applicantFlow,
      funnelData,
      topCategories,
      demographics,
      salaryTrends,
    });
  } catch (err: any) {
    console.error("Analytics Controller Error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getKpiAnalytics = async (req: Request, res: Response) => {
  try {
    const companyId = Number(req.params.companyId);
    const data = await analyticsService.getKpiData(companyId);
    res.json(data);
  } catch (err: any) {
    console.error("KPI Analytics Error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Applicant Flow
export const getApplicantFlowAnalytics = async (
  req: Request,
  res: Response
) => {
  try {
    const companyId = Number(req.params.companyId);
    const data = await analyticsService.getApplicantFlow(companyId);
    res.json(data);
  } catch (err: any) {
    console.error("Applicant Flow Analytics Error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Funnel
export const getFunnelAnalytics = async (req: Request, res: Response) => {
  try {
    const companyId = Number(req.params.companyId);
    const data = await analyticsService.getFunnelData(companyId);
    res.json(data);
  } catch (err: any) {
    console.error("Funnel Analytics Error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Top Categories
export const getTopCategoriesAnalytics = async (
  req: Request,
  res: Response
) => {
  try {
    const companyId = Number(req.params.companyId);
    const data = await analyticsService.getTopCategories(companyId);
    res.json(data);
  } catch (err: any) {
    console.error("Top Categories Analytics Error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Demographics
export const getDemographicsAnalytics = async (req: Request, res: Response) => {
  try {
    const companyId = Number(req.params.companyId);
    const data = await analyticsService.getDemographics(companyId);
    res.json(data);
  } catch (err: any) {
    console.error("Demographics Analytics Error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Salary Trends
export const getSalaryTrendsAnalytics = async (req: Request, res: Response) => {
  try {
    const companyId = Number(req.params.companyId);
    const data = await analyticsService.getSalaryTrends(companyId);
    res.json(data);
  } catch (err: any) {
    console.error("Salary Trends Analytics Error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
