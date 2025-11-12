import { Request, Response } from "express";
import * as tagService from "./tag.service";

export const getAllTags = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const tags = await tagService.getAlltags();
    res.json(tags);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getTagById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const tag = await tagService.getTagById(id);
    if (!tag) {
      res.status(404).json({ error: "Tag not found" });
      return;
    }
    res.json(tag);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createTag = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.body;
    if (!name) {
      res.status(400).json({ error: "Name is required" });
      return;
    }

    const newTag = await tagService.createTag(name);
    res.status(201).json(newTag);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const updateTag = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const { name } = req.body;
    if (!name) {
      res.status(400).json({ error: "Name is required" });
      return;
    }

    const updated = await tagService.updateTag(id, name);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteTag = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    await tagService.deleteTag(id);
    res.json({ message: "Tag deleted successfully" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
