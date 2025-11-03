import { Request, Response } from "express";
import * as analyticsService from "./analytics.service";

export const getDemographicsController = async (
  req: Request,
  res: Response
) => {
  try {
    const data = await analyticsService.getUserDemographics();
    res
      .status(200)
      .json({ message: "User demographics fetched successfully", data });
  } catch (error: any) {
    res.status(400).json({
      message: "Failed to fetch user demographics",
      error: error.message,
    });
  }
};

export const getSalaryTrendsController = async (
  req: Request,
  res: Response
) => {
  try {
    const data = await analyticsService.getSalaryTrends();
    res
      .status(200)
      .json({ message: "Salary trends fetched successfully", data });
  } catch (error: any) {
    res
      .status(400)
      .json({ message: "Failed to fetch salary trends", error: error.message });
  }
};

export const getApplicantInterestsController = async (
  req: Request,
  res: Response
) => {
  try {
    const data = await analyticsService.getApplicantInterests();
    res
      .status(200)
      .json({ message: "Applicant interests fetched successfully", data });
  } catch (error: any) {
    res.status(400).json({
      message: "Failed to fetch applicant interests",
      error: error.message,
    });
  }
};

export const getAnalyticsSummaryController = async (
  req: Request,
  res: Response
) => {
  try {
    const data = await analyticsService.getAnalyticsSummary();
    res
      .status(200)
      .json({ message: "Analytics summary fetched successfully", data });
  } catch (error: any) {
    res.status(400).json({
      message: "Failed to fetch analytics summary",
      error: error.message,
    });
  }
};

export const getOtherAnalyticsController = async (
  req: Request,
  res: Response
) => {
  try {
    const data = await analyticsService.getOtherAnalytics();
    res.status(200).json({
      message: "Other analytics fetched successfully",
      data,
    });
  } catch (err: any) {
    res.status(400).json({
      message: "Failed to fetch other analytics",
      error: err.message,
    });
  }
};
