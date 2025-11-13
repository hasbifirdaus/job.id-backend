import { Router } from "express";
import {
  createCity,
  getAllCities,
  getCitiesByProvince,
} from "./city.controller";

const cityRoutes = Router();

cityRoutes.post("/createcity", createCity);
cityRoutes.get("/getallcities", getAllCities);
cityRoutes.get("/province/:province_id", getCitiesByProvince);

export default cityRoutes;
