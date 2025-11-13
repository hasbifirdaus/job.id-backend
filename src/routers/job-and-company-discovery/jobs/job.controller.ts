import { Request, Response } from "express";
import {
  getJobsDiscoverService,
  getJobByIdService,
  getRelatedJobsService,
} from "./job.service";

export const getJobsDiscover = async (req: Request, res: Response) => {
  try {
    const result = await getJobsDiscoverService(req.query);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getJobById = async (req: Request, res: Response) => {
  try {
    const result = await getJobByIdService(Number(req.params.id));
    res.json(result);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const getRelatedJobs = async (req: Request, res: Response) => {
  try {
    const result = await getRelatedJobsService(Number(req.params.id));
    res.json(result);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};
