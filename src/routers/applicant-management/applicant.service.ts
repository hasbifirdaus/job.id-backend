import prisma from "../../lib/config/prisma";
import { ApplicationStatus } from "../../generated/prisma";

export const findApplicantsByJob = async (
  jobId: number,
  page: number = 1,
  limit: number = 10,
  sortKey: string = "created_at",
  sortOrder: "asc" | "desc" = "asc",
  name?: string,
  minAge?: number,
  maxAge?: number,
  education?: string,
  expectedSalary?: number
) => {
  const whereClause: any = {
    job_id: jobId,
    user: {},
  };

  if (name) whereClause.user.name = { contains: name, mode: "insensitive" };
  if (education)
    whereClause.user.education = { contains: education, mode: "insensitive" };
  if (expectedSalary) whereClause.expected_salary = { lte: expectedSalary };

  const skip = (page - 1) * limit;
  const take = limit;

  const applicants = await prisma.applications.findMany({
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
    orderBy: { [sortKey]: sortOrder },
    skip,
    take,
  });

  const now = new Date();
  const filteredByAge = applicants.filter((app) => {
    if (!app.user?.dob) return true;
    const age = now.getFullYear() - app.user.dob.getFullYear();
    if (minAge && age < minAge) return false;
    if (maxAge && age > maxAge) return false;
    return true;
  });

  const total = await prisma.applications.count({ where: whereClause });

  return { applicants: filteredByAge, total };
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

export const changeApplicationStatus = async (
  id: number,
  newStatus: ApplicationStatus,
  adminId: string,
  notes?: string
) => {
  const application = await prisma.applications.findUnique({ where: { id } });
  if (!application) throw new Error("Application not found");

  const updated = await prisma.applications.update({
    where: { id },
    data: { status: newStatus },
  });

  await prisma.applicationHistories.create({
    data: {
      application_id: id,
      previous_status: application.status,
      new_status: newStatus,
      changed_by: adminId,
      notes,
    },
  });
  return updated;
};
