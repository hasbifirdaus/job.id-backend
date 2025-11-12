import prisma from "../../../lib/config/prisma";
import { getPagination, getPagingData } from "../../../lib/utils/pagination";
import { Prisma } from "../../../generated/prisma";

export const getCompaniesDiscoverService = async (query: any) => {
  const { page = 1, limit = 10, name, city, province, tag, sort } = query;

  const { take, skip } = getPagination({
    page: Number(page),
    limit: Number(limit),
  });

  const where: any = { deleted_at: null };

  if (name) where.name = { contains: name, mode: "insensitive" };
  if (city) where.location = { contains: city, mode: "insensitive" };

  if (province) {
    where.jobs = {
      some: {
        city: { province: { name: { equals: province, mode: "insensitive" } } },
      },
    };
  }

  if (tag) {
    where.tags = {
      some: {
        tag: { name: { equals: tag, mode: "insensitive" } },
      },
    };
  }

  // ✅ FIX orderBy menggunakan Prisma.SortOrder
  const orderBy: Prisma.CompaniesOrderByWithRelationInput = {
    name: sort === "name_desc" ? Prisma.SortOrder.desc : Prisma.SortOrder.asc,
  };

  const [companies, total] = await Promise.all([
    prisma.companies.findMany({
      where,
      take,
      skip,
      orderBy,
      include: {
        socials: true,
        tags: { include: { tag: true } },
        jobs: {
          where: { is_published: true },
          include: {
            city: { include: { province: true } },
            category: true,
          },
        },
      },
    }),
    prisma.companies.count({ where }),
  ]);

  return getPagingData(companies, total, Number(page), Number(limit));
};

export const getCompanyByIdService = async (id: number) => {
  const company = await prisma.companies.findFirst({
    where: { id, deleted_at: null },
    include: {
      socials: true,
      tags: { include: { tag: true } },
      jobs: {
        where: { deleted_at: null, is_published: true },
        include: {
          category: true,
          city: { include: { province: true } },
        },
      },
    },
  });

  if (!company) throw new Error("Company not found");
  return company;
};
