import { Request, Response } from "express";
import {
  registerJobSeekerService,
  registerCompanyAdminService,
  loginService,
} from "./auth.service";

export const registerJobSeeker = async (req: Request, res: Response) => {
  try {
    const result = await registerJobSeekerService(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const registerCompanyAdmin = async (req: Request, res: Response) => {
  try {
    const result = await registerCompanyAdminService(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const result = await loginService(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
