import express from "express";
import { getCompaniesDiscover, getCompanyById } from "./company.controller";

const companyRoutes = express.Router();

companyRoutes.get("/discover", getCompaniesDiscover);
companyRoutes.get("/:id", getCompanyById);

export default companyRoutes;
