import { Request, Response } from "express";
import { JobsService } from "./jobs.service";

export const JobsController = {
  async createJob(req: Request, res: Response): Promise<void> {
    try {
      const company_id = (req as any).user?.company_id;
      if (!company_id) {
        res.status(403).json({ message: "Anda bukan company admin" });
        return;
      }

      const job = await JobsService.createJob({
        ...(req.body || {}),
        company_id,
      });

      res.status(201).json({ message: "Job created", data: job });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ message: err.message || "Server error" });
    }
  },

  async listJobs(req: Request, res: Response): Promise<void> {
    try {
      const company_id = (req as any).user?.company_id;
      if (!company_id) {
        res.status(403).json({ message: "Anda bukan company admin" });
        return;
      }

      const q = req.query.q as string | undefined;
      let category_id: number | undefined = undefined;
      if (req.query.category_id) {
        const parsedId = Number(req.query.category_id);
        // Pastikan ID adalah angka, bilangan bulat, dan positif.
        if (!isNaN(parsedId) && Number.isInteger(parsedId) && parsedId > 0) {
          category_id = parsedId;
        }
      }

      let is_published: boolean | undefined = undefined;
      if (req.query.is_published !== undefined) {
        const raw = req.query.is_published;
        is_published =
          raw === "true" || raw === "1"
            ? true
            : raw === "false" || raw === "0"
              ? false
              : undefined;
      }

      const validSortBy = ["created_at", "title", "deadline"];
      const validSortDir = ["asc", "desc"];

      const sortBy = validSortBy.includes(req.query.sortBy as string)
        ? (req.query.sortBy as "created_at" | "title" | "deadline")
        : "created_at";

      const sortDir = validSortDir.includes(req.query.sortDir as string)
        ? (req.query.sortDir as "asc" | "desc")
        : "desc";

      const page = req.query.page ? Number(req.query.page) : 1;
      const perPage = req.query.perPage ? Number(req.query.perPage) : 20;

      const result = await JobsService.getJobList({
        company_id,
        q,
        category_id,
        is_published,
        sortBy,
        sortDir,
        page,
        perPage,
      });

      res.json(result);
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ message: err.message || "Server error" });
    }
  },

  async getJobDetail(req: Request, res: Response): Promise<void> {
    try {
      const job_id = Number(req.params.id);
      const company_id = (req as any).user?.company_id;

      const job = await JobsService.getJobById(job_id, company_id);
      if (!job) {
        res.status(404).json({ message: "Job not found" });
        return;
      }

      res.json({ data: job });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ message: err.message || "Server error" });
    }
  },

  async updateJob(req: Request, res: Response): Promise<void> {
    try {
      const job_id = Number(req.params.id);
      const company_id = (req as any).user?.company_id;

      if (!company_id) {
        res.status(403).json({ message: "Anda bukan company admin" });
        return;
      }

      const updated = await JobsService.updateJob(job_id, company_id, req.body);

      res.json({ message: "Job updated", data: updated });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ message: err.message || "Server error" });
    }
  },

  async deleteJob(req: Request, res: Response): Promise<void> {
    try {
      const job_id = Number(req.params.id);
      const company_id = (req as any).user?.company_id;

      if (!company_id) {
        res.status(403).json({ message: "Anda bukan company admin" });
        return;
      }

      await JobsService.deleteJob(job_id, company_id);
      res.json({ message: "Job deleted" });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ message: err.message || "Server error" });
    }
  },

  async publishToggle(req: Request, res: Response): Promise<void> {
    try {
      const job_id = Number(req.params.id);
      const raw = req.body.is_published;

      const publish =
        raw === true || raw === "true" || raw === 1 || raw === "1";

      const company_id = (req as any).user?.company_id;

      if (!company_id) {
        res.status(403).json({ message: "Anda bukan company admin" });
        return;
      }

      const updated = await JobsService.togglePublish(
        job_id,
        company_id,
        publish
      );

      res.json({ message: "Publish status updated", data: updated });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ message: err.message || "Server error" });
    }
  },
};
