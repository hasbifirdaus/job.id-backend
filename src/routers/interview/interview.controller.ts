import { Request, Response } from "express";
import * as interviewService from "./interview.service";

export const createInterviewController = async (
  req: Request,
  res: Response
) => {
  try {
    const companyId = (req as any).user.company_id;
    const interview = await interviewService.createInterview(
      req.body,
      companyId
    );
    res
      .status(201)
      .json({ message: "Interview scheduled successfully", interview });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const getInterviewsController = async (req: Request, res: Response) => {
  try {
    const companyId = (req as any).user.company_id;
    const interviews = await interviewService.getInterviews(companyId);
    res.status(200).json(interviews);
  } catch (err: any) {
    res.status(400).json({ err: err.message });
  }
};

export const getInterviewByIdController = async (
  req: Request,
  res: Response
) => {
  try {
    const companyId = (req as any).user.company_id;
    const id = parseInt(req.params.id);
    const interview = await interviewService.getInterviwById(id, companyId);
    res.status(200).json(interview);
  } catch (err: any) {
    res.status(400).json({ err: err.message });
  }
};

export const updateInterviewController = async (
  req: Request,
  res: Response
) => {
  try {
    const comapanyId = (req as any).user.company_id;
    const id = parseInt(req.params.id);
    const interview = await interviewService.updateInterview(
      id,
      req.body,
      comapanyId
    );
    res
      .status(200)
      .json({ message: "Interview updated successfully", interview });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteInterviewController = async (
  req: Request,
  res: Response
) => {
  try {
    const companyId = (req as any).user.company_id;
    const id = parseInt(req.params.id);
    const result = await interviewService.deleteInterview(id, companyId);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
