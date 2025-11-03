import prisma from "../../lib/config/prisma";

export const applyJob = async (user_id: string, data: any) => {
  const { job_id, cv_url, cover_letter, expected_salary } = data;

  const numericJobId = Number(job_id);
  const numericSalary = Number(expected_salary);

  if (isNaN(numericJobId)) throw new Error("job_id must be a valid number");
  if (isNaN(numericSalary))
    throw new Error("expected_salary must be a valid number");

  const job = await prisma.jobs.findUnique({ where: { id: numericJobId } });
  if (!job) throw new Error("Job not found");

  const existing = await prisma.applications.findUnique({
    where: { user_id_job_id: { user_id, job_id: numericJobId } },
  });
  if (existing) throw new Error("You have already applied for this job");

  const application = await prisma.applications.create({
    data: {
      user_id,
      job_id: numericJobId,
      cv_url,
      cover_letter,
      expected_salary: numericSalary,
      status: "SUBMITTED",
    },
  });

  return application;
};

export const getUserApplications = async (user_id: string) => {
  return await prisma.applications.findMany({
    where: { user_id },
    orderBy: { created_at: "desc" },
    include: {
      job: {
        include: { company: true },
      },
    },
  });
};

export const getApplicationDetail = async (
  user_id: string,
  application_id: number
) => {
  const application = await prisma.applications.findFirst({
    where: { id: application_id, user_id },
    include: {
      job: {
        include: { company: true },
      },
      histories: true,
      interviews: true,
    },
  });

  if (!application) throw new Error("Application not found");
  return application;
};
