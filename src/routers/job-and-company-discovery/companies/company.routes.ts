import express from "express";
import { validate } from "../../../lib/middleware/validation.middleware";
import {
  discoverCompaniesQuerySchema,
  companyIdParamSchema,
} from "./company.validation";
import { getCompaniesDiscover, getCompanyById } from "./company.controller";

const companyRoutes = express.Router();

companyRoutes.get(
  "/discover",
  validate(discoverCompaniesQuerySchema, "query"),
  getCompaniesDiscover
);

companyRoutes.get(
  "/:id",
  validate(companyIdParamSchema, "params"),
  getCompanyById
);

export default companyRoutes;
