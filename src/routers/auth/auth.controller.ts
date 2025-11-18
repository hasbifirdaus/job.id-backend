import { Request, Response } from "express";
import {
  registerJobSeekerService,
  registerCompanyAdminService,
  loginService,
  getMeService,
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

export const getMe = async (req: Request, res: Response) => {
  try {
    // user.id didapatkan dari hasil dekode JWT oleh middleware verifyToken
    const userId = (req as any).user.id;
    const user = await getMeService(userId);
    res.status(200).json({ user });
  } catch (error: any) {
    // Jika user tidak ditemukan, kirim status 404/401 dan hapus token
    res.status(401).json({ message: "Unauthorized or User not found" });
  }
};
