import { Router } from "express";
import { createCategory, getAllCategories } from "./category.controller";
import { validate } from "../../../lib/middleware/validation.middleware";
import { createCategoryBodySchema } from "./category.validation";

const categoryRoutes = Router();

categoryRoutes.post(
  // Ganti /createcategory menjadi /
  "/",
  validate(createCategoryBodySchema, "body"),
  createCategory
);

categoryRoutes.get(
  // Ganti /getallcategories menjadi /
  "/",
  getAllCategories
);

export default categoryRoutes;
