import { Request, Response } from "express";
import * as applicationsService from "./applications.service";

export const applyJob = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;

    const {
      job_id,
      expected_salary,
      coverLetter,
      fullName,
      email,
      phone,
      linkedin,
      experienceSummary,
    } = req.body;

    const cvFile = req.files?.cv?.[0];
    const coverLetterFile = req.files?.coverLetterFile?.[0];

    if (!cvFile) {
      res.status(400).json({ error: "CV is required" });
      return;
    }

    const result = await applicationsService.applyJob(userId, {
      job_id,
      expected_salary,
      cv_url: cvFile.path,
      cover_letter: coverLetter,
      cover_letter_file_url: coverLetterFile?.path || null,
      extra_info: {
        fullName,
        email,
        phone,
        linkedin,
        experienceSummary,
      },
    });

    res.json({
      message: "Application submitted",
      application: result,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const getUserApplications = async (
  req: any,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user.id;
    const result = await applicationsService.getUserApplications(userId);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const getApplicationDetail = async (
  req: any,
  res: Response
): Promise<void> => {
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
