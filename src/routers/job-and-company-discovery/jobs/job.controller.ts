import { Request, Response } from "express";
import {
  getJobsDiscoverService,
  getJobByIdService,
  getRelatedJobsService,
  getAllCategoriesService,
  getAllTagsService,
} from "./job.service";

export const getJobsDiscover = async (req: Request, res: Response) => {
  try {
    const result = await getJobsDiscoverService(req.query);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getJobById = async (req: Request, res: Response) => {
  try {
    const result = await getJobByIdService(Number(req.params.id));
    res.json(result);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const getRelatedJobs = async (req: Request, res: Response) => {
  try {
    const result = await getRelatedJobsService(Number(req.params.id));
    res.json(result);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

// Controller untuk mendapatkan daftar semua Kategori
export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const categories = await getAllCategoriesService();
    // Mengembalikan data dalam format { data: [...] }
    res.json({ data: categories });
  } catch (error: any) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
};

// Controller untuk mendapatkan daftar semua Tags
export const getAllTags = async (req: Request, res: Response) => {
  try {
    const tags = await getAllTagsService();
    // Mengembalikan data dalam format { data: [...] }
    res.json({ data: tags });
  } catch (error: any) {
    console.error("Error fetching tags:", error);
    res.status(500).json({ error: "Failed to fetch tags" });
  }
};
