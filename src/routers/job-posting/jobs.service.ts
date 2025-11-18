// FILE: jobs.service.ts

import { Decimal } from "@prisma/client/runtime/library";
import prisma from "../../lib/config/prisma";
import { ContractType } from "../../generated/prisma"; // << WAJIB

// =====================
// TYPES
// =====================
export type CreateJobInput = {
  title: string;
  description: string;
  banner_image_url?: string | null;
  category_id: number;
  city_id: number;
  min_salary?: number;
  max_salary?: number;
  deadline: string;
  is_published?: boolean;
  tags?: string[];
  contract_type?: ContractType; // << ENUM, FIXED
  company_id?: number;
};

// =====================
// JOBS SERVICE
// =====================
export const JobsService = {
  // ============================================================
  // CREATE JOB
  // ============================================================
  async createJob(input: CreateJobInput) {
    if (!input.company_id) throw new Error("company_id is required");

    const {
      title,
      description,
      banner_image_url,
      category_id,
      city_id,
      min_salary = 0,
      max_salary = 0,
      deadline,
      is_published = false,
      tags = [],
      contract_type = ContractType.FULL_TIME,
      company_id,
    } = input;

    const [categoryExists, cityExists] = await Promise.all([
      prisma.categories.findUnique({ where: { id: category_id } }),
      prisma.cities.findUnique({ where: { id: city_id } }),
    ]);

    if (!categoryExists) {
      throw new Error(`Category ID ${category_id} not found.`);
    }
    if (!cityExists) {
      throw new Error(`City ID ${city_id} not found.`);
    }

    // ---- CREATE JOB ----
    const job = await prisma.jobs.create({
      data: {
        company_id,
        category_id,
        city_id,
        title,
        description,
        banner_image_url: banner_image_url || null,
        min_salary: new Decimal(min_salary),
        max_salary: new Decimal(max_salary),
        deadline: new Date(deadline),
        is_published,
        contract_type, // << NOW ENUM, FIXED
      },
    });

    // ---- HANDLE TAGS ----
    if (tags.length > 0) {
      await this._saveJobTags(job.id, tags);
    }

    return job;
  },

  // ============================================================
  // PRIVATE: SAVE/UPDATE TAGS
  // ============================================================
  async _saveJobTags(job_id: number, tags: string[]) {
    for (const tagName of tags) {
      const cleanName = tagName.trim().toLowerCase();

      const tag = await prisma.tags.upsert({
        where: { name: cleanName },
        update: {},
        create: { name: cleanName },
      });

      await prisma.jobTags
        .create({
          data: { job_id, tag_id: tag.id },
        })
        .catch(() => {});
    }
  },

  // ============================================================
  // GET JOB LIST
  // ============================================================
  async getJobList(params: {
    // Ubah menjadi menerima satu objek params
    company_id: number;
    q?: string;
    category_id?: number;
    is_published?: boolean;
    sortBy?: "created_at" | "title" | "deadline";
    sortDir?: "asc" | "desc";
    page?: number;
    perPage?: number;
  }) {
    // === PERBAIKAN: Destructuring semua properti dari objek params ===
    const {
      company_id,
      q,
      category_id,
      is_published, // PASTIKAN is_published diambil di sini!
      sortBy = "created_at",
      sortDir = "desc",
      page = 1,
      perPage = 20,
    } = params;
    // ================================================================

    const where: any = { company_id, deleted_at: null };

    if (q) where.title = { contains: q, mode: "insensitive" };
    if (category_id) where.category_id = category_id;

    // Baris ini akan bekerja karena is_published sekarang terdefinisi.
    if (typeof is_published === "boolean") where.is_published = is_published;

    const skip = (page - 1) * perPage;

    const [total, items] = await Promise.all([
      prisma.jobs.count({ where }),
      prisma.jobs.findMany({
        where,
        include: {
          _count: { select: { applications: true } },
          tags: { include: { tag: true } },
          category: true,
          city: true,
        },
        orderBy: { [sortBy]: sortDir },
        skip,
        take: perPage,
      }),
    ]);

    return { total, page, perPage, items };
  },

  // ============================================================
  // GET JOB DETAIL
  // ============================================================
  async getJobById(job_id: number, company_id?: number) {
    const where: any = { id: job_id, deleted_at: null };
    if (company_id) where.company_id = company_id;

    return prisma.jobs.findFirst({
      where,
      include: {
        applications: { include: { user: true } },
        tags: { include: { tag: true } },
        category: true,
        city: true,
        company: true,
        _count: { select: { applications: true } },
      },
    });
  },

  // ============================================================
  // UPDATE JOB
  // ============================================================
  async updateJob(
    job_id: number,
    company_id: number,
    payload: Partial<CreateJobInput>
  ) {
    const job = await prisma.jobs.findUnique({ where: { id: job_id } });

    if (!job || job.company_id !== company_id) {
      throw new Error("Job not found or not owned by company");
    }

    const data: any = {};

    if (payload.title !== undefined) data.title = payload.title;
    if (payload.description !== undefined)
      data.description = payload.description;

    if (payload.banner_image_url !== undefined)
      data.banner_image_url = payload.banner_image_url;

    if (payload.category_id !== undefined)
      data.category_id = payload.category_id;

    if (payload.city_id !== undefined) data.city_id = payload.city_id;

    if (payload.min_salary !== undefined)
      data.min_salary = new Decimal(payload.min_salary);

    if (payload.max_salary !== undefined)
      data.max_salary = new Decimal(payload.max_salary);

    if (payload.deadline !== undefined)
      data.deadline = new Date(payload.deadline);

    if (typeof payload.is_published === "boolean")
      data.is_published = payload.is_published;

    if (payload.contract_type !== undefined)
      data.contract_type = payload.contract_type; // << ENUM, FIXED

    const updatedJob = await prisma.jobs.update({
      where: { id: job_id },
      data,
    });

    if (payload.tags) {
      await prisma.jobTags.deleteMany({ where: { job_id } });
      await this._saveJobTags(job_id, payload.tags);
    }

    return updatedJob;
  },

  // ============================================================
  // SOFT DELETE JOB
  // ============================================================
  async deleteJob(job_id: number, company_id: number) {
    const job = await prisma.jobs.findUnique({ where: { id: job_id } });

    if (!job || job.company_id !== company_id) {
      throw new Error("Job not found or not owned by company");
    }

    return prisma.jobs.update({
      where: { id: job_id },
      data: { deleted_at: new Date() },
    });
  },

  // ============================================================
  // TOGGLE PUBLISH
  // ============================================================
  async togglePublish(job_id: number, company_id: number, publish: boolean) {
    const job = await prisma.jobs.findUnique({ where: { id: job_id } });

    if (!job || job.company_id !== company_id) {
      throw new Error("Job not found or not owned by company");
    }

    return prisma.jobs.update({
      where: { id: job_id },
      data: { is_published: publish },
    });
  },
};
