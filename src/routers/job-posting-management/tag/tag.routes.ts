import { Router } from "express";
import {
  getAllTags,
  getTagById,
  createTag,
  updateTag,
  deleteTag,
} from "./tag.controller";
import { authMiddleware } from "../../../lib/middleware/auth.middleware";
import { validate } from "../../../lib/middleware/validation.middleware";
import { tagBodySchema, tagIdParamSchema } from "./tag.validation";

const tagRoutes = Router();

tagRoutes.get("/getalltags", getAllTags);

tagRoutes.get("/:id", validate(tagIdParamSchema, "params"), getTagById);

tagRoutes.post(
  "/createtag",
  authMiddleware(["COMPANY_ADMIN"]),
  validate(tagBodySchema, "body"),
  createTag
);

tagRoutes.put(
  "/:id",
  authMiddleware(["COMPANY_ADMIN"]),
  validate(tagIdParamSchema, "params"),
  validate(tagBodySchema, "body"),
  updateTag
);

tagRoutes.delete(
  "/:id",
  authMiddleware(["COMPANY_ADMIN"]),
  validate(tagIdParamSchema, "params"),
  deleteTag
);

export default tagRoutes;
