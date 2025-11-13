import { Request, Response } from "express";
import * as provinceService from "./province.service";

export const creatProvince = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name } = req.body;
    if (!name) {
      res.status(400).json({ error: "Province name is required" });
      return;
    }
    const province = await provinceService.createProvince(name);
    res.status(201).json(province);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllProvince = async (_req: Request, res: Response) => {
  try {
    const provinces = await provinceService.getAllProvinces();
    res.status(200).json(provinces);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
