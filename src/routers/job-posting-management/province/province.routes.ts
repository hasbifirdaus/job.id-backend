import { Router } from "express";
import { creatProvince, getAllProvince } from "./province.controller";

const provinceRoutes = Router();

provinceRoutes.post("/createprovince", creatProvince);
provinceRoutes.get("/getallprovince", getAllProvince);

export default provinceRoutes;
