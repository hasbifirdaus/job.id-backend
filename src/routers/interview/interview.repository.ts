import prisma from "../../lib/config/prisma";
import {
  InterviewScheduleInput,
  InterviewUpdateInput,
  InterviewType,
} from "../../types/interview.types";

// ENUM
export enum InterviewTypeEnum {
  ONLINE = "ONLINE",
  OFFLINE = "OFFLINE",
  HYBRID = "HYBRID",
}

// Converter
const toInterviewType = (
  value: string | InterviewTypeEnum
): InterviewTypeEnum => {
  const v = String(value).toUpperCase();
  switch (v) {
    case "ONLINE":
      return InterviewTypeEnum.ONLINE;
    case "OFFLINE":
      return InterviewTypeEnum.OFFLINE;
    case "HYBRID":
      return InterviewTypeEnum.HYBRID;
    default:
      throw new Error(
        `Invalid interview_type: ${value}. Allowed: ONLINE | OFFLINE | HYBRID`
      );
  }
};

/* ---------------------------
   UTILITY: normalize date
--------------------------- */
const normalizeInterview = (interview: any) => {
  if (!interview) return interview;
  return {
    ...interview,
    schedule_date: interview.schedule_date
      ? new Date(interview.schedule_date).toISOString()
      : null,
    created_at: interview.created_at
      ? new Date(interview.created_at).toISOString()
      : null,
    updated_at: interview.updated_at
      ? new Date(interview.updated_at).toISOString()
      : null,
  };
};

/* ---------------------------
   FIND APPLICATION
--------------------------- */
export const findApplicationWithJobAndUser = (application_id: number) =>
  prisma.applications.findUnique({
    where: { id: application_id },
    include: { user: true, job: { include: { company: true } } },
  });

/* ---------------------------
   CREATE SINGLE INTERVIEW
--------------------------- */
export const createInterview = async (payload: {
  application_id: number;
  schedule_date: string;
  interview_type: string | InterviewType;
  meeting_link?: string | null;
  location?: string | null;
  notes?: string | null;
}) => {
  const created = await prisma.interviews.create({
    data: {
      application_id: payload.application_id,
      schedule_date: new Date(payload.schedule_date),
      interview_type: toInterviewType(payload.interview_type),
      meeting_link: payload.meeting_link ?? null,
      location: payload.location ?? null,
      notes: payload.notes ?? null,
    },
    include: {
      application: {
        include: {
          user: true,
          job: true,
        },
      },
    },
  });

  return normalizeInterview(created);
};

/* ---------------------------
   BULK CREATE (TRANSACTION)
--------------------------- */
export const createInterviewsTransactional = async (
  schedules: InterviewScheduleInput[]
) => {
  const ops = schedules.map((s) =>
    prisma.interviews.create({
      data: {
        application_id: s.application_id,
        schedule_date: new Date(s.schedule_date),
        interview_type: toInterviewType(s.interview_type),
        meeting_link: s.meeting_link ?? null,
        location: s.location ?? null,
        notes: s.notes ?? null,
      },
      include: {
        application: {
          include: {
            user: true,
            job: { include: { company: true } },
          },
        },
      },
    })
  );

  const results = await prisma.$transaction(ops);
  return results.map(normalizeInterview);
};

/* ---------------------------
   FIND BY COMPANY
--------------------------- */
export const findInterviewsByCompany = async (companyId: number) => {
  const results = await prisma.interviews.findMany({
    where: { application: { job: { company_id: companyId } } },
    include: { application: { include: { user: true, job: true } } },
  });

  return results.map(normalizeInterview);
};

/* ---------------------------
   FIND BY ID
--------------------------- */
export const findInterviewById = async (id: number) => {
  const interview = await prisma.interviews.findFirst({
    where: {
      id,
      deleted_at: null,
    },
    include: {
      application: {
        include: {
          user: true,
          job: {
            include: {
              company: {
                include: {
                  admins: {
                    include: {
                      user: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  // jika interview tidak ada
  if (!interview) return null;

  // manual check deleted_at menggunakan any (karena TS tidak mengenalinya)
  const app: any = interview.application;
  if (
    !app ||
    app.deleted_at ||
    app.job.deleted_at ||
    app.job.company.deleted_at
  ) {
    return null;
  }

  return normalizeInterview(interview);
};

/* ---------------------------
   UPDATE INTERVIEW
--------------------------- */
export const updateInterviewById = async (
  id: number,
  data: InterviewUpdateInput
) => {
  const payload: any = { ...data };

  if (payload.interview_type !== undefined) {
    payload.interview_type = toInterviewType(payload.interview_type);
  }

  if (payload.schedule_date) {
    payload.schedule_date = new Date(payload.schedule_date);
  }

  const updated = await prisma.interviews.update({
    where: { id },
    data: payload,
    include: {
      application: { include: { user: true, job: true } },
    },
  });

  return normalizeInterview(updated);
};

/* ---------------------------
   DELETE
--------------------------- */
export const deleteInterviewById = async (id: number) => {
  const deleted = await prisma.interviews.delete({ where: { id } });
  return normalizeInterview(deleted);
};

/* ---------------------------
   FIND BY RANGE (CRON)
--------------------------- */
export const findInterviewsForDateRange = async (start: Date, end: Date) => {
  const results = await prisma.interviews.findMany({
    where: {
      schedule_date: { gte: start, lte: end },
      application: {
        job: {
          company_id: { not: undefined },
        },
      },
    },
    include: {
      application: {
        include: {
          user: true,
          job: {
            include: {
              company: {
                include: { admins: { include: { user: true } } },
              },
            },
          },
        },
      },
    },
  });

  return results.map(normalizeInterview);
};

/* ---------------------------
   PG ADVISORY LOCK
--------------------------- */
interface AdvisoryLockResult {
  locked: boolean;
}

export const tryAcquireAdvisoryLock = async (key: number): Promise<boolean> => {
  const res = await prisma.$queryRaw<AdvisoryLockResult[]>`
    SELECT pg_try_advisory_lock(${key}) AS locked
  `;

  return Array.isArray(res) && res.length > 0 ? Boolean(res[0].locked) : false;
};

export const releaseAdvisoryLock = async (key: number): Promise<void> => {
  await prisma.$queryRaw`
    SELECT pg_advisory_unlock(${key}) AS unlocked
  `;
};
