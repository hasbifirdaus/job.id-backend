import { Response, Request } from "express";
import * as cityService from "./city.service";

export const createCity = async (req: Request, res: Response) => {
  try {
    const { name, province_id } = req.body;

    if (!name || !province_id) {
      res.status(400).json({ error: "City name and province_id are required" });
      return;
    }

    const city = await cityService.createCity(name, province_id);
    res.status(201).json(city);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllCities = async (_req: Request, res: Response) => {
  try {
    const cities = await cityService.getAllCities();
    res.status(200).json(cities);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getCitiesByProvince = async (req: Request, res: Response) => {
  try {
    const province_id = Number(req.params.province_id);
    const cities = await cityService.getCitiesByProvince(province_id);
    res.status(200).json(cities);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
