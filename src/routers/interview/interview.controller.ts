// modules/interview/interview.controller.ts
import { Request, Response } from "express";
import * as service from "./interview.service";

export const createInterviewController = async (
  req: Request,
  res: Response
) => {
  try {
    const companyId = (req as any).user.company_id;
    const interview = await service.createInterview(req.body, companyId);
    res.status(201).json({ success: true, data: interview });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
};

export const createBulkInterviewsController = async (
  req: Request,
  res: Response
) => {
  try {
    const companyId = (req as any).user.company_id;
    const created = await service.createBulkInterviews(req.body, companyId);
    res.status(201).json({ success: true, data: created });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
};

export const getInterviewsController = async (req: Request, res: Response) => {
  try {
    const companyId = (req as any).user.company_id;
    const interviews = await service.getInterviews(companyId);
    res.status(200).json({ success: true, data: interviews });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
};

export const getInterviewByIdController = async (
  req: Request,
  res: Response
) => {
  try {
    const companyId = (req as any).user.company_id;
    const id = parseInt(req.params.id);
    const interview = await service.getInterviewById(id, companyId);
    res.status(200).json({ success: true, data: interview });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
};

export const updateInterviewController = async (
  req: Request,
  res: Response
) => {
  try {
    const companyId = (req as any).user.company_id;
    const id = parseInt(req.params.id);
    const updated = await service.updateInterview(id, req.body, companyId);
    res.status(200).json({ success: true, data: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
};

export const deleteInterviewController = async (
  req: Request,
  res: Response
) => {
  try {
    const companyId = (req as any).user.company_id;
    const id = parseInt(req.params.id);
    const result = await service.deleteInterview(id, companyId);
    res.status(200).json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
};

export const sendReminderByIdController = async (
  req: Request,
  res: Response
) => {
  try {
    const interviewId = Number(req.params.id);
    const companyId = (req as any).user.company_id;

    await service.sendReminderById(interviewId, companyId);

    res.status(200).json({
      message: "Reminder sent successfully",
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};
