import {
  createInterviewSchema,
  createBulkInterviewSchema,
  updateInterviewSchema,
} from "./interview.validation";
import {
  findApplicationWithJobAndUser,
  createInterview as repoCreateInterview,
  createInterviewsTransactional,
  findInterviewsByCompany,
  findInterviewById,
  updateInterviewById,
  deleteInterviewById,
  findInterviewsForDateRange,
} from "./interview.repository";
import {
  sendInterviewNotificationToApplicant,
  sendInterviewUpdatedNotificationToApplicant,
  sendAdminReminderEmails,
  sendInterviewReminderToApplicant,
} from "./interview.email";
import {
  BulkScheduleInput,
  InterviewScheduleInput,
} from "../../types/interview.types";

/**
 * Create single interview (keeps existing behavior; send email after creation)
 */
export const createInterview = async (data: any, companyId: number) => {
  const valid = (await createInterviewSchema.validate(data, {
    abortEarly: false,
  })) as InterviewScheduleInput;

  const application = await findApplicationWithJobAndUser(valid.application_id);
  if (!application) throw new Error("Application not found");
  if (application.job.company_id !== companyId) throw new Error("Unauthorized");

  // Repository expects schedule_date as string -> send ISO string
  const payload: {
    application_id: number;
    schedule_date: string;
    interview_type: string;
    meeting_link?: string | null;
    location?: string | null;
    notes?: string | null;
  } = {
    application_id: Number(valid.application_id),
    schedule_date: new Date(valid.schedule_date).toISOString(),
    interview_type: String(valid.interview_type),
    meeting_link: valid.meeting_link ?? null,
    location: valid.location ?? null,
    notes: valid.notes ?? null,
  };

  const created = await repoCreateInterview(payload);

  // send email expects Date -> convert back
  try {
    await sendInterviewNotificationToApplicant({
      user: application.user,
      job: application.job,
      schedule_date: new Date(created.schedule_date),
      interview_type: created.interview_type,
      meeting_link: created.meeting_link,
      location: created.location,
    });
  } catch (err) {
    console.error("send email failed:", err);
  }

  return created;
};

/**
 * Bulk create - TRANSACTIONAL (all-or-nothing).
 * Steps:
 *  1) validate body
 *  2) ensure every application exists and belongs to company (pre-check).
 *  3) create all interviews inside prisma.$transaction
 *  4) after transaction success, send emails (non-blocking; errors caught individually)
 */
export const createBulkInterviews = async (data: any, companyId: number) => {
  // FIX: Yup output → cast ke any terlebih dahulu
  const valid = (await createBulkInterviewSchema.validate(data, {
    abortEarly: false,
  })) as BulkScheduleInput;

  const applicationIds = valid.schedules.map((s: any) => s.application_id);
  const uniqueAppIds = Array.from(new Set(applicationIds));

  const applications = await Promise.all(
    uniqueAppIds.map((id) => findApplicationWithJobAndUser(id))
  );

  const missing = uniqueAppIds.filter(
    (id) => !applications.find((a) => a?.id === id)
  );
  if (missing.length > 0)
    throw new Error(`Applications not found: ${missing.join(", ")}`);

  const notAuthorized = applications.filter(
    (a) => a!.job.company_id !== companyId
  );
  if (notAuthorized.length > 0) {
    const ids = notAuthorized.map((a) => a!.id).join(", ");
    throw new Error(`Unauthorized to schedule interviews for: ${ids}`);
  }
  const normalizedSchedules: InterviewScheduleInput[] = valid.schedules.map(
    (s) => ({
      application_id: s.application_id,
      schedule_date: new Date(s.schedule_date).toISOString(),
      interview_type: s.interview_type,
      meeting_link: s.meeting_link ?? null,
      location: s.location ?? null,
      notes: s.notes ?? null,
    })
  );

  const created = await createInterviewsTransactional(normalizedSchedules);
  const emailPromises = created.map((interview) =>
    sendInterviewNotificationToApplicant({
      user: interview.application.user,
      job: interview.application.job,
      schedule_date: new Date(interview.schedule_date),
      interview_type: interview.interview_type,
      meeting_link: interview.meeting_link,
      location: interview.location,
    }).catch((err) => {
      console.error(`Failed sending email for interview ${interview.id}:`, err);
      return null;
    })
  );
  await Promise.all(emailPromises);
  return created;
};

export const getInterviews = (companyId: number) =>
  findInterviewsByCompany(companyId);

/** fixed export name spelling */
export const getInterviewById = async (id: number, companyId: number) => {
  const interview = await findInterviewById(id);
  if (!interview) throw new Error("Interview not found");
  if (interview.application.job.company_id !== companyId)
    throw new Error("Unauthorized");
  return interview;
};

export const updateInterview = async (
  id: number,
  data: any,
  companyId: number
) => {
  await updateInterviewSchema.validate(data, { abortEarly: false });

  const existing = await findInterviewById(id);
  if (!existing) throw new Error("Interview not found");
  if (existing.application.job.company_id !== companyId)
    throw new Error("Unauthorized");

  const newType = data.interview_type ?? existing.interview_type;
  const newMeetingLink = data.meeting_link ?? existing.meeting_link;
  const newLocation = data.location ?? existing.location;

  // server-side enforcement
  if (newType === "ONLINE" && !newMeetingLink)
    throw new Error("Meeting link is required for ONLINE");
  if (newType === "OFFLINE" && !newLocation)
    throw new Error("Location is required for OFFLINE");
  if (newType === "HYBRID" && (!newMeetingLink || !newLocation))
    throw new Error("Both meeting_link and location are required for HYBRID");

  // IMPORTANT: repository expects schedule_date as string (will convert to Date internally)
  const updatePayload: any = {
    ...data,
    schedule_date: data.schedule_date
      ? new Date(data.schedule_date).toISOString()
      : undefined,
  };

  const updated = await updateInterviewById(id, updatePayload);

  // determine relevant changes to notify applicant
  const isoExisting = existing.schedule_date
    ? new Date(existing.schedule_date).getTime()
    : null;

  const isoNew = data.schedule_date
    ? new Date(data.schedule_date).getTime()
    : null;

  const changedSchedule =
    isoNew !== null && isoExisting !== null && isoNew !== isoExisting;

  const changed =
    changedSchedule ||
    (data.interview_type && data.interview_type !== existing.interview_type) ||
    (data.meeting_link && data.meeting_link !== existing.meeting_link) ||
    (data.location && data.location !== existing.location);

  if (changed) {
    try {
      await sendInterviewUpdatedNotificationToApplicant({
        user: existing.application.user,
        job: existing.application.job,
        schedule_date: new Date(updated.schedule_date),
        interview_type: updated.interview_type,
        meeting_link: updated.meeting_link,
        location: updated.location,
      });
    } catch (err) {
      console.error("Failed to send update email:", err);
    }
  }

  return updated;
};

export const deleteInterview = async (id: number, companyId: number) => {
  const existing = await findInterviewById(id);
  if (!existing) throw new Error("Interview not found");
  if (existing.application.job.company_id !== companyId)
    throw new Error("Unauthorized");

  await deleteInterviewById(id);
  return { message: "Interview deleted successfully" };
};

/**
 * Reminder sending - used by cron module
 * Exposed separately so cron can safely call it after acquiring advisory lock
 */
export const sendRemindersForDateRange = async (start: Date, end: Date) => {
  const interviews = await findInterviewsForDateRange(start, end);

  if (!interviews || interviews.length === 0) return { count: 0 };

  const sendPromises: Promise<any>[] = [];

  for (const interview of interviews) {
    try {
      const { application } = interview;
      const { user, job } = application;

      const interviewDateStr = new Date(interview.schedule_date).toLocaleString(
        "id-ID",
        {
          dateStyle: "full",
          timeStyle: "short",
        }
      );

      // Applicant REMINDER email
      sendPromises.push(
        sendInterviewReminderToApplicant({
          user,
          job,
          schedule_date: new Date(interview.schedule_date),
          interview_type: interview.interview_type,
          meeting_link: interview.meeting_link ?? "",
          location: interview.location ?? "",
        }).catch((err) => {
          console.error("Failed applicant reminder:", err);
        })
      );

      // Admin reminders
      const company = job.company;
      const adminEmails = (company.admins || [])
        .map((a: any) => a.user?.email)
        .filter(Boolean);

      sendPromises.push(
        sendAdminReminderEmails({
          companyEmail: company.email,
          adminEmails,
          jobTitle: job.title,
          companyName: company.name,
          candidateName: user.name,
          interviewDateStr: new Date(interview.schedule_date).toLocaleString(
            "id-ID",
            {
              dateStyle: "full",
              timeStyle: "short",
            }
          ),
        }).catch((err) => {
          console.error("Failed admin reminders:", err);
        })
      );
    } catch (err) {
      console.error("Error preparing reminder for interview:", err);
    }
  }

  await Promise.all(sendPromises);
  return { count: interviews.length };
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const sendReminderById = async (
  interviewId: number,
  companyId: number
) => {
  const interview = await findInterviewById(interviewId);

  if (!interview) {
    throw new Error("Interview not found");
  }

  const { application } = interview;
  if (
    !application ||
    !application.user ||
    !application.job ||
    !application.job.company
  ) {
    throw new Error("Related data for interview is missing");
  }

  if (application.job.company.id !== companyId) {
    throw new Error("Not authorized to send reminder for this interview");
  }

  // --- Kandidat email ---
  const userEmail =
    application.user.email || application.extra_info?.email || null;
  if (!userEmail) {
    console.warn(
      `[InterviewReminder] No email found for user ${application.user.id}`
    );
  }

  try {
    console.log(
      `[InterviewReminder] Sending reminder to candidate ${userEmail}`
    );
    await sendInterviewReminderToApplicant({
      user: { ...application.user, email: userEmail },
      job: application.job,
      schedule_date: new Date(interview.schedule_date),
      interview_type: interview.interview_type,
      meeting_link: interview.meeting_link || "",
      location: interview.location || "",
    });
    console.log(`[InterviewReminder] Candidate reminder sent`);
  } catch (err) {
    console.error(`[InterviewReminder] Failed sending candidate email:`, err);
  }

  await delay(5000);

  // --- Admin emails ---
  const company = application.job.company;
  const adminEmails = (company.admins || [])
    .map((a: any) => a.user?.email)
    .filter(Boolean);

  if (adminEmails.length > 0) {
    try {
      console.log(
        `[InterviewReminder] Sending reminder to admins: ${adminEmails.join(
          ", "
        )}`
      );
      await sendAdminReminderEmails({
        companyEmail: company.email,
        adminEmails,
        jobTitle: application.job.title,
        companyName: company.name,
        candidateName: application.user.name,
        interviewDateStr: new Date(interview.schedule_date).toLocaleString(
          "id-ID",
          { dateStyle: "full", timeStyle: "short" }
        ),
      });
      console.log(`[InterviewReminder] Admin reminders sent`);
    } catch (err) {
      console.error(`[InterviewReminder] Failed sending admin emails:`, err);
    }
  } else {
    console.log(
      `[InterviewReminder] No admins found for company ${company.id}`
    );
  }

  return { success: true };
};
