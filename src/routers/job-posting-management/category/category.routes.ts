import { Router } from "express";
import { createCategory, getAllCategories } from "./category.controller";

const categoryRoutes = Router();

categoryRoutes.post("/createcategory", createCategory);
categoryRoutes.get("/getallcategories", getAllCategories);

export default categoryRoutes;
