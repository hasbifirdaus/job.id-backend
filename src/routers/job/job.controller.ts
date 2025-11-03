import { Request, Response } from "express";
import {
  ccreateJobService,
  getAllJobsService,
  getJobByIdService,
  updateJobService,
  deleteJobService,
} from "./job.service";

export const createJob = async (req: any, res: Response) => {
  try {
    const company_id = req.user.company_id;
    const job = await ccreateJobService(company_id, req.body);
    res.status(201).json({ message: "Job created successfully", job });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const getJobs = async (req: any, res: Response) => {
  try {
    const company_id = req.user.company_id;
    const jobs = await getAllJobsService(company_id);
    res.status(200).json(jobs);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const getJobById = async (req: any, res: Response) => {
  try {
    const company_id = req.user.company_id;
    const id = Number(req.params.id);
    const job = await getJobByIdService(id, company_id);
    res.status(200).json(job);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
};

export const updateJob = async (req: any, res: Response) => {
  try {
    const company_id = req.user.company_id;
    const id = Number(req.params.id);
    const updated = await updateJobService(id, company_id, req.body);
    res.status(200).json({ message: "Job updated successfully", updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteJob = async (req: any, res: Response) => {
  try {
    const company_id = req.user.company_id;
    const id = Number(req.params.id);
    await deleteJobService(id, company_id);
    res.status(200).json({ message: "Job deleted successfully" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
