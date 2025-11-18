import { Router } from "express";
import { validate } from "../../../lib/middleware/validation.middleware";
import { createCityBodySchema, provinceIdParamSchema } from "./city.validation";
import {
  createCity,
  getAllCities,
  getCitiesByProvince,
} from "./city.controller";

const cityRoutes = Router();

cityRoutes.post(
  // Ganti /createcity menjadi /
  "/",
  validate(createCityBodySchema, "body"),
  createCity
);

cityRoutes.get(
  // Ganti /getallcities menjadi /
  "/",
  getAllCities
);

cityRoutes.get(
  "/province/:province_id",
  validate(provinceIdParamSchema, "params"),
  getCitiesByProvince
);

export default cityRoutes;
