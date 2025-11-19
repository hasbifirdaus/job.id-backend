// File: src/modules/applications/applications.service.ts
import prisma from "../../lib/config/prisma";
import { Prisma } from "@prisma/client";

// --- Fungsi Transformasi (Diletakkan di atas atau di bawah, tapi hanya satu kali) ---
function transformApplicationForFrontend(app: any) {
  let interviewDetails = undefined;
  let rejectedDetails = undefined;

  if (app.status === "INTERVIEW" && app.interviews.length > 0) {
    const latestInterview = app.interviews.sort(
      (a: any, b: any) => b.schedule_date.getTime() - a.schedule_date.getTime()
    )[0];

    if (latestInterview) {
      interviewDetails = {
        date: latestInterview.schedule_date,
        time:
          latestInterview.schedule_date.toTimeString().substring(0, 5) + " WIB",
        location:
          latestInterview.interview_type === "ONLINE"
            ? "Virtual" +
              (latestInterview.location ? ` (${latestInterview.location})` : "")
            : latestInterview.location || "Kantor Perusahaan",
        interviewer: "Admin Perusahaan (Perlu Fetch Data)",
        link: latestInterview.meeting_link,
      };
    }
  }

  if (app.status === "REJECTED") {
    const rejectionHistory = app.histories.find(
      (h: any) => h.new_status === "REJECTED"
    );
    if (rejectionHistory) {
      rejectedDetails = {
        reason: rejectionHistory.notes || "Ditolak oleh perusahaan",
        reviewNote: rejectionHistory.notes,
      };
    }
  }

  return {
    id: app.id,
    jobTitle: app.job.title,
    companyName: app.job.company.name,
    applicationDate: app.created_at,
    status: app.status,
    salaryExpectation: Number(app.expected_salary),
    jobId: app.job_id,
    statusHistory: app.histories
      .map((h: any) => ({
        date: h.changed_at,
        status: h.new_status,
        note: h.notes,
      }))
      .sort((a: any, b: any) => a.date.getTime() - b.date.getTime()),
    interviewDetails,
    rejectedDetails,
  };
}
// ----------------------------------------------------------------------------

export const applyJobService = async (userId: string, data: any) => {
  const job = await prisma.jobs.findUnique({ where: { id: data.job_id } });
  if (!job) throw new Error("Job not found");

  const existing = await prisma.applications.findUnique({
    where: {
      user_id_job_id: {
        user_id: userId,
        job_id: data.job_id,
      },
    },
  });
  if (existing) throw new Error("Anda sudah melamar pekerjaan ini");

  const application = await prisma.applications.create({
    data: {
      job_id: data.job_id,
      user_id: userId,
      expected_salary: data.expected_salary.toString(),
      cover_letter: data.cover_letter ?? null,
      cover_letter_file_url: data.cv_file_url ?? null,
      extra_info: data.extra_info ?? null,
      status: "SUBMITTED",
    },
  });

  await prisma.applicationHistories.create({
    data: {
      application_id: application.id,
      previous_status: "SUBMITTED",
      new_status: "SUBMITTED",
      notes: "Lamaran dikirim oleh pelamar",
      changed_by: userId,
    },
  });

  return application;
};

export const getUserApplicationsService = async (
  userId: string,
  query: {
    page?: number;
    limit?: number;
    status?: string | null;
  }
) => {
  // --- Perbaikan Tipe menggunakan 'any' (solusi paling aman) ---
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const where: any = { user_id: userId }; // DIPERBAIKI
  if (query.status) where.status = query.status; // ---------------------------------------------------------------
  const [total, rawItems] = await Promise.all([
    prisma.applications.count({ where }),
    prisma.applications.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { created_at: "desc" },
      include: {
        job: {
          include: { company: true },
        },
        histories: { orderBy: { changed_at: "asc" } },
        interviews: true,
      },
    }),
  ]);
  const items = rawItems.map(transformApplicationForFrontend);

  return {
    total,
    page,
    limit,
    items,
  };
};

export const getApplicationByIdService = async (
  user: { id: string; role: string; company_id?: number },
  applicationId: number
) => {
  const app = await prisma.applications.findUnique({
    where: { id: applicationId },
    include: {
      job: { include: { company: true } },
      histories: { orderBy: { changed_at: "asc" } },
      interviews: true,
      user: true,
    },
  });
  if (!app) throw new Error("Application not found");

  if (user.role === "COMPANY_ADMIN") {
    if (!user.company_id || user.company_id !== app.job.company_id) {
      throw new Error("Forbidden");
    }
  } else {
    if (app.user_id !== user.id) throw new Error("Forbidden");
  }

  return transformApplicationForFrontend(app);
};

export const withdrawApplicationService = async (
  userId: string,
  applicationId: number
) => {
  const app = await prisma.applications.findUnique({
    where: { id: applicationId },
  });
  if (!app) throw new Error("Application not found");
  if (app.user_id !== userId) throw new Error("Forbidden");

  await prisma.applicationHistories.create({
    data: {
      application_id: app.id,
      previous_status: app.status,
      new_status: "REJECTED",
      notes: "Withdrawn by applicant",
      changed_by: userId,
    },
  });

  await prisma.applications.delete({ where: { id: app.id } });

  return { success: true };
};

export const listApplicationsForJobService = async (
  companyId: number,
  jobId: number,
  query: { page?: number; limit?: number; status?: string | null }
) => {
  // verify job belongs to company
  const job = await prisma.jobs.findUnique({ where: { id: jobId } });
  if (!job || job.company_id !== companyId)
    throw new Error("Job not found or not owned by company");

  const page = query.page ?? 1;
  const limit = query.limit ?? 20; // --- Perbaikan Tipe menggunakan 'any' (solusi paling aman) ---
  const where: any = { job_id: jobId }; // DIPERBAIKI
  if (query.status) where.status = query.status; // ---------------------------------------------------------------
  const [total, items] = await Promise.all([
    prisma.applications.count({ where }),
    prisma.applications.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { created_at: "desc" },
      include: { user: true, histories: true, interviews: true },
    }),
  ]);

  return { total, page, limit, items };
};

export const updateApplicationStatusService = async (
  companyId: number,
  applicationId: number,
  data: {
    status: string;
    feedback?: string | null;
    changedBy: string;
    rejectedReason?: string | null;
  }
) => {
  // fetch application with job
  const app = await prisma.applications.findUnique({
    where: { id: applicationId },
    include: { job: true },
  });
  if (!app) throw new Error("Application not found");
  if (app.job.company_id !== companyId) throw new Error("Forbidden");

  const previous = app.status;
  const updated = await prisma.applications.update({
    where: { id: applicationId },
    data: {
      status: data.status as any,
      feedback: data.feedback ?? null,
    },
  });

  await prisma.applicationHistories.create({
    data: {
      application_id: applicationId,
      previous_status: previous as any,
      new_status: data.status as any,
      notes:
        data.rejectedReason ??
        data.feedback ??
        `Status changed to ${data.status}`,
      changed_by: data.changedBy,
    },
  });

  return updated;
};
