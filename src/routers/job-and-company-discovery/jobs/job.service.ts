import prisma from "../../../lib/config/prisma";
import { Prisma } from "../../../generated/prisma";
import { getPagination, getPagingData } from "../../../lib/utils/pagination";

export const getJobsDiscoverService = async (query: any) => {
  const {
    page = 1,
    limit = 10,
    title,
    category,
    city,
    province,
    tag,
    dateRange,
    sort,
  } = query;

  const { take, skip } = getPagination({
    page: Number(page),
    limit: Number(limit),
  });

  const where: any = {
    deleted_at: null,
    is_published: true,
  };

  if (title) where.title = { contains: title, mode: "insensitive" };
  if (category)
    where.category = { name: { equals: category, mode: "insensitive" } };
  if (city) where.city = { name: { equals: city, mode: "insensitive" } };
  if (province)
    where.city = {
      province: { name: { equals: province, mode: "insensitive" } },
    };

  if (tag) {
    where.tags = {
      some: {
        tag: { name: { equals: tag, mode: "insensitive" } },
      },
    };
  }

  if (dateRange) {
    const now = new Date();
    if (dateRange === "7days") {
      where.created_at = { gte: new Date(now.setDate(now.getDate() - 7)) };
    } else if (dateRange === "1month") {
      where.created_at = { gte: new Date(now.setMonth(now.getMonth() - 1)) };
    }
  }

  const orderBy: Prisma.JobsOrderByWithRelationInput =
    sort === "oldest" ? { created_at: "asc" } : { created_at: "desc" };

  const [jobs, total] = await Promise.all([
    prisma.jobs.findMany({
      where,
      take,
      skip,
      orderBy,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logo_image_url: true,
            location: true,
          },
        },
        category: true,
        city: {
          include: { province: true },
        },
        tags: {
          include: { tag: true },
        },
      },
    }),
    prisma.jobs.count({ where }),
  ]);

  return getPagingData(jobs, total, Number(page), Number(limit));
};
export const getJobByIdService = async (id: number) => {
  const job = await prisma.jobs.findFirst({
    where: { id, deleted_at: null, is_published: true },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          description: true,
          logo_image_url: true,
          location: true,
        },
      },
      category: true,
      city: { include: { province: true } },
      tags: { include: { tag: true } },
    },
  });

  if (!job) throw new Error("Job not found or not published");
  return job;
};

export const getRelatedJobsService = async (id: number) => {
  const job = await prisma.jobs.findUnique({ where: { id } });
  if (!job) throw new Error("Job not found");

  const relatedJobs = await prisma.jobs.findMany({
    where: {
      company_id: job.company_id,
      id: { not: id },
      deleted_at: null,
      is_published: true,
    },
    take: 5,
    include: {
      company: { select: { id: true, name: true, logo_image_url: true } },
      category: true,
      city: true,
    },
  });

  return relatedJobs;
};
