import prisma from "../../lib/config/prisma";
import { sendEmail } from "../../lib/utils/sendEmail";
import { createInterviewSchema } from "../../lib/validators/interview.validation";

export const createInterview = async (data: any, companyId: number) => {
  const validData = await createInterviewSchema.validate(data, {
    abortEarly: false,
  });

  const application = await prisma.applications.findUnique({
    where: { id: validData.application_id },
    include: {
      user: true,
      job: { include: { company: true } },
    },
  });

  if (!application) throw new Error("Application not found");
  if (application.job.company_id !== companyId)
    throw new Error("Unauthorized to schedule this interview");

  const interview = await prisma.interviews.create({
    data: {
      application_id: validData.application_id,
      schedule_date: new Date(validData.schedule_date),
      interview_type: validData.interview_type,
      location: validData.location || null,
      meeting_link: validData.meeting_link || null,
      notes: validData.notes || null,
    },
  });

  await sendEmail({
    to: application.user.email,
    subject: "Interview Schedule Notification",
    html: `
      <h3>Interview Invitation</h3>
      <p>Hi ${application.user.name},</p>
      <p>Your interview for <b>${application.job.title}</b> has been scheduled on <b>${new Date(
        validData.schedule_date
      ).toLocaleString()}</b>.</p>
      <p>Type: ${validData.interview_type}</p>
      ${
        validData.interview_type === "ONLINE" ||
        validData.interview_type === "HYBRID"
          ? `<p>Meeting Link: <a href="${validData.meeting_link}">${validData.meeting_link}</a></p>`
          : ""
      }
      ${
        validData.interview_type === "OFFLINE" ||
        validData.interview_type === "HYBRID"
          ? `<p>Location: ${validData.location}</p>`
          : ""
      }
      <p>Good luck!</p>
    `,
  });

  return interview;
};

export const getInterviews = async (companyId: number) => {
  return await prisma.interviews.findMany({
    where: {
      application: {
        job: { company_id: companyId },
      },
    },
    include: {
      application: { include: { user: true, job: true } },
    },
  });
};

export const getInterviwById = async (id: number, companyId: number) => {
  const interview = await prisma.interviews.findUnique({
    where: { id },
    include: { application: { include: { user: true, job: true } } },
  });

  if (!interview) throw new Error("Interview not found");
  if (interview.application.job.company_id !== companyId)
    throw new Error("Unauthorized access");

  return interview;
};

export const updateInterview = async (
  id: number,
  data: any,
  companyId: number
) => {
  const existing = await prisma.interviews.findUnique({
    where: { id },
    include: { application: { include: { job: true } } },
  });

  if (!existing) throw new Error("Interview not found");
  if (existing.application.job.company_id !== companyId)
    throw new Error("Unauthorized to update interview");

  const updated = await prisma.interviews.update({
    where: { id },
    data,
  });

  return updated;
};

export const deleteInterview = async (id: number, companyId: number) => {
  const existing = await prisma.interviews.findUnique({
    where: { id },
    include: { application: { include: { job: true } } },
  });

  if (!existing) throw new Error("Interview not found");
  if (existing.application.job.company_id !== companyId)
    throw new Error("Unauthorized to delete interview");

  await prisma.interviews.delete({ where: { id } });

  return { message: "Interview deleted successfully" };
};
