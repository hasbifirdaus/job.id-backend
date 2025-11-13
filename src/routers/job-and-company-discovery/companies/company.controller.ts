import { Request, Response } from "express";
import {
  getCompaniesDiscoverService,
  getCompanyByIdService,
} from "./company.service";

export const getCompaniesDiscover = async (req: Request, res: Response) => {
  try {
    const result = await getCompaniesDiscoverService(req.query);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getCompanyById = async (req: Request, res: Response) => {
  try {
    const result = await getCompanyByIdService(Number(req.params.id));
    res.json(result);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};
