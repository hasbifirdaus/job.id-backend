import prisma from "../../lib/config/prisma";
import { ApplicationStatus } from "../../generated/prisma";

export const findApplicantsByJob = async (
  jobId: number,
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
        },
      },
    },
    orderBy: { created_at: "asc" },
  });

  const now = new Date();
  return applicants.filter((app) => {
    if (!app.user.dob) return true;
    const age = now.getFullYear() - app.user.dob.getFullYear();
    if (minAge && age < minAge) return false;
    if (maxAge && age > maxAge) return false;
    return true;
  });
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
