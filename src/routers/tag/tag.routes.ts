import { Router } from "express";
import {
  getAllTags,
  getTagById,
  createTag,
  updateTag,
  deleteTag,
} from "./tag.controller";
import { authMiddleware } from "../../lib/middleware/auth.middleware";

const tagRoutes = Router();

tagRoutes.get("/getalltags", getAllTags);
tagRoutes.get("/:id", getTagById);

tagRoutes.post("/createtag", authMiddleware(["COMPANY_ADMIN"]), createTag);
tagRoutes.put("/:id", authMiddleware(["COMPANY_ADMIN"]), updateTag);
tagRoutes.delete("/:id", authMiddleware(["COMPANY_ADMIN"]), deleteTag);

export default tagRoutes;
