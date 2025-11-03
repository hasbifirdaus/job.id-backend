import prisma from "../../lib/config/prisma";

//create job
export const ccreateJobService = async (company_id: number, data: any) => {
  const {
    category_id,
    city_id,
    title,
    description,
    banner_image_url,
    min_salary,
    max_salary,
    deadline,
    tags,
    is_published,
  } = data;

  if (!company_id) throw new Error("Company ID is required");

  const job = await prisma.jobs.create({
    data: {
      company_id,
      category_id,
      city_id,
      title,
      description,
      banner_image_url,

      min_salary:
        typeof min_salary === "number" ? min_salary.toString() : min_salary,
      max_salary:
        typeof max_salary === "number" ? max_salary.toString() : max_salary,
      deadline: new Date(deadline),
      is_published,
      tags:
        tags && tags.length > 0
          ? {
              create: tags.map((tag_id: number) => ({
                tag: { connect: { id: tag_id } },
              })),
            }
          : undefined,
    },
    include: {
      tags: { include: { tag: true } },
      category: true,
      city: true,
    },
  });

  return job;
};

//get all jobs
export const getAllJobsService = async (company_id: number) => {
  return prisma.jobs.findMany({
    where: {
      company_id,
      deleted_at: null,
    },
    include: {
      category: true,
      city: true,
      tags: { include: { tag: true } },
      preSelectionTest: true,
    },
  });
};

//get job detail by id
export const getJobByIdService = async (id: number, company_id: number) => {
  const job = await prisma.jobs.findFirst({
    where: { id, company_id, deleted_at: null },
    include: {
      category: true,
      city: true,
      tags: { include: { tag: true } },
      preSelectionTest: true,
      applications: { select: { id: true, user_id: true, status: true } },
    },
  });

  if (!job) throw new Error("Job not found or unauthorized.");
  return job;
};

//update job
export const updateJobService = async (
  id: number,
  company_id: number,
  data: any
) => {
  const job = await prisma.jobs.updateMany({
    where: { id, company_id, deleted_at: null },
    data,
  });

  if (job.count === 0) throw new Error("Job not found or unauthorized.");
  return job;
};

//delete job
export const deleteJobService = async (id: number, company_id: number) => {
  const deleted = await prisma.jobs.updateMany({
    where: { id, company_id },
    data: { deleted_at: new Date() },
  });
  if (deleted.count === 0) throw new Error("Job not found or unauthorized.");
  return deleted;
};
