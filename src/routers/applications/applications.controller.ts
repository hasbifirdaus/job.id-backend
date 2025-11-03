import { Request, Response } from "express";
import * as applicationsService from "./applications.service";

export const applyJob = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const { job_id, cover_letter, expected_salary } = req.body;

    const cv_url = req.file?.path || null;
    if (!cv_url) throw new Error("CV file is required");

    const result = await applicationsService.applyJob(userId, {
      job_id,
      cv_url,
      cover_letter,
      expected_salary,
    });
    res.status(201).json({
      message: "Application submitted successfully",
      application: result,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const getUserApplications = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const result = await applicationsService.getUserApplications(userId);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const getApplicationDetail = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const applicationId = parseInt(req.params.applicationId);
    const result = await applicationsService.getApplicationDetail(
      userId,
      applicationId
    );
    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
