// src/modules/applications/applications.controller.ts
import { Request, Response } from "express";
import * as service from "./apply.list.service";
import { AuthenticatedRequest } from "../../lib/middleware/auth.middleware";

export const applyJob = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const { job_id, expected_salary, cover_letter, extra_info } = (req as any)
      .body;
    // if upload middleware provided file path: req.file.path or file url provided in body
    const cvFileUrl =
      (req as any).file?.path ?? (req as any).body?.cv_file_url ?? null;

    const app = await service.applyJobService(user.id, {
      job_id: Number(job_id),
      expected_salary: expected_salary,
      cover_letter,
      extra_info: extra_info ? JSON.parse(extra_info) : undefined,
      cv_file_url: cvFileUrl,
    });

    res.status(201).json(app);
  } catch (err: any) {
    console.error("applyJob error:", err);
    res.status(400).json({ error: err.message || "Failed to apply" });
  }
};

export const getUserApplications = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const user = req.user!;
    const q = (req as any).validatedQuery ?? req.query;
    const page = Number(q.page || 1);
    const limit = Number(q.limit || 20);
    const status = q.status ?? null;

    const result = await service.getUserApplicationsService(user.id, {
      page,
      limit,
      status,
    });
    res.json(result);
  } catch (err: any) {
    console.error("getUserApplications error:", err);
    res
      .status(400)
      .json({ error: err.message || "Failed to fetch applications" });
  }
};

export const getApplicationDetail = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const user = req.user!;
    const id = Number(req.params.id);
    const app = await service.getApplicationByIdService(user, id);
    res.json(app);
  } catch (err: any) {
    console.error("getApplicationDetail error:", err);
    const status = err.message === "Forbidden" ? 403 : 400;
    res
      .status(status)
      .json({ error: err.message || "Failed to get application detail" });
  }
};

export const withdrawApplication = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const user = req.user!;
    const id = Number(req.params.id);
    const result = await service.withdrawApplicationService(user.id, id);
    res.json(result);
  } catch (err: any) {
    console.error("withdrawApplication error:", err);
    const status = err.message === "Forbidden" ? 403 : 400;
    res
      .status(status)
      .json({ error: err.message || "Failed to withdraw application" });
  }
};

// Company admin endpoints
export const listApplicationsForJob = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const user = req.user!;
    const companyId = user.company_id!;
    const jobId = Number(req.params.jobId);
    const q = (req as any).validatedQuery ?? req.query;
    const page = Number(q.page || 1);
    const limit = Number(q.limit || 20);
    const status = q.status ?? null;

    const result = await service.listApplicationsForJobService(
      companyId,
      jobId,
      { page, limit, status }
    );
    res.json(result);
  } catch (err: any) {
    console.error("listApplicationsForJob error:", err);
    res
      .status(400)
      .json({ error: err.message || "Failed to list applications" });
  }
};

export const updateApplicationStatus = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const user = req.user!;
    const companyId = user.company_id!;
    const applicationId = Number(req.params.id);
    const { status, feedback, rejectedReason } = (req as any).body;

    const updated = await service.updateApplicationStatusService(
      companyId,
      applicationId,
      {
        status,
        feedback,
        changedBy: user.id,
        rejectedReason,
      }
    );

    res.json(updated);
  } catch (err: any) {
    console.error("updateApplicationStatus error:", err);
    const statusCode = err.message === "Forbidden" ? 403 : 400;
    res
      .status(statusCode)
      .json({ error: err.message || "Failed to update status" });
  }
};
