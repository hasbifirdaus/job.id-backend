import prisma from "../../lib/config/prisma";

export const applyJob = async (user_id: string, data: any) => {
  const {
    job_id,
    expected_salary,
    cv_url,
    cover_letter,
    cover_letter_file_url,
    extra_info,
  } = data;

  const jobId = Number(job_id);
  const salary = Number(expected_salary);

  if (isNaN(jobId)) throw new Error("job_id must be number");
  if (isNaN(salary)) throw new Error("expected_salary must be number");

  const job = await prisma.jobs.findUnique({ where: { id: jobId } });
  if (!job) throw new Error("Job not found");

  const exists = await prisma.applications.findUnique({
    where: { user_id_job_id: { user_id, job_id: jobId } },
  });

  if (exists) throw new Error("Already applied");

  return await prisma.applications.create({
    data: {
      user_id,
      job_id: jobId,
      expected_salary: salary,
      cv_url,
      cover_letter,
      cover_letter_file_url,
      extra_info,
      status: "SUBMITTED",
    },
  });
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
