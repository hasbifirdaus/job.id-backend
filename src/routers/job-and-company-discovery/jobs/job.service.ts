import prisma from "../../../lib/config/prisma";
import { Prisma, ContractType } from "../../../generated/prisma";
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
    contractType,
    minSalary,
    maxSalary,
  } = query;

  const { take, skip } = getPagination({
    page: Number(page),
    limit: Number(limit),
  });

  let where: Prisma.JobsWhereInput = {
    deleted_at: null,
    is_published: true,
  };

  if (title) where.title = { contains: title, mode: "insensitive" };

  if (category) {
    const categories = (category as string).split(",").map((c) => c.trim());
    where.category = { name: { in: categories, mode: "insensitive" } };
  }

  if (city) {
    const cities = (city as string).split(",").map((c) => c.trim());
    where.city = { name: { in: cities, mode: "insensitive" } };
  }

  if (province) {
    where.city = {
      province: { name: { equals: province, mode: "insensitive" } },
    };
  }

  if (tag) {
    const tags = (tag as string).split(",").map((t) => t.trim());
    where.tags = {
      some: {
        tag: { name: { in: tags, mode: "insensitive" } },
      },
    };
  }

  if (contractType) {
    const types = (contractType as string)
      .split(",")
      .map((t) => t.trim().toUpperCase() as ContractType);

    where.contract_type = { in: types };
  }

  if (minSalary !== undefined || maxSalary !== undefined) {
    where.AND = Array.isArray(where.AND) ? where.AND : [];

    if (minSalary !== undefined) {
      where.AND.push({
        max_salary: { gte: Number(minSalary) },
      });
    }

    if (maxSalary !== undefined) {
      where.AND.push({
        min_salary: { lte: Number(maxSalary) },
      });
    }
  }

  if (dateRange) {
    const now = new Date();

    if (dateRange === "7days") {
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 7);
      where.created_at = { gte: sevenDaysAgo };
    } else if (dateRange === "1month") {
      const oneMonthAgo = new Date(now);
      oneMonthAgo.setMonth(now.getMonth() - 1);
      where.created_at = { gte: oneMonthAgo };
    }
  }

  let orderBy: Prisma.JobsOrderByWithRelationInput;

  switch (sort) {
    case "highest":
      orderBy = { max_salary: "desc" };
      break;
    case "lowest":
      orderBy = { min_salary: "asc" };
      break;
    case "oldest":
      orderBy = { created_at: "asc" };
      break;
    default:
      orderBy = { created_at: "desc" };
      break;
  }

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

  return await prisma.jobs.findMany({
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
};

export const getAllCategoriesService = async () => {
  return await prisma.categories.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: { name: "asc" },
  });
};

export const getAllTagsService = async () => {
  return await prisma.tags.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: { name: "asc" },
  });
};
