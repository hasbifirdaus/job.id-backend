import { Router } from "express";
import { validate } from "../../../lib/middleware/validation.middleware";
import { createProvinceBodySchema } from "./province.validation";
import { creatProvince, getAllProvince } from "./province.controller";

const provinceRoutes = Router();

provinceRoutes.post(
  "/createprovince",
  validate(createProvinceBodySchema, "body"),
  creatProvince
);

provinceRoutes.get("/getallprovince", getAllProvince);

export default provinceRoutes;
