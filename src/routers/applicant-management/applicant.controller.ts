import { Request, Response } from "express";
import {
  findApplicantsByJob,
  findApplicationDetail,
  changeApplicationStatus,
} from "./applicant.service";

export const getApplicantsByJob = async (req: Request, res: Response) => {
  try {
    const jobId = Number(req.params.jobId);
    const { name, minAge, maxAge, education, expected_salary } = req.query;

    const applicants = await findApplicantsByJob(
      jobId,
      name as string,
      minAge ? Number(minAge) : undefined,
      maxAge ? Number(maxAge) : undefined,
      education as string,
      expected_salary ? Number(expected_salary) : undefined
    );

    res.json({
      message: "Applicants fetched successfully",
      applicants,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getApplicationDetail = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const application = await findApplicationDetail(id);

    if (!application) {
      res.status(404).json({ error: "Application not found" });
      return;
    }

    res.json({
      message: "Application detail fetched successfully",
      application,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateApplicationStatus = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { status, notes } = req.body;
    const adminId = (req as any).user.id;

    const updated = await changeApplicationStatus(id, status, adminId, notes);

    res.json({
      message: "Application status updated successfully",
      application: updated,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
