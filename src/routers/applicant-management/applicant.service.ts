import prisma from "../../lib/config/prisma";
import { ApplicationStatus } from "../../generated/prisma";

export const findApplicantsByJob = async (
  jobId: number,
  page: number = 1,
  limit: number = 10,
  sortKey:
    | "created_at"
    | "user_name"
    | "user_dob"
    | "expected_salary" = "created_at",
  sortOrder: "asc" | "desc" = "asc",
  name?: string,
  minAge?: number,
  maxAge?: number,
  education?: string,
  expectedSalary?: number
) => {
  const now = new Date();

  // Hitung date boundary untuk filter usia di Prisma

  let dobFilter: { gte?: Date; lte?: Date } = {};
  if (minAge !== undefined) {
    // max date of birth = today - minAge
    dobFilter.lte = new Date(
      now.getFullYear() - minAge,
      now.getMonth(),
      now.getDate()
    );
  }
  if (maxAge !== undefined) {
    // min date of birth = today - maxAge
    dobFilter.gte = new Date(
      now.getFullYear() - maxAge,
      now.getMonth(),
      now.getDate()
    );
  }

  // Where clause
  const whereClause: any = {
    job_id: jobId,
    user: {},
  };

  if (name) whereClause.user.name = { contains: name, mode: "insensitive" };
  if (education)
    whereClause.user.education = { contains: education, mode: "insensitive" };
  if (minAge !== undefined || maxAge !== undefined)
    whereClause.user.dob = dobFilter;
  if (expectedSalary !== undefined)
    whereClause.expected_salary = { lte: expectedSalary };

  // OrderBy
  let orderByClause: any = {};
  switch (sortKey) {
    case "user_name":
      orderByClause = { user: { name: sortOrder } };
      break;
    case "user_dob":
      orderByClause = { user: { dob: sortOrder } };
      break;
    case "expected_salary":
      orderByClause = { expected_salary: sortOrder };
      break;
    default:
      orderByClause = { created_at: sortOrder };
  }

  const skip = (page - 1) * limit;
  const take = limit;

  // Query data dan total
  const [applicants, total] = await Promise.all([
    prisma.applications.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            dob: true,
            education: true,
            profile_image_url: true,
            address: true,
            gender: true,
          },
        },
      },
      orderBy: orderByClause,
      skip,
      take,
    }),
    prisma.applications.count({ where: whereClause }),
  ]);

  return { applicants, total };
};

export const findApplicationDetail = async (id: number) => {
  return prisma.applications.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          dob: true,
          education: true,
          address: true,
          gender: true,
          profile_image_url: true,
        },
      },
      job: {
        select: {
          id: true,
          title: true,
          company: { select: { name: true, logo_image_url: true } },
        },
      },
    },
  });
};

// ==========================
// Helper mapping frontend -> Prisma enum
// ==========================
const mapFrontendStatusToPrisma = (
  frontendStatus: string
): ApplicationStatus => {
  switch (frontendStatus) {
    case "APPLIED":
      return ApplicationStatus.SUBMITTED;
    case "PROCESSED":
      return ApplicationStatus.REVIEWED;
    case "INTERVIEWED":
      return ApplicationStatus.INTERVIEW;
    case "ACCEPTED":
      return ApplicationStatus.ACCEPTED;
    case "REJECTED":
      return ApplicationStatus.REJECTED;
    default:
      throw new Error(`Invalid status mapping: ${frontendStatus}`);
  }
};

export const changeApplicationStatus = async (
  id: number,
  frontendStatus: string, // frontend status string
  adminId: string,
  notes?: string
) => {
  const application = await prisma.applications.findUnique({ where: { id } });
  if (!application) throw new Error("Application not found");

  const prismaStatus = mapFrontendStatusToPrisma(frontendStatus);

  const updated = await prisma.applications.update({
    where: { id },
    data: { status: prismaStatus },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          dob: true,
          education: true,
          profile_image_url: true,
          address: true,
          gender: true,
        },
      },
    },
  });

  await prisma.applicationHistories.create({
    data: {
      application_id: id,
      previous_status: application.status,
      new_status: prismaStatus,
      changed_by: adminId,
      notes,
    },
  });

  return updated;
};

export const getCvPathByApplicationId = async (
  applicationId: number
): Promise<string | null> => {
  const application = await prisma.applications.findUnique({
    where: { id: applicationId },
    select: { cv_url: true },
  });
  return application?.cv_url || null;
};
